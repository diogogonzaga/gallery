/* ========================================
   LIGHTBOX - NAVEGAÇÃO
   ======================================== */

class Lightbox {
    constructor() {
        this.modal = document.getElementById('modal');
        this.image = document.getElementById('modal-image');
        this.title = document.getElementById('modal-title');
        this.description = document.getElementById('modal-description');
        this.closeBtn = document.getElementById('lb-close');
        this.prevBtn = document.getElementById('lb-prev');
        this.nextBtn = document.getElementById('lb-next');
        this.images = [];
        this.currentIndex = 0;
        
        this.setupEventListeners();
    }

    /**
     * Configura os ouvintes de eventos
     */
    setupEventListeners() {
        // Fechar lightbox
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }

        // Navegação
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }

        // Fechar ao clicar fora
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // Atalhos de teclado
        document.addEventListener('keydown', (e) => {
            if (this.modal.style.display !== 'none') {
                if (e.key === 'Escape') {
                    this.close();
                } else if (e.key === 'ArrowLeft') {
                    this.prev();
                } else if (e.key === 'ArrowRight') {
                    this.next();
                }
            }
        });
    }

    /**
     * Abre o lightbox com a imagem
     * @param {Array} images - Array com todas as imagens
     * @param {number} index - Índice da imagem a mostrar
     */
    open(images, index) {
        this.images = images;
        this.currentIndex = index;

        if (this.images.length > 0) {
            this.updateImage();
            this.modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Fecha o lightbox
     */
    close() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    /**
     * Mostra a imagem anterior
     */
    prev() {
        if (this.images.length === 0) return;
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.updateImage();
    }

    /**
     * Mostra a próxima imagem
     */
    next() {
        if (this.images.length === 0) return;
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateImage();
    }

    /**
     * Atualiza a imagem exibida
     */
    updateImage() {
        const currentImage = this.images[this.currentIndex];
        if (!currentImage) return;

        this.image.src = currentImage.imagem_url;
        this.image.alt = currentImage.tipo;
        this.title.textContent = currentImage.tipo;
        this.description.textContent = `Data: ${new Date(currentImage.created_at).toLocaleDateString('pt-PT')} | Imagem ${this.currentIndex + 1} de ${this.images.length}`;

        // Ocultar botões de navegação se houver apenas uma imagem
        if (this.images.length <= 1) {
            if (this.prevBtn) this.prevBtn.style.display = 'none';
            if (this.nextBtn) this.nextBtn.style.display = 'none';
        } else {
            if (this.prevBtn) this.prevBtn.style.display = 'flex';
            if (this.nextBtn) this.nextBtn.style.display = 'flex';
        }
    }
}

// Instância global do Lightbox
let lightbox;

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    if (!lightbox) {
        lightbox = new Lightbox();
    }
});
