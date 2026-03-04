/* ========================================
   SUPABASE API
   ======================================== */

class SupabaseAPI {
    constructor(config) {
        // Validar configuração
        if (!config || !config.url || !config.key) {
            const errorMsg = 'Configuração do Supabase incompleta. Verifique js/config.js';
            console.error('❌', errorMsg);
            console.error('Config recebida:', config);
            throw new Error(errorMsg);
        }

        // Validar que são URLs válidas
        try {
            new URL(config.url);
        } catch {
            throw new Error('URL do Supabase inválida.');
        }

        // Validar que não são ainda placeholders
        if (config.url.includes('seu-projeto') || config.key.includes('sua-chave') || config.key === 'sua-chave-publica-aqui') {
            const errorMsg = '⚠️ CONFIGURAÇÃO: Substitua os placeholders em js/config.js\n' +
                           '1. Aceda a https://supabase.com\n' +
                           '2. Copie a URL do projeto (Settings > API > Project URL)\n' +
                           '3. Copie a chave anon (Settings > API > anon key)\n' +
                           '4. Cole em js/config.js';
            console.error(errorMsg);
            throw new Error(errorMsg);
        }

        this.url = config.url;
        this.key = config.key;
        this.table = config.table || 'fotos';
        this.storageBucket = config.storageBucket || 'fotos';
        this.headers = {
            'Content-Type': 'application/json',
            'apikey': this.key,
            'Authorization': `Bearer ${this.key}`
        };

        console.log('✅ Supabase API inicializado com sucesso');
        console.log(`   URL: ${this.url}`);
        console.log(`   Tabela: ${this.table}`);
    }

    /**
     * Obtém todas as imagens da galeria
     * @returns {Promise<Array>} - Array com as imagens
     */
    /**
     * Obtém todas as imagens da galeria, com suporte a paginação.
     * @param {Object} [opts]
     * @param {number} [opts.limit] - Número máximo de registos a devolver.
     * @param {number} [opts.offset] - Deslocamento para paginação.
     * @returns {Promise<Array>} - Array com as imagens
     */
    async getGalleryImages(opts = {}) {
        try {
            let url = `${this.url}/rest/v1/${this.table}?select=*&order=created_at.desc`;
            if (opts.limit) url += `&limit=${opts.limit}`;
            if (opts.offset) url += `&offset=${opts.offset}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.headers
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao buscar imagens:', error);
            throw error;
        }
    }

    /**
     * Obtém imagens de um tipo específico
     * @param {string} tipo - Tipo da imagem
     * @returns {Promise<Array>} - Array com as imagens do tipo
     */
    async getImagesByCategory(tipo, opts = {}) {
        try {
            let url = `${this.url}/rest/v1/${this.table}?select=*&tipo=eq.${encodeURIComponent(tipo)}&order=created_at.desc`;
            if (opts.limit) url += `&limit=${opts.limit}`;
            if (opts.offset) url += `&offset=${opts.offset}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.headers
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao buscar imagens por tipo:', error);
            throw error;
        }
    }

    /**
     * Obtém uma imagem específica pelo ID
     * @param {string} id - ID da imagem
     * @returns {Promise<Object>} - Objeto com os dados da imagem
     */
    async getImageById(id) {
        try {
            const url = `${this.url}/rest/v1/${this.table}?select=*&id=eq.${id}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.headers
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            return data[0];
        } catch (error) {
            console.error('Erro ao buscar imagem:', error);
            throw error;
        }
    }

    /**
     * Valida dados antes de enviar para Supabase
     * @param {Object} imageData - Dados a validar
     * @throws {Error} se os dados são inválidos
     */
    validateImageData(imageData) {
        if (!imageData || typeof imageData !== 'object') {
            throw new Error('Dados de imagem inválidos');
        }

        // Validar tipo
        if (!imageData.tipo || typeof imageData.tipo !== 'string') {
            throw new Error('Tipo de imagem é obrigatório');
        }
        if (imageData.tipo.length > 100) {
            throw new Error('Tipo muito longo (máximo 100 caracteres)');
        }

        // Validar URL
        if (!imageData.imagem_url || typeof imageData.imagem_url !== 'string') {
            throw new Error('URL da imagem é obrigatória');
        }
        try {
            const url = new URL(imageData.imagem_url);
            if (!['http:', 'https:'].includes(url.protocol)) {
                throw new Error('Protocol inválido');
            }
        } catch (e) {
            throw new Error('URL da imagem inválida');
        }
    }

    /**
     * Adiciona uma nova imagem à galeria
     * Requer que o utilizador esteja autenticado (via Supabase Auth)
     * @param {Object} imageData - Dados da imagem (tipo, imagem_url)
     * @returns {Promise<Object>} - Dados da imagem criada
     */
    async addImage(imageData) {
        try {
            // Validar dados
            this.validateImageData(imageData);

            const url = `${this.url}/rest/v1/${this.table}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    tipo: imageData.tipo,
                    imagem_url: imageData.imagem_url
                })
            });

            if (!response.ok) {
                const error = await response.json();
                if (response.status === 401) {
                    throw new Error('Não autenticado. Faça login para adicionar imagens.');
                }
                if (response.status === 403) {
                    throw new Error('Não tem permissão para adicionar imagens.');
                }
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao adicionar imagem:', error.message);
            throw error;
        }
    }

    /**
     * Atualiza uma imagem existente
     * @param {string} id - ID da imagem
     * @param {Object} imageData - Novos dados da imagem
     * @returns {Promise<Object>} - Dados atualizados da imagem
     */
    async updateImage(id, imageData) {
        try {
            // Validar ID
            if (!id || typeof id !== 'string') {
                throw new Error('ID de imagem inválido');
            }

            // Validar dados
            this.validateImageData(imageData);

            const url = `${this.url}/rest/v1/${this.table}?id=eq.${encodeURIComponent(id)}`;
            
            const response = await fetch(url, {
                method: 'PATCH',
                headers: this.headers,
                body: JSON.stringify(imageData)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Não autenticado.');
                }
                if (response.status === 403) {
                    throw new Error('Não tem permissão para editar esta imagem.');
                }
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao atualizar imagem:', error.message);
            throw error;
        }
    }

    /**
     * Elimina uma imagem da galeria
     * @param {string} id - ID da imagem
     * @returns {Promise<boolean>} - Sucesso da operação
     */
    async deleteImage(id) {
        try {
            // Validar ID
            if (!id || typeof id !== 'string') {
                throw new Error('ID de imagem inválido');
            }

            const url = `${this.url}/rest/v1/${this.table}?id=eq.${encodeURIComponent(id)}`;
            
            const response = await fetch(url, {
                method: 'DELETE',
                headers: this.headers
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Não autenticado.');
                }
                if (response.status === 403) {
                    throw new Error('Não tem permissão para eliminar esta imagem.');
                }
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error('Erro ao eliminar imagem:', error.message);
            throw error;
        }
    }

    /**
     * Upload de ficheiro para Supabase Storage
     * @param {File} file - Ficheiro para upload
     * @param {string} Path - Caminho no storage
     * @returns {Promise<Object>} - Dados do ficheiro carregado
     */
    async uploadFile(file, path) {
        try {
            const url = `${this.url}/storage/v1/object/${this.storageBucket}/${path}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'apikey': this.key,
                    'Authorization': `Bearer ${this.key}`
                },
                body: file
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao carregar ficheiro:', error);
            throw error;
        }
    }

    /**
     * Obtém URL assinada de um ficheiro no Storage
     * @param {string} path - Caminho do ficheiro
     * @param {number} expiresIn - Tempo de expiração em segundos (default: 3600)
     * @returns {Promise<string>} - URL assinada
     */
    async getFileURL(path, expiresIn = 3600) {
        try {
            const url = `${this.url}/storage/v1/object/sign/${this.storageBucket}/${path}?expiresIn=${expiresIn}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'apikey': this.key,
                    'Authorization': `Bearer ${this.key}`
                }
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            return `${this.url}${data.path}`;
        } catch (error) {
            console.error('Erro ao obter URL do ficheiro:', error);
            throw error;
        }
    }

    /**
     * Obtém tipos disponíveis
     * @returns {Promise<Array>} - Array com os tipos
     */
    async getCategories() {
        try {
            const url = `${this.url}/rest/v1/${this.table}?select=tipo&order=tipo.asc`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: this.headers
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            // Remove duplicatas
            const categories = [...new Set(data.map(item => item.tipo))];
            return categories;
        } catch (error) {
            console.error('Erro ao buscar tipos:', error);
            throw error;
        }
    }
}

// Criar instância global do Supabase API
const supabaseAPI = new SupabaseAPI(SUPABASE_CONFIG);
