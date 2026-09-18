import { menuData } from './data/menuData.js';
import { buildPages } from './pageBuilder.js';
import { ProductModal } from './components/ProductModal.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Constrói as páginas HTML
  const pageMap = buildPages();
  const pages = Array.from(document.querySelectorAll('.page'));
  let currentPageIndex = 0;

  // Inicializa o estado visual das páginas
  function updatePagesVisualState() {
    pages.forEach((page, index) => {
      // Remove todas as classes de estado
      page.classList.remove('active', 'flipped', 'flipping-back');

      if (index === currentPageIndex) {
        page.classList.add('active');
        page.style.zIndex = 10;
      } else if (index < currentPageIndex) {
        // Páginas anteriores já foram viradas para a esquerda
        page.classList.add('flipped');
        page.style.zIndex = 5;
      } else {
        // Páginas futuras estão aguardando
        page.style.zIndex = 1;
      }
    });

    updateNavState();
  }

  function turnToPage(index) {
    if (index < 0 || index >= pages.length) return;
    
    // Se estivermos voltando páginas
    if (index < currentPageIndex) {
      for (let i = index; i <= currentPageIndex; i++) {
        if (pages[i]) {
          pages[i].style.zIndex = 6; // Coloca a que vai voltar um pouco acima das outras futuras
          pages[i].classList.remove('flipped');
          pages[i].classList.add('flipping-back');
          // Forçar reflow para a animação rodar
          void pages[i].offsetWidth; 
        }
      }
    }

    currentPageIndex = index;
    updatePagesVisualState();
  }

  function flipNext() {
    if (currentPageIndex < pages.length - 1) {
      turnToPage(currentPageIndex + 1);
    }
  }

  function flipPrev() {
    if (currentPageIndex > 0) {
      turnToPage(currentPageIndex - 1);
    }
  }

  // Set inicial
  updatePagesVisualState();

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
      turnToPage(nav.pageIndex);
    });
    navInner.appendChild(btn);
  });

  // 3. Botão de menu hamburguer — abre/fecha o drawer de categorias
  const menuBtn  = document.getElementById('menuBtn');
  const menuDrawer = document.getElementById('menuDrawer');
  const menuOverlay = document.getElementById('menuOverlay');
  const drawerList = document.getElementById('drawerList');

  pageMap.forEach((nav, i) => {
    const item = document.createElement('button');
    item.className = 'drawer-item';
    item.textContent = nav.label;
    item.dataset.index = i;
    item.addEventListener('click', () => {
      turnToPage(nav.pageIndex);
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

  // 4. Indicadores de página
  const currentPageEl = document.getElementById('currentPage');
  const totalPagesEl  = document.getElementById('totalPages');
  totalPagesEl.textContent = pages.length;

  const dots = document.querySelectorAll('.cat-dot');
  const drawerItems = document.querySelectorAll('.drawer-item');

  function updateNavState() {
    currentPageEl.textContent = currentPageIndex + 1;

    // Encontra a categoria ativa baseada na página atual
    let activeIdx = 0;
    for (let i = 0; i < pageMap.length; i++) {
      if (currentPageIndex >= pageMap[i].pageIndex) activeIdx = i;
    }

    dots.forEach((d, i) => d.classList.toggle('active', i === activeIdx));
    if (dots[activeIdx]) {
      dots[activeIdx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    drawerItems.forEach((d, i) => d.classList.toggle('active', i === activeIdx));
  }


  // 5. Controles: Setas e Teclado
  document.getElementById('prevBtn').addEventListener('click', flipPrev);
  document.getElementById('nextBtn').addEventListener('click', flipNext);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') flipNext();
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   flipPrev();
    if (e.key === 'Escape') closeDrawer();
  });


  // 6. Swipe events para touch (Mobile)
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;
  
  const flipbookContainer = document.getElementById('flipbook');
  
  flipbookContainer.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, {passive: true});

  flipbookContainer.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
  }, {passive: true});

  function handleSwipe() {
    const xDiff = touchStartX - touchEndX;
    const yDiff = Math.abs(touchStartY - touchEndY);
    
    // Ignora swipes muito verticais (usados para scroll)
    if (yDiff > Math.abs(xDiff) * 1.5) return;
    
    // Swipe distance threshold
    if (Math.abs(xDiff) > 50) {
      if (xDiff > 0) {
        // Swipe left = Next page
        flipNext();
      } else {
        // Swipe right = Prev page
        flipPrev();
      }
    }
  }


  // 7. Interações de Produtos (Accordion e Modal)
  const modal = new ProductModal();

  document.addEventListener('click', (e) => {
    const item = e.target.closest('.book-item');
    if (!item) return;

    // Se tiver descrição, faz o toggle do accordion em vez de abrir modal
    // Vamos verificar se clicou na descricao ou no header
    const hasDescWrapper = item.querySelector('.book-item-desc-wrapper');
    
    // Se o prato tem opções complexas (array options em menuData), abre modal.
    // Senão, apenas expande a descrição inline se existir.
    const catId  = item.dataset.cat;
    const itemId = item.dataset.item;

    const cat = menuData.find(c => c.id === catId);
    if (cat) {
      const product = cat.items.find(p => p.id === itemId);
      if (product) {
        if (product.options && product.options.length > 0) {
          // Tem variações de preço, abre o modal
          modal.open(product, cat);
        } else if (hasDescWrapper) {
          // Apenas alterna a visualização da descrição
          item.classList.toggle('expanded');
        }
      }
    }
  });
});
