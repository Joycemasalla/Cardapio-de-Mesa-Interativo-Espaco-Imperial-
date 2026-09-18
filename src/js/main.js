import { menuData } from './data/menuData.js';
import { buildPages } from './pageBuilder.js';
import { ProductModal } from './components/ProductModal.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Constrói as páginas HTML
  const pageMap = buildPages();
  
  // 2. Constrói os dots de navegação
  const navInner = document.getElementById('flipNavInner');
  pageMap.forEach((nav, i) => {
    const dot = document.createElement('div');
    dot.className = 'cat-dot';
    dot.title = nav.label;
    dot.dataset.page = nav.pageIndex;
    if(i === 0) dot.classList.add('active');
    
    dot.addEventListener('click', () => {
      if(window.pageFlip) {
        window.pageFlip.turnToPage(nav.pageIndex);
      }
    });
    navInner.appendChild(dot);
  });

  const flipbookEl = document.getElementById('flipbook');
  
  // 3. Calcula dimensões responsivas
  const isMobile = window.innerWidth < 768;
  const bookWidth = isMobile ? window.innerWidth : 480;
  const bookHeight = window.innerHeight;

  // Usa St.PageFlip do objeto global inserido pelo CDN no index.html
  const PageFlip = window.St.PageFlip;

  // 4. Inicializa o PageFlip
  const pageFlip = new PageFlip(flipbookEl, {
    width: bookWidth,
    height: bookHeight,
    size: "stretch",
    minWidth: 320,
    maxWidth: 480,
    minHeight: 500,
    maxHeight: 1200,
    drawShadow: true,
    showCover: true,
    usePortrait: isMobile,   // modo retrato em mobile (1 página)
    mobileScrollSupport: false,
    maxShadowOpacity: 0.4
  });

  pageFlip.loadFromHTML(document.querySelectorAll('.page'));
  window.pageFlip = pageFlip; // expõe globalmente para os dots

  // Atualiza UI ao virar a página
  const currentPageEl = document.getElementById('currentPage');
  const totalPagesEl = document.getElementById('totalPages');
  totalPagesEl.textContent = pageFlip.getPageCount();

  const dots = document.querySelectorAll('.cat-dot');
  
  pageFlip.on('flip', (e) => {
    const pageIndex = e.data;
    currentPageEl.textContent = pageIndex + 1;
    
    // Atualiza os pontos de navegação
    dots.forEach(d => d.classList.remove('active'));
    let activeDot = dots[0];
    for(let i = 0; i < pageMap.length; i++) {
      if (pageIndex >= pageMap[i].pageIndex) {
        activeDot = dots[i];
      }
    }
    if(activeDot) activeDot.classList.add('active');
  });

  // Controles manuais (setas)
  document.getElementById('prevBtn').addEventListener('click', () => pageFlip.flipPrev());
  document.getElementById('nextBtn').addEventListener('click', () => pageFlip.flipNext());

  // 5. Inicializa o Modal de Produtos
  const modal = new ProductModal();
  
  document.querySelectorAll('.book-item').forEach(itemEl => {
    itemEl.addEventListener('click', () => {
      const catId = itemEl.dataset.cat;
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
