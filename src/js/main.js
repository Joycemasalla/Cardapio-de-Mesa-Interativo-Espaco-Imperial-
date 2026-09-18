import { menuData } from './data/menuData.js';
import { buildPages } from './pageBuilder.js';
import { ProductModal } from './components/ProductModal.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Constrói as páginas HTML
  const pageMap = buildPages();

  // 2. Constrói os dots de navegação
  const navInner = document.getElementById('flipNavInner');
  pageMap.forEach((nav, i) => {
    const dot = document.createElement('button');
    dot.className = 'cat-dot';
    dot.title = nav.label;
    dot.setAttribute('aria-label', nav.label);
    dot.dataset.page = nav.pageIndex;
    if (i === 0) dot.classList.add('active');

    // Cria label de texto para mobile
    const label = document.createElement('span');
    label.className = 'cat-dot-label';
    label.textContent = nav.label;
    dot.appendChild(label);

    dot.addEventListener('click', () => {
      if (window.pageFlip) {
        window.pageFlip.turnToPage(nav.pageIndex);
      }
    });
    navInner.appendChild(dot);
  });

  const flipbookEl = document.getElementById('flipbook');

  // 3. Calcula dimensões responsivas
  const isMobile = window.innerWidth < 768;

  // No mobile, o livro ocupa toda a tela
  const bookWidth  = isMobile ? Math.min(window.innerWidth, 480)  : 480;
  const bookHeight = isMobile ? window.innerHeight                : window.innerHeight;

  // Usa St.PageFlip do objeto global inserido pelo CDN no index.html
  const PageFlip = window.St.PageFlip;

  // 4. Inicializa o PageFlip
  const pageFlip = new PageFlip(flipbookEl, {
    width:       bookWidth,
    height:      bookHeight,
    size:        'stretch',
    minWidth:    300,
    maxWidth:    520,
    minHeight:   480,
    maxHeight:   1200,
    drawShadow:  true,
    showCover:   true,
    usePortrait: true,          // sempre retrato (1 página por vez, funciona em mobile e desktop)
    mobileScrollSupport: true,  // permite scroll dentro da página no mobile
    swipeDistance: 30,          // sensibilidade do swipe (px)
    clickEventForward: true,
    maxShadowOpacity: 0.35,
    autoSize: true,
    flippingTime: 700,
  });

  pageFlip.loadFromHTML(document.querySelectorAll('.page'));
  window.pageFlip = pageFlip; // expõe globalmente para os dots

  // Atualiza UI ao virar a página
  const currentPageEl = document.getElementById('currentPage');
  const totalPagesEl  = document.getElementById('totalPages');
  totalPagesEl.textContent = pageFlip.getPageCount();

  const dots = document.querySelectorAll('.cat-dot');

  pageFlip.on('flip', (e) => {
    const pageIndex = e.data;
    currentPageEl.textContent = pageIndex + 1;

    // Atualiza os dots de navegação
    dots.forEach(d => d.classList.remove('active'));
    let activeDot = dots[0];
    for (let i = 0; i < pageMap.length; i++) {
      if (pageIndex >= pageMap[i].pageIndex) {
        activeDot = dots[i];
      }
    }
    if (activeDot) {
      activeDot.classList.add('active');
      // Rola a nav para o dot ativo ficar visível
      activeDot.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  });

  // Controles manuais (setas)
  document.getElementById('prevBtn').addEventListener('click', () => pageFlip.flipPrev());
  document.getElementById('nextBtn').addEventListener('click', () => pageFlip.flipNext());

  // Suporte a teclado (desktop)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') pageFlip.flipNext();
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   pageFlip.flipPrev();
  });

  // 5. Inicializa o Modal de Produtos
  const modal = new ProductModal();

  document.querySelectorAll('.book-item').forEach(itemEl => {
    itemEl.addEventListener('click', () => {
      const catId  = itemEl.dataset.cat;
      const itemId = itemEl.dataset.item;

      const cat = menuData.find(c => c.id === catId);
      if (cat) {
        const product = cat.items.find(p => p.id === itemId);
        if (product) {
          modal.open(product, cat);
        }
      }
    });
  });
});
