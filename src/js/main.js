import { menuData } from './data/menuData.js';
import { renderCategory } from './components/MenuComponent.js';

const mainContent = document.getElementById('mainContent');
const catnavEl = document.getElementById('catnav');
const totop = document.getElementById('totop');

// Build sections + TOC pills
menuData.forEach((cat, i) => {
  mainContent.innerHTML += renderCategory(cat, i + 1);

  const pill = document.createElement('a');
  pill.href = `#${cat.id}`;
  pill.className = 'cat-pill' + (i === 0 ? ' active' : '');
  pill.innerHTML = cat.navLabel;
  pill.onclick = (e) => {
    e.preventDefault();
    const target = document.getElementById(cat.id);
    if(target) {
      // scroll to target, minus sticky header height roughly
      const y = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({top: y, behavior: 'smooth'});
    }
  };
  catnavEl.appendChild(pill);
});

const sections = menuData.map(c => document.getElementById(c.id));
const pills = Array.from(catnavEl.querySelectorAll('.cat-pill'));

// Intersection Observer to highlight active category in nav
const observerOptions = {
  root: null,
  rootMargin: '-100px 0px -40% 0px',
  threshold: 0
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      const index = menuData.findIndex(c => c.id === id);
      if (index !== -1) {
        pills.forEach((p, i) => p.classList.toggle('active', i === index));
        pills[index].scrollIntoView({behavior: 'smooth', inline: 'center', block: 'nearest'});
      }
    }
  });
}, observerOptions);

sections.forEach(sec => {
  if (sec) observer.observe(sec);
});

// Scroll to top button visibility
function onScroll(){
  if (totop) {
    totop.classList.toggle('show', window.scrollY > window.innerHeight * 0.5);
  }
}
window.addEventListener('scroll', onScroll, {passive:true});
onScroll();
