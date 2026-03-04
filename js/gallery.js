/* ========================================
   GESTÃO DA GALERIA
   ======================================== */

class Gallery {
    constructor() {
        this.galleryContainer = document.getElementById('gallery');
        this.loadingElement = document.getElementById('loading');
        this.errorElement = document.getElementById('error');
        this.emptyElement = document.getElementById('empty');
        this.modalElement = document.getElementById('modal');

        // dados brutos e visualizados (após filtro/pesquisa)
        this.images = [];
        this.viewImages = [];
        this.currentFilter = 'todos';
        this.currentSearch = '';

        // paginação
        this.limit = 12;             // imagens por página (reduzido para melhor performance)
        this.offset = 0;             // próximo offset a carregar
        this.loadingMore = false;    // controla scroll infinito
        this.cacheKey = 'gallery_cache';
        this.cacheExpiry = 3600000;  // 1 hora em ms

        this.init();
    }

    /**
     * Inicializa a galeria
     */
    init() {
        this.setupEventListeners();
        this.loadImages();
    }

    /**
     * Configura os ouvintes de eventos
     */
    setupEventListeners() {
        // Fechar modal
        const closeModal = document.querySelector('.close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeModal());
        }

        // Fechar modal ao clicar fora da imagem
        this.modalElement.addEventListener('click', (e) => {
            if (e.target === this.modalElement) {
                this.closeModal();
            }
        });

        // Fechar modal com tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modalElement.style.display !== 'none') {
                this.closeModal();
            }
        });
    }

    /**
     * Carrega as imagens do Supabase com suporte a cache
     */
    async loadImages() {
        try {
            // Verificar cache primeiro
            const cached = this.getFromCache();
            if (cached && cached.images.length > 0) {
                console.log('📦 Usando cache local...');
                this.images = cached.images;
                this.offset = cached.offset;
                this.applyFilters();
                this.renderGallery();
                if (cached.images.length === this.limit) {
                    this.setupInfiniteScroll();
                }
                return;
            }

            this.showLoading();

            console.log('🔄 Iniciando carregamento de imagens...');

            // Verificar se o Supabase está configurado
            if (!SUPABASE_CONFIG || !SUPABASE_CONFIG.url || !SUPABASE_CONFIG.key) {
                throw new Error('⚠️ CONFIGURAÇÃO AUSENTE: Edite js/config.js com as credenciais do Supabase');
            }

            if (SUPABASE_CONFIG.url.includes('seu-projeto') || SUPABASE_CONFIG.key.includes('sua-chave')) {
                throw new Error('⚠️ PLACEHOLDERS NÃO PREENCHIDOS: Substitua os valores em js/config.js');
            }

            // Carregar primeira página de imagens
            console.log(`📡 Fazendo pedido ao Supabase (${SUPABASE_CONFIG.url})...`);
            const batch = await supabaseAPI.getGalleryImages({ limit: this.limit, offset: this.offset });
            
            console.log(`✅ Recebidas ${batch.length} imagens`);
            this.images = batch;
            this.offset += batch.length;
            
            // Guardar em cache
            this.saveToCache({ images: batch, offset: this.offset });

            // iniciar conjunto visualizado com filtros/vazio
            this.applyFilters();

            if (this.viewImages.length === 0) {
                console.warn('⚠️ Nenhuma imagem encontrada na base de dados');
                this.showEmpty();
            } else {
                this.renderGallery();
                if (batch.length === this.limit) {
                    this.setupInfiniteScroll();
                }
            }
        } catch (error) {
            console.error('❌ Erro ao carregar imagens:', error.message);
            console.error('Stack:', error.stack);
            // se configuração ausente ou placeholders, usar amostras locais
            if (error.message.includes('CONFIGURAÇÃO AUSENTE') || error.message.includes('PLACEHOLDERS')) {
                console.warn('Usando imagens de amostra em vez de Supabase.');
                this.loadFallbackImages();
            } else {
                this.showError(error.message);
            }
        }
    }

    /**
     * Carrega algumas imagens de exemplo locais como fallback quando o Supabase não está disponível.
     */
    loadFallbackImages() {
        const now = new Date().toISOString();
        this.images = [
            { tipo: 'Exemplo', imagem_url: 'https://via.placeholder.com/600x400?text=Demo+1', created_at: now },
            { tipo: 'Exemplo', imagem_url: 'https://via.placeholder.com/600x400?text=Demo+2', created_at: now },
            { tipo: 'Exemplo', imagem_url: 'https://via.placeholder.com/600x400?text=Demo+3', created_at: now },
        ];
        this.offset = this.images.length;
        this.applyFilters();
        this.renderGallery();
    }

    /**
     * Renderiza a galeria com as imagens
     */
    /**
     * Renderiza um conjunto de imagens na galeria, substituindo o conteúdo existente.
     * Se passado um array opcional, usa-o em vez de this.images.
     */
    renderGallery(images = this.viewImages) {
        this.galleryContainer.innerHTML = '';
        this.appendImages(images);
        this.hideLoading();
        this.hideEmpty();
        this.hideError();
    }

    /**
     * Adiciona imagens ao final da galeria (para paginação/infinite scroll).
     * @param {Array} images - imagens a injetar
     */
    appendImages(images) {
        images.forEach((image, index) => {
            const galleryItem = this.createGalleryItem(image);
            this.galleryContainer.appendChild(galleryItem);

            // animação escalonada em relação ao index global
            setTimeout(() => {
                galleryItem.style.opacity = '0';
                galleryItem.offsetHeight;
                galleryItem.style.transition = 'opacity 0.4s ease-out';
                galleryItem.style.opacity = '1';
            }, index * 50);
        });
    }

    /**
     * Cria um elemento da galeria
     * @param {Object} image - Dados da imagem
     * @returns {HTMLElement} - Elemento HTML da galeria
     */
    createGalleryItem(image) {
        const item = document.createElement('div');
        item.className = 'gallery-item';

        // Validar dados da imagem
        const tipo = this.sanitizeText(image.tipo || 'Sem tipo');
        const originalUrl = this.sanitizeUrl(image.imagem_url);
        const thumbUrl = this.getOptimizedUrl(originalUrl, 300);  // Reduzido de 400px para melhor performance

        item.innerHTML = `
            <div class="gallery-item-image-wrapper">
                <img 
                    src="${thumbUrl}" 
                    data-full="${originalUrl}" 
                    alt="${tipo}" 
                    class="gallery-item-image"
                    loading="lazy"
                    onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect fill=%22%23333%22 width=%22400%22 height=%22400%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2224%22 fill=%22%23999%22%3EImagem não encontrada%3C/text%3E%3C/svg%3E';"
                >
                <div class="gallery-item-overlay">
                    <div class="zoom-icon">🔍</div>
                </div>
                <div class="gallery-item-info">
                    <span class="gallery-item-category">${tipo}</span>
                </div>
            </div>
        `;

        // clique determina o índice real dentro da visualização atual
        item.addEventListener('click', () => {
            const idx = Array.from(this.galleryContainer.children).indexOf(item);
            if (idx !== -1) {
                this.openModal(idx);
            }
        });

        return item;
    }

    /**
     * Abre o modal com a imagem em tamanho completo
     * @param {Object} image - Dados da imagem
     */
    /**
     * Abre o modal ou lightbox usando o índice dentro da lista atualmente exibida
     * @param {number} index
     */
    openModal(index) {
        const sourceArr = this.viewImages;
        if (index < 0 || index >= sourceArr.length) return;

        // Se o lightbox estiver disponível, usar para navegação
        if (typeof lightbox !== 'undefined') {
            lightbox.open(sourceArr, index);
        } else {
            // Fallback para modal tradicional
            const image = sourceArr[index];
            const modalImage = document.getElementById('modal-image');
            const modalTitle = document.getElementById('modal-title');
            const modalDescription = document.getElementById('modal-description');

            modalImage.src = this.sanitizeUrl(image.imagem_url);
            modalImage.alt = this.sanitizeText(image.tipo);
            modalTitle.textContent = this.sanitizeText(image.tipo);
            modalDescription.textContent = `Data: ${new Date(image.created_at).toLocaleDateString('pt-PT')}`;

            this.modalElement.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Retorna uma versão otimizada de uma URL de imagem usando parâmetros de redimensionamento
     * oferecidos pelo serviço de storage (Supabase/Imgix). É usado para carregar miniaturas leves.
     * @param {string} url
     * @param {number} width
     */
    getOptimizedUrl(url, width = 300) {
        try {
            const u = new URL(url);
            // apenas aplicar a transformação se for do domínio supabase (imagem pública)
            if (u.hostname.includes('supabase.co')) {
                u.searchParams.set('width', width);
                u.searchParams.set('auto', 'compress');
                u.searchParams.set('quality', '75');  // Reduzir qualidade para maior compressão
            }
            return u.toString();
        } catch (e) {
            return url;
        }
    }

    /**
     * Configura o scroll infinito para carregar mais imagens quando aproximar do final da página
     */
    setupInfiniteScroll() {
        window.addEventListener('scroll', () => {
            const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;
            if (nearBottom && !this.loadingMore) {
                this.loadMoreImages();
            }
        });
    }

    /**
     * Busca o próximo lote de imagens e insere na galeria
     */
    async loadMoreImages() {
        this.loadingMore = true;
        const moreIndicator = document.getElementById('loading-more');
        if (moreIndicator) moreIndicator.style.display = 'flex';
        try {
            const batch = await supabaseAPI.getGalleryImages({ limit: this.limit, offset: this.offset });
            if (batch.length > 0) {
                this.images = this.images.concat(batch);
                this.offset += batch.length;
                // reagrupar filtros antes de inserir se estiver filtrado/pesquisado
                this.applyFilters();
                // se não houver filtro podemos simplesmente anexar, senão refazemos renderização
                if (this.currentFilter === 'todos' && !this.currentSearch) {
                    this.appendImages(batch);
                } else {
                    this.renderGallery();
                }
                if (batch.length !== this.limit) {
                    // não há mais; poderíamos remover o listener se quisermos
                }
            }
        } catch (e) {
            console.error('Erro ao carregar mais imagens:', e);
        }
        if (moreIndicator) moreIndicator.style.display = 'none';
        this.loadingMore = false;
    }

    /**
     * Fecha o modal
     */
    closeModal() {
        this.modalElement.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    /**
     * Mostra o estado de carregamento
     */
    showLoading() {
        this.loadingElement.style.display = 'flex';
        this.galleryContainer.style.display = 'none';
        this.errorElement.style.display = 'none';
        this.emptyElement.style.display = 'none';
    }

    /**
     * Esconde o estado de carregamento
     */
    hideLoading() {
        this.loadingElement.style.display = 'none';
        this.galleryContainer.style.display = 'grid';
    }

    /**
     * Mostra o estado de erro
     */
    showError(message) {
        this.errorElement.style.display = 'block';
        this.galleryContainer.style.display = 'none';
        this.loadingElement.style.display = 'none';
        this.emptyElement.style.display = 'none';
        this.errorElement.querySelector('p').textContent = `Erro: ${message}`;
    }

    /**
     * Esconde o estado de erro
     */
    hideError() {
        this.errorElement.style.display = 'none';
    }

    /**
     * Mostra o estado vazio
     */
    showEmpty() {
        this.emptyElement.style.display = 'block';
        this.galleryContainer.style.display = 'none';
        this.loadingElement.style.display = 'none';
        this.errorElement.style.display = 'none';
    }

    /**
     * Esconde o estado vazio
     */
    hideEmpty() {
        this.emptyElement.style.display = 'none';
    }

    /**
     * Desinfeta texto XSS
     * @param {string} text - Texto a desinfectar
     * @returns {string} - Texto desinfectado
     */
    sanitizeText(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Valida e desinfeta URL
     * @param {string} url - URL a desinfectar
     * @returns {string} - URL desinfectada
     */
    sanitizeUrl(url) {
        try {
            const urlObj = new URL(url);
            if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
                return url;
            }
        } catch (e) {
            console.warn('URL inválida:', url);
        }
        return 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect fill=%22%23333%22 width=%22400%22 height=%22400%22/%3E%3C/svg%3E';
    }

    /**
     * Atualiza `viewImages` aplicando filtros de categoria e pesquisa
     */
    applyFilters() {
        let arr = Array.from(this.images);
        if (this.currentFilter && this.currentFilter !== 'todos') {
            const filtro = this.currentFilter.toLowerCase();
            arr = arr.filter(img => img.tipo && img.tipo.toLowerCase() === filtro);
        }
        if (this.currentSearch) {
            arr = arr.filter(img =>
                img.tipo && img.tipo.toLowerCase().includes(this.currentSearch)
            );
        }
        this.viewImages = arr;
    }

    /**
     * Filtra imagens por tipo
     * @param {string} tipo - Tipo para filtrar
     */
    filterByCategory(tipo) {
        this.currentFilter = tipo || 'todos';
        this.applyFilters();

        if (this.viewImages.length === 0) {
            this.showEmpty();
        } else {
            this.renderGallery();
        }
    }

    /**
     * Pesquisa imagens por tipo
     * @param {string} query - Termo de pesquisa
     */
    search(query) {
        this.currentSearch = query ? query.toLowerCase() : '';
        this.applyFilters();

        if (this.viewImages.length === 0) {
            this.showEmpty();
        } else {
            this.renderGallery();
        }
    }

    /**
     * Guarda dados em cache local
     * @param {Object} data - Dados a guardar
     */
    saveToCache(data) {
        try {
            const cacheData = {
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
            console.log('💾 Cache guardado');
        } catch (e) {
            console.warn('Erro ao guardar cache:', e);
        }
    }

    /**
     * Obtém dados do cache local se ainda forem válidos
     * @returns {Object|null} - Dados em cache ou null
     */
    getFromCache() {
        try {
            const cached = localStorage.getItem(this.cacheKey);
            if (!cached) return null;
            
            const cacheData = JSON.parse(cached);
            const age = Date.now() - cacheData.timestamp;
            
            if (age > this.cacheExpiry) {
                console.log('🗑️ Cache expirado');
                localStorage.removeItem(this.cacheKey);
                return null;
            }
            
            return cacheData.data;
        } catch (e) {
            console.warn('Erro ao ler cache:', e);
            return null;
        }
    }

    /**
     * Limpa o cache
     */
    clearCache() {
        try {
            localStorage.removeItem(this.cacheKey);
            console.log('🗑️ Cache limpo');
        } catch (e) {
            console.warn('Erro ao limpar cache:', e);
        }
    }
}

// Instância global da galeria
let gallery;
