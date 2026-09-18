export class ProductModal {
  constructor() {
    this.overlay   = document.getElementById('modalOverlay');
    this.card      = document.getElementById('modalCard');
    this.closeBtn  = document.getElementById('modalClose');
    this.imgWrap   = document.getElementById('modalImageWrap');
    this.img       = document.getElementById('modalImage');
    this.title     = document.getElementById('modalTitle');
    this.desc      = document.getElementById('modalDesc');
    this.priceArea = document.getElementById('modalPriceArea');
    this.serves    = document.getElementById('modalServes');

    this.closeBtn.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    // Suporte a swipe para baixo para fechar (mobile)
    let startY = 0;
    this.card.addEventListener('touchstart', (e) => { startY = e.touches[0].clientY; }, { passive: true });
    this.card.addEventListener('touchend', (e) => {
      const deltaY = e.changedTouches[0].clientY - startY;
      if (deltaY > 80) this.close();
    }, { passive: true });
  }

  open(product, category) {
    this.title.textContent = product.name;
    this.desc.textContent  = product.desc || '';
    
    const catTextEl = document.getElementById('modalCategoryText');
    if (catTextEl) {
      catTextEl.textContent = category.title || '';
    }

    if (product.serves) {
      this.serves.textContent  = `🍽️ Serve: ${product.serves}`;
      this.serves.style.display = 'block';
    } else {
      this.serves.style.display = 'none';
    }

    // Tenta imagem específica do produto; se não existir, usa o banner da categoria; se não, oculta a área de imagem
    const categoryBanner = category.banner || null;
    const productImgSrc  = `/public/images/${product.id}.jpg`;

    this.img.src = productImgSrc;
    this.imgWrap.style.display = 'block';

    this.img.onerror = () => {
      if (categoryBanner) {
        // Usa o banner da categoria como fallback
        this.img.src    = category.banner; // já tem /public/ no caminho
        this.img.onerror = () => {
          // Sem imagem disponível — oculta a área
          this.imgWrap.style.display = 'none';
          this.img.onerror = null;
        };
      } else {
        this.imgWrap.style.display = 'none';
        this.img.onerror = null;
      }
    };

    // Preço
    let priceHtml = '';
    if (product.price !== null && product.price !== undefined) {
      priceHtml = `<div class="modal-price">R$ ${product.price.toFixed(2).replace('.', ',')}</div>`;
    } else if (product.options && product.options.length > 0) {
      priceHtml = product.options.map(o => `
        <div class="modal-price-opt">
          <span>${o.label}</span>
          <b>R$ ${o.price.toFixed(2).replace('.', ',')}</b>
        </div>
      `).join('');
    } else {
      priceHtml = `<div class="modal-price" style="font-size:16px;">Consulte valor</div>`;
    }
    this.priceArea.innerHTML = priceHtml;

    this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}
