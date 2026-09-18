import { menuData } from './data/menuData.js';

export function buildPages() {
  const flipbook = document.getElementById('flipbook');
  let pagesHtml = '';

  const isMobile = window.innerWidth < 768;
  const ITEMS_PER_PAGE = isMobile ? 6 : 7;

  // 1. Capa
  pagesHtml += `
    <div class="page page-cover">
      <div class="page-content" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;">
        <img src="/public/logo.png" alt="Espaço Imperial" class="logo">
        <h1>Espaço Imperial</h1>
        <p>Cardápio Digital</p>
        <div style="margin-top: 48px; color: var(--gold); font-size: 11px; display: flex; flex-direction: column; align-items: center; gap: 8px; opacity: 0.8; text-transform: uppercase; letter-spacing: 2px;">
          <span>${isMobile ? 'Deslize para folhear' : 'Arraste para folhear'}</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </div>
      </div>
    </div>
  `;

  const pageMap = [];
  let pageIndex = 1; // Capa é 0

  // 2. Páginas de Categorias
  menuData.forEach((cat) => {
    // Registra a página inicial desta categoria
    pageMap.push({ id: cat.id, label: cat.navLabel, pageIndex: pageIndex });

    const totalItems = cat.items.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

    for (let p = 0; p < totalPages; p++) {
      const items = cat.items.slice(p * ITEMS_PER_PAGE, (p + 1) * ITEMS_PER_PAGE);

      let itemsHtml = items.map((it) => {
        let priceHtml = '';
        if (it.price !== null && it.price !== undefined) {
          priceHtml = `<div class="book-item-price">R$ ${it.price.toFixed(2).replace('.', ',')}</div>`;
        } else if (it.options && it.options.length > 0) {
          priceHtml = `<div class="book-item-price" style="font-size: 12px;">Vários tamanhos</div>`;
        } else {
          priceHtml = `<div class="book-item-price" style="font-size: 12px; font-weight: 400; color: var(--muted-2);">Consulte</div>`;
        }

        return `
          <div class="book-item" data-cat="${cat.id}" data-item="${it.id}">
            <div class="book-item-content">
              <div class="book-item-header">
                <h3 class="book-item-name">${it.name}</h3>
                ${priceHtml}
              </div>
              ${it.desc ? `<p class="book-item-desc">${it.desc}</p>` : ''}
            </div>
          </div>
        `;
      }).join('');

      const isFirstPage = p === 0;

      // Banner da categoria — exibido apenas na primeira página da categoria
      const bannerHtml = (isFirstPage && cat.banner) ? `
        <div class="book-cat-banner" style="background-image: url('${cat.banner}')">
          <div class="book-cat-banner-overlay"></div>
        </div>
      ` : '';

      pagesHtml += `
        <div class="page">
          <div class="page-content">
            <div class="page-ornament">
              <svg viewBox="0 0 24 24" fill="none"><path d="M4 6a2 2 0 012-2h6l8 8-8 8-8-8V6z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor"/></svg>
            </div>
            ${isFirstPage ? `
              <h2 class="book-cat-title">${cat.title}</h2>
              ${cat.subtitle ? `<p class="book-cat-sub">${cat.subtitle}</p>` : ''}
              ${bannerHtml}
            ` : `
              <h2 class="book-cat-title" style="font-size: 18px; opacity: 0.8;">${cat.title} <span style="font-size: 13px; font-weight: normal;">(cont.)</span></h2>
              <div style="height: 8px;"></div>
            `}
            <div class="book-items-list">
              ${itemsHtml}
            </div>
          </div>
        </div>
      `;
      pageIndex++;
    }
  });

  // 3. Contracapa
  pagesHtml += `
    <div class="page page-cover">
      <div class="page-content" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;">
        <img src="/public/logo.png" alt="Espaço Imperial" class="logo" style="width: 100px; opacity: 0.5;">
        <h2 style="font-family: var(--header-font); font-size: 24px; color: var(--gold); margin-top: 24px;">Obrigado!</h2>
        <p style="text-transform: none; margin-top: 8px;">Agradecemos a preferência.</p>
      </div>
    </div>
  `;

  flipbook.innerHTML = pagesHtml;
  return pageMap;
}
