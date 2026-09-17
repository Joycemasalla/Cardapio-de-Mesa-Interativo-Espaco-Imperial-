import { TAG_ICON } from './icons.js';

function money(v){
  if(v === null) return null;
  return 'R$ ' + v.toFixed(2).replace('.', ',');
}

function renderItem(it){
  const hasDesc = !!it.desc;
  return `
  <div class="item${hasDesc ? '' : ' no-desc'}" ${hasDesc ? '' : 'style="cursor:default"'}>
    <div class="item-row" ${hasDesc ? 'onclick="this.closest(\'.item\').classList.toggle(\'open\')"' : ''}>
      <span class="item-name">${it.name}${it.tag ? `<span class="item-tag">${it.tag}</span>` : ''}</span>
      <span class="item-leader"></span>
      <span class="item-price ${it.price === null ? 'na' : ''}">${it.price === null ? (it.priceLabel || 'Consulte o garçom') : money(it.price)}</span>
      ${hasDesc ? '<span class="item-caret"></span>' : ''}
    </div>
    ${hasDesc ? `<p class="item-desc">${it.desc}</p>` : ''}
  </div>`;
}

export function renderCategory(cat){
  let inner = `
  <section class="page category" id="${cat.id}">
    <div class="cat-banner" style="background-image:url('${cat.banner}')">
      <div class="cat-banner-label">
        <h2 class="cat-title">${cat.title}</h2>
        ${cat.subtitle ? `<p class="cat-note">${cat.subtitle}</p>` : ''}
      </div>
    </div>
    <div class="cat-body">
  `;

  (cat.blocks || []).forEach(block => {
    if(block.type === 'subhead'){
      inner += `<div class="ribbon">${TAG_ICON}${block.label}</div>`;
      if(block.note) inner += `<p class="subnote">${block.note}</p>`;
    } else if(block.type === 'pricestrip'){
      inner += `<div class="price-strip">`;
      block.options.forEach(o => {
        inner += `<div class="price-chip"><b>${money(o.price)}</b><span>${o.label}</span></div>`;
      });
      inner += `</div>`;
    } else if(block.type === 'items'){
      block.items.forEach(it => { inner += renderItem(it); });
    } else if(block.type === 'tier'){
      inner += `<div class="tier-card"><p class="tier-name">${block.name}</p>`;
      if(block.desc) inner += `<p class="tier-desc">${block.desc}</p>`;
      block.groups.forEach(g => {
        if(g.label) inner += `<div class="tier-group-label">${g.label}</div>`;
        inner += `<div class="tier-options">`;
        g.opts.forEach(o => {
          inner += `<div class="tier-opt"><span class="t-label">${o.label}</span><span class="t-price">${money(o.price)}</span></div>`;
        });
        inner += `</div>`;
      });
      if(block.extra) inner += `<p class="tier-extra">${block.extra}</p>`;
      inner += `</div>`;
    } else if(block.type === 'note'){
      inner += `<div class="info-block"><p>${block.text}</p></div>`;
    }
  });

  inner += `</div><div class="page-edge-shade"></div></section>`;
  return inner;
}
