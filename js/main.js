/* ========================================
   SCRIPT PRINCIPAL
   ======================================== */

/**
 * Valida a configuracao do Supabase
 */
function validateConfig() {
    if (!window.SUPABASE_CONFIG) {
        console.warn('AVISO: window.SUPABASE_CONFIG nao esta definido (usaremos imagens de exemplo)');
        return false;
    }

    const { url, key } = window.SUPABASE_CONFIG;

    if (!url || url.includes('seu-projeto')) {
        console.error('AVISO: URL DO SUPABASE NAO PREENCHIDA em js/config.js');
        return false;
    }

    if (!key || key.includes('sua-chave')) {
        console.error('AVISO: CHAVE DO SUPABASE NAO PREENCHIDA em js/config.js');
        return false;
    }

    console.log('Configuracao valida!', { url, key: key.substring(0, 10) + '...' });
    return true;
}

document.addEventListener('DOMContentLoaded', () => {
    // Validar configuracao primeiro
    if (!validateConfig()) {
        console.warn('Configuracao de Supabase invalidada; continuando com fallback.');
        // não mostramos o erro de bloqueio para permitir o fallback local
        const errorEl = document.getElementById('error');
        const loadingEl = document.getElementById('loading');
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) {
            errorEl.style.display = 'none';
        }
        // não retornamos; a classe Gallery lidará com as amostras
    }

    // Inicializar a galeria quando o DOM estiver pronto
    try {
        // usamos um nome que não colide com o id "gallery" do elemento
        window.appGallery = new Gallery();
    } catch (error) {
        console.error('Erro ao inicializar galeria:', error.message);
    }

    // Event listener para botão de reload de erro (substitui onclick inline)
    const errorReloadBtn = document.getElementById('error-reload-btn');
    if (errorReloadBtn) {
        errorReloadBtn.addEventListener('click', () => {
            location.reload();
        });
    }

    // Configurar handlers de autenticação
    setupAuthHandlers();

    // Adicionar suporte para atualização de imagens a cada 30 segundos
    setInterval(() => {
        // console.log('Verificando novas imagens...');
        // Descomente se quiser atualizar automaticamente
        // window.appGallery.loadImages();
    }, 30000);

    // Adicionar suporte para teclas de atalho
    setupKeyboardShortcuts();

    // Adicionar suporte para modo escuro/claro
    setupThemeToggle();
});

/**
 * Configura atalhos de teclado
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        const gal = window.appGallery;
        if (!gal) return;
        // Ctrl/Cmd + R para recarregar imagens
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            gal.loadImages();
        }

        // Ctrl/Cmd + F para pesquisar
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            const searchQuery = prompt('Pesquisar na galeria:');
            if (searchQuery && searchQuery.trim().length > 0) {
                // Sanitizar entrada de pesquisa
                const sanitized = sanitizeInput(searchQuery);
                gal.search(sanitized);
            }
        }
    });
}

/**
 * Configura toggle de tema (claro/escuro)
 */
function setupThemeToggle() {
    const htmlElement = document.documentElement;
    
    // Verificar preferência armazenada
    const savedTheme = localStorage.getItem('theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);

    // Você pode adicionar um botão para mudar o tema
    // Por enquanto, apenas usamos o tema escuro que é o padrão
}

/**
 * Permite recarregar imagens através de console
 * Use: reloadGallery() no console
 */
function reloadGallery() {
    const gal = window.appGallery;
    if (!gal) {
        console.error('Galeria não inicializada.');
        return;
    }
    gal.loadImages();
    console.log('Recarregando galeria...');
}

/**
 * Permite filtrar por categoria através de console
 * Use: filterGallery('Natureza') no console
 */
function filterGallery(category) {
    const gal = window.appGallery;
    if (!gal) {
        console.error('Galeria não inicializada.');
        return;
    }
    gal.filterByCategory(category);
    console.log(`Filtrando por categoria: ${category}`);
}

/**
 * Sanitiza entrada do utilizador para evitar ataques
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input.trim().substring(0, 100); // limitar tamanho de 100 caracteres
}

/**
 * Configura handlers de autenticação
 */
function setupAuthHandlers() {
    const loginBtn = document.getElementById('auth-login-btn');
    const logoutBtn = document.getElementById('auth-logout-btn');
    const addImageBtn = document.getElementById('add-image-btn');

    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginModal();
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (authManager) {
                authManager.logout();
            }
        });
    }

    if (addImageBtn) {
        addImageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (authManager && authManager.isAuthenticated()) {
                showAddImageModal();
            } else {
                alert('Por favor, faça login para adicionar imagens.');
                showLoginModal();
            }
        });
    }
}

/**
 * Mostra modal de login (simplificado, usar em produção com melhor UI)
 */
function showLoginModal() {
    const email = prompt('Email:');
    if (!email) return;

    const password = prompt('Palavra-passe:');
    if (!password) return;

    if (authManager) {
        authManager.loginWithEmail(email, password)
            .then(() => {
                alert('Login com sucesso!');
            })
            .catch((error) => {
                alert(`Erro ao fazer login: ${error.message}`);
            });
    }
}

/**
 * Mostra modal para adicionar imagem (simplificado)
 */
function showAddImageModal() {
    const tipo = prompt('Tipo/Categoria de imagem:');
    if (!tipo) return;

    const imageUrl = prompt('URL da imagem:');
    if (!imageUrl) return;

    // Aqui poderia integrar melhor com um formulário HTML
    console.log('Modal para adicionar imagem - implementar UI completa');
}

/**
 * Retorna o número total de imagens
 */
function getTotalImages() {
    const gal = window.appGallery;
    return gal ? gal.images.length : 0;
}

/**
 * Retorna as categorias disponíveis
 */
function getAvailableCategories() {
    const gal = window.appGallery;
    if (!gal) return [];
    const categories = [...new Set(gal.images.map(img => img.category))];
    return categories;
}

/**
 * Exporta dados das imagens em JSON
 */
function exportGalleryData() {
    const gal = window.appGallery;
    if (!gal) {
        console.error('Galeria não inicializada.');
        return;
    }
    const dataStr = JSON.stringify(gal.images, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `gallery_${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Valida a configuração do Supabase
 */
function validateSupabaseConfig() {
    if (!SUPABASE_CONFIG.url) {
        console.error('❌ Supabase URL não está configurada');
        return false;
    }
    if (!SUPABASE_CONFIG.key) {
        console.error('❌ Supabase Key não está configurada');
        return false;
    }
    console.log('✅ Configuração do Supabase válida');
    return true;
}

/**
 * Exibe informações de debug
 */
function debugInfo() {
    console.log('=== INFORMAÇÕES DE DEBUG ===');
    console.log('Configuração Supabase:', SUPABASE_CONFIG);
    console.log('Total de imagens:', getTotalImages());
    console.log('Categorias:', getAvailableCategories());
    console.log('Imagens:', window.appGallery && window.appGallery.images);
}
// FUNCOES DE DIAGNOSTICO
window.debugConfig = function() {
    console.clear();
    console.log('=== DEBUG: Configuracao ===');
    const cfg = window.SUPABASE_CONFIG || {};
    console.log('URL:', cfg.url);
    console.log('URL valida?', cfg.url && !cfg.url.includes('seu-projeto'));
    console.log('Chave:', cfg.key ? cfg.key.substring(0, 10) + '...' : 'nao definida');
    console.log('Tabela:', cfg.table);
    console.log('Status:', validateConfig() ? 'OK' : 'ERRO');
};

window.testLoad = function() {
    if (window.appGallery) window.appGallery.loadImages();
    else console.error('Galeria nao esta pronta');
};

window.showImages = function() {
    const gal = window.appGallery;
    if (!gal) {
        console.error('Galeria (appGallery) não inicializada.');
        return;
    }
    const imgs = gal.images;
    if (!Array.isArray(imgs)) {
        console.error('Galeria existe mas não contém array de imagens.', gal);
        return;
    }
    console.log('Total de imagens no objeto appGallery:', imgs.length);
    console.table(imgs);
};