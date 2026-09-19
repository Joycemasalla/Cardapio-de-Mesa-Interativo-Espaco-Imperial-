import { menuData } from './data/menuData.js';
import { buildPages } from './pageBuilder.js';
import { ProductModal } from './components/ProductModal.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Constrói as páginas HTML
  const pageMap = buildPages();

  // 2. Constrói os botões de categoria na nav
  const navInner = document.getElementById('flipNavInner');
  pageMap.forEach((nav, i) => {
    const btn = document.createElement('button');
    btn.className = 'cat-dot';
    btn.setAttribute('aria-label', nav.label);
    btn.dataset.page = nav.pageIndex;
    btn.textContent = nav.label;
    if (i === 0) btn.classList.add('active');

    btn.addEventListener('click', () => {
      if (window.pageFlip) {
        window.pageFlip.turnToPage(nav.pageIndex);
      }
    });
    navInner.appendChild(btn);
  });

  // 3. Botão de menu hamburguer — abre/fecha o drawer de categorias
  const menuBtn  = document.getElementById('menuBtn');
  const menuDrawer = document.getElementById('menuDrawer');
  const menuOverlay = document.getElementById('menuOverlay');

  // Popula o drawer com as categorias
  const drawerList = document.getElementById('drawerList');
  pageMap.forEach((nav, i) => {
    const item = document.createElement('button');
    item.className = 'drawer-item';
    item.textContent = nav.label;
    item.dataset.index = i;
    item.addEventListener('click', () => {
      if (window.pageFlip) {
        window.pageFlip.turnToPage(nav.pageIndex);
      }
      closeDrawer();
    });
    drawerList.appendChild(item);
  });

  function openDrawer()  {
    menuDrawer.classList.add('open');
    menuOverlay.classList.add('open');
  }
  function closeDrawer() {
    menuDrawer.classList.remove('open');
    menuOverlay.classList.remove('open');
  }

  menuBtn.addEventListener('click', () => {
    menuDrawer.classList.contains('open') ? closeDrawer() : openDrawer();
  });
  menuOverlay.addEventListener('click', closeDrawer);

  const flipbookEl = document.getElementById('flipbook');

  // 4. Configura e inicializa o PageFlip
  const isMobile = window.innerWidth < 768;
  const PageFlip  = window.St.PageFlip;

  const pageFlip = new PageFlip(flipbookEl, {
    width:               Math.min(window.innerWidth, 480),
    height:              window.innerHeight,
    size:                'stretch',
    minWidth:            300,
    maxWidth:            520,
    minHeight:           480,
    maxHeight:           1200,
    drawShadow:          true,
    showCover:           true,
    usePortrait:         true,
    mobileScrollSupport: false,
    swipeDistance:       20,
    clickEventForward:   false,
    maxShadowOpacity:    0.35,
    autoSize:            true,
    flippingTime:        700,
  });

  pageFlip.loadFromHTML(document.querySelectorAll('.page'));
  window.pageFlip = pageFlip;

  // 5. Atualiza indicadores ao virar página
  const currentPageEl = document.getElementById('currentPage');
  const totalPagesEl  = document.getElementById('totalPages');
  totalPagesEl.textContent = pageFlip.getPageCount();

  const dots = document.querySelectorAll('.cat-dot');
  const drawerItems = document.querySelectorAll('.drawer-item');

  pageFlip.on('flip', (e) => {
    const pageIndex = e.data;
    currentPageEl.textContent = pageIndex + 1;

    // Encontra a categoria ativa
    let activeIdx = 0;
    for (let i = 0; i < pageMap.length; i++) {
      if (pageIndex >= pageMap[i].pageIndex) activeIdx = i;
    }

    // Atualiza pills da nav
    dots.forEach((d, i) => {
      d.classList.toggle('active', i === activeIdx);
    });
    if (dots[activeIdx]) {
      dots[activeIdx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    // Atualiza items do drawer
    drawerItems.forEach((d, i) => d.classList.toggle('active', i === activeIdx));
  });

  // 6. Setas de navegação
  document.getElementById('prevBtn').addEventListener('click', () => pageFlip.flipPrev());
  document.getElementById('nextBtn').addEventListener('click', () => pageFlip.flipNext());

  // Suporte a teclado
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') pageFlip.flipNext();
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   pageFlip.flipPrev();
    if (e.key === 'Escape') closeDrawer();
  });

  // 7. Modal de Produtos
  const modal = new ProductModal();

  // Bloqueia o PageFlip SOMENTE quando o toque começa em cima de um item.
  // Usamos uma flag para rastrear se o gesto começou em um item.
  // Desta forma, arrastar fora dos itens continua virando a página normalmente.
  let touchOnItem = false;
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.book-item')) {
      touchOnItem = true;
      touchStartX = e.clientX;
      touchStartY = e.clientY;
      e.stopPropagation();
    } else {
      touchOnItem = false;
    }
  }, true);

  document.addEventListener('pointermove', (e) => {
    if (!touchOnItem) return;
    const dx = Math.abs(e.clientX - touchStartX);
    const dy = Math.abs(e.clientY - touchStartY);
    // Se arrastou mais de 10px horizontalmente, libera para o PageFlip virar
    if (dx > 10 && dx > dy) {
      touchOnItem = false;
      // Não para propagação — PageFlip vai capturar
    } else if (dx > 4 || dy > 4) {
      e.stopPropagation();
    }
  }, true);

  document.addEventListener('pointerup', () => { touchOnItem = false; }, true);
  document.addEventListener('mousedown', (e) => {
    if (e.target.closest('.book-item')) e.stopPropagation();
  }, true);

  // Agora o click abre o modal normalmente
  document.addEventListener('click', (e) => {
    const item = e.target.closest('.book-item');
    if (!item) return;

    e.stopPropagation();

    const catId  = item.dataset.cat;
    const itemId = item.dataset.item;

    const cat = menuData.find(c => c.id === catId);
    if (cat) {
      const product = cat.items.find(p => p.id === itemId);
      if (product) modal.open(product, cat);
    }
  }, true);
});
