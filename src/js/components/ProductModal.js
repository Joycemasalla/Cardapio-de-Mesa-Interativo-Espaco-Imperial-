export class ProductModal {
  constructor() {
    this.overlay = document.getElementById('modalOverlay');
    this.card = document.getElementById('modalCard');
    this.closeBtn = document.getElementById('modalClose');
    this.img = document.getElementById('modalImage');
    this.title = document.getElementById('modalTitle');
    this.desc = document.getElementById('modalDesc');
    this.priceArea = document.getElementById('modalPriceArea');
    this.serves = document.getElementById('modalServes');

    this.closeBtn.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });
  }

  open(product, category) {
    this.title.textContent = product.name;
    this.desc.textContent = product.desc || '';
    
    if (product.serves) {
      this.serves.textContent = `Serve: ${product.serves}`;
      this.serves.style.display = 'block';
    } else {
      this.serves.style.display = 'none';
    }

    // Try to load exact product image, fallback to category banner, fallback to logo
    let imgSrc = `/images/${product.id}.jpg`;
    
    // We will attempt to load the specific image, but we can't do a synchronous check easily.
    // Instead, we just set it and use an onerror fallback
    this.img.src = imgSrc;
    this.img.onerror = () => {
      // fallback
      this.img.src = category.banner || '/logo.png';
      this.img.onerror = null; // prevent infinite loop
    };
    
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
    // Prevent body scroll behind modal
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}
