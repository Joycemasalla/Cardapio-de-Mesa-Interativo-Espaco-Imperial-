import { menuData } from './data/menuData.js';
import { renderCategory } from './components/MenuComponent.js';
import { ICONS } from './components/icons.js';

const pagesViewport = document.getElementById('pagesViewport');
const catnavEl = document.getElementById('catnav');
const pageNumEl = document.getElementById('pageNum');
const topProgressBar = document.getElementById('topProgressBar');

// Build pages + TOC pills
menuData.forEach((cat, i) => {
  // Pass index so we can number the chapters
  pagesViewport.innerHTML += renderCategory(cat, i + 1);

  const pill = document.createElement('button');
  pill.className = 'cat-pill' + (i === 0 ? ' active' : '');
  pill.innerHTML = (ICONS[cat.icon] || '') + cat.navLabel;
  pill.onclick = () => turnTo(i);
  catnavEl.appendChild(pill);
});

const pages = menuData.map(c => document.getElementById(c.id));
const pills = Array.from(catnavEl.querySelectorAll('.cat-pill'));
const prevArrow = document.getElementById('prevArrow');
const nextArrow = document.getElementById('nextArrow');
const totop = document.getElementById('totop');

let current = 0;
let animating = false;

pages.forEach((p, i) => { p.style.display = i === 0 ? 'block' : 'none'; });

function updateUI(){
  pills.forEach((p, i) => p.classList.toggle('active', i === current));
  if (pageNumEl) pageNumEl.innerText = `Pág. ${current + 1} de ${pages.length}`;
  if (topProgressBar) topProgressBar.style.width = `${((current + 1) / pages.length) * 100}%`;
  
  pills[current].scrollIntoView({behavior:'smooth', inline:'center', block:'nearest'});
  prevArrow.disabled = current === 0;
  nextArrow.disabled = current === pages.length - 1;
}

function turnTo(index){
  if(animating || index === current || index < 0 || index >= pages.length) return;
  animating = true;
  const forward = index > current;
  const outgoing = pages[current];
  const incoming = pages[index];

  incoming.scrollTop = 0;
  incoming.style.display = 'block';
  incoming.style.zIndex = '1';
  incoming.style.transform = 'none';

  outgoing.style.zIndex = '2';
  outgoing.style.transformOrigin = forward ? 'left center' : 'right center';
  outgoing.style.transform = 'rotateY(0deg)';
  outgoing.classList.add('turning');

  // force reflow before animating
  void outgoing.offsetHeight;

  requestAnimationFrame(() => {
    outgoing.style.transform = forward ? 'rotateY(-94deg)' : 'rotateY(94deg)';
  });

  setTimeout(() => {
    outgoing.style.display = 'none';
    outgoing.classList.remove('turning');
    outgoing.style.transform = '';
    current = index;
    animating = false;
    updateUI();
  }, 520);
}

prevArrow.onclick = () => turnTo(current - 1);
nextArrow.onclick = () => turnTo(current + 1);

// swipe gestures
let touchStartX = 0, touchStartY = 0, touchActive = false;
pagesViewport.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  touchActive = true;
}, {passive:true});

pagesViewport.addEventListener('touchend', (e) => {
  if(!touchActive) return;
  touchActive = false;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if(Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4){
    if(dx < 0) turnTo(current + 1); else turnTo(current - 1);
  }
}, {passive:true});

// keyboard nav
window.addEventListener('keydown', (e) => {
  if(e.key === 'ArrowRight') turnTo(current + 1);
  if(e.key === 'ArrowLeft') turnTo(current - 1);
});

function onScroll(){
  totop.classList.toggle('show', window.scrollY > window.innerHeight * 0.9);
}
window.addEventListener('scroll', onScroll, {passive:true});
onScroll();
updateUI();

// Cover animation
const btnEnter = document.getElementById('btnEnter');
if (btnEnter) {
  btnEnter.addEventListener('click', () => {
    const hero = document.getElementById('hero');
    hero.classList.add('open-cover');
    setTimeout(() => {
      document.getElementById('book').scrollIntoView({behavior:'smooth', block:'start'});
    }, 300);
  });
}
