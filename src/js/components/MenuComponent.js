import { TAG_ICON } from './icons.js';

function money(v){
  if(v === null || v === undefined) return null;
  return 'R$ ' + v.toFixed(2).replace('.', ',');
}

function renderItem(it){
  const hasDesc = !!it.desc;
  
  // Format the price string based on single price or options
  let priceHtml = '';
  if (it.price !== null && it.price !== undefined) {
    priceHtml = `<div class="item-price">${money(it.price)}</div>`;
  } else if (it.options && it.options.length > 0) {
    // e.g. "P R$ 42,00 · M R$ 48,00 · G R$ 53,00"
    const optsStr = it.options.map(o => `${o.label} ${money(o.price)}`).join(' &middot; ');
    priceHtml = `<div class="item-desc" style="color:var(--gold-soft);font-weight:600;margin-top:2px;">${optsStr}</div>`;
  } else {
    priceHtml = `<div class="item-price" style="color:var(--muted-2);font-size:12px;font-style:italic;">Consulte</div>`;
  }

  // Se a descrição for muito longa, usamos a funcionalidade de expandir. Mas como pedido pelo usuário:
  // "pode ficar sempre visivel e quando clicar expandir".
  // Vou deixar a descrição base sempre visível. Se quiser estender, abre mais.
  // Como o lovable não expande muito, a descrição fica ali mesmo.
  // Vou usar o `<div class="item-desc">` que fica sempre visível.
  
  return `
  <div class="item-card" ${hasDesc ? 'onclick="this.classList.toggle(\'open\')"' : ''}>
    <div class="item-avatar">${it.avatar || it.name.substring(0,2).toUpperCase()}</div>
    <div class="item-content">
      <div class="item-header">
        <h3 class="item-name">${it.name}</h3>
        ${it.price !== null && it.price !== undefined ? priceHtml : ''}
      </div>
      ${hasDesc ? `<p class="item-desc">${it.desc}</p>` : ''}
      ${it.price === null && it.options && it.options.length > 0 ? priceHtml : ''}
    </div>
  </div>`;
}

export function renderCategory(cat, index){
  let inner = `
  <section class="category" id="${cat.id}">
    <div class="cat-header-row">
      <h2 class="cat-title">${cat.title}</h2>
      <span class="cat-index">${String(index).padStart(2, '0')}</span>
    </div>
    ${cat.banner ? `
    <div class="cat-banner" style="background-image:url('${cat.banner}')">
      <div class="cat-banner-label">Imagem ilustrativa</div>
    </div>
    ` : ''}
    ${cat.subtitle ? `<p class="item-desc" style="margin-bottom:16px;">${cat.subtitle}</p>` : ''}
    <div class="cat-body">
  `;

  if (cat.items && cat.items.length > 0) {
    cat.items.forEach(it => { inner += renderItem(it); });
  }

  inner += `</div></section>`;
  return inner;
}
