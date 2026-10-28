export const e = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths = {
  grid:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  calendar:'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2z',
  clock:'M12 8v5l3 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  people:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87 M13 3.13a4 4 0 0 1 0 7.75 M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  list:'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  close:'M6 6l12 12M6 18 18 6',
  shield:'M12 3l8 3v6c0 5-8 9-8 9S4 17 4 12V6z M8 12l3 3 5-6',
  prep:'M6 3h12v18H6z M9 7h6M9 11h6M9 15h6',
  menu:'M4 5h16M4 12h16M4 19h16',
  chevron:'M9 5l7 7-7 7',
  arrow:'M4 12h16m-6-6 6 6-6 6',
  plus:'M12 5v14M5 12h14',
  search:'M21 21l-6-6M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
  bell:'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',
  check:'M5 12l4 4L19 6',
  leaf:'M20 4C10 2 2 8 6 15s14 2 14-11z M5 20l10-11',
  book:'M12 5c-3-2-6-2-10-1v16c4-1 7-1 10 1 3-2 6-2 10-1V4c-4-1-7-1-10 1z M12 5v16',
  chart:'M4 20V10m7 10V4m7 16v-7M2 22h20',
  file:'M14 2H4v20h16V8z M14 2v6h6M8 12h8M8 16h8',
  settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M8 3l1-1h6l1 3 3 1 2 3-2 3 1 3-3 3-3-1-2 3-4-1-1-3-3-1-1-4 2-2-1-3 3-2z',
  star:'m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z',
  download:'M12 3v12m-5-5 5 5 5-5 M4 17v4h16v-4',
  lock:'M6 10h12v11H6z M8 10V6a4 4 0 0 1 8 0v4',
  info:'M12 11v6m0-10v.01 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  logout:'M9 3H3v18h6m5-15 6 6-6 6m-6-6h12',
  refresh:'M20 7v5h-5M4 17v-5h5 M6 6a8 8 0 0 1 13 3M5 15a8 8 0 0 0 13 3'
};
export const icon=(name,cls='')=>`<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${(paths[name]||paths.grid).split(' M').map((p,i)=>`<path d="${i?'M':''}${p}"/>`).join('')}</svg>`;
export const dateLabel=(date,long=false)=>new Date(date+'T12:00:00').toLocaleDateString('en-US',{weekday:long?'long':'short',month:long?'long':'short',day:'numeric'});
export const timeLabel=time=>{if(time==='Any time')return time;const [h,m]=String(time).split(':').map(Number);return `${h%12||12}:${String(m||0).padStart(2,'0')} ${h<12?'AM':'PM'}`;};
export const money=n=>Number(n).toLocaleString('en-US',{style:'currency',currency:'USD'});
export const initials=name=>name.split(' ').map(n=>n[0]).slice(0,2).join('');
export const badge=(text,type='')=>`<span class="badge ${type||String(text).toLowerCase().replaceAll(' ','-')}">${e(text)}</span>`;
export const button=(label,action,cls='secondary',attrs='')=>`<button class="btn ${cls}" data-action="${action}" ${attrs}>${label}</button>`;
export const link=(label,route,cls='text-link')=>`<a class="${cls}" href="#/${route}">${label}</a>`;
export function select(label,name,options,value,attrs='') {return `<label class="field compact"><span>${e(label)}</span><select name="${name}" aria-label="${e(label)}" data-filter="${name}" ${attrs}>${options.map(o=>{const [v,l]=Array.isArray(o)?o:[o,o];return `<option value="${e(v)}" ${String(value)===String(v)?'selected':''}>${e(l)}</option>`;}).join('')}</select></label>`;}
export function search(placeholder,value='',name='q') {return `<label class="search">${icon('search')}<span class="sr-only">${e(placeholder)}</span><input type="search" name="${name}" data-search="${name}" placeholder="${e(placeholder)}" value="${e(value)}" autocomplete="off"></label>`;}
export function tabs(items,selected,filter='view') {return `<div class="tabs" aria-label="View">${items.map(([v,label])=>`<button class="tab ${selected===v?'active':''}" data-action="tab" data-filter-key="${filter}" data-value="${v}" aria-pressed="${selected===v}">${e(label)}</button>`).join('')}</div>`;}
export const empty=(title,body,action='')=>`<div class="empty">${icon('search')}<h3>${e(title)}</h3><p>${e(body)}</p>${action}</div>`;
export function pageHead(title,subtitle,actions='',eyebrow='Restaurant workspace') {return `<div class="page-heading"><div><p class="eyebrow">${eyebrow}</p><h1 tabindex="-1" id="page-title">${title}</h1><p class="subtitle">${subtitle}</p></div><div class="heading-actions">${actions}</div></div>`;}
export function pager(count,page=1,size=10) {const pages=Math.max(1,Math.ceil(count/size));return `<div class="pagination"><span>${count?`${(page-1)*size+1}–${Math.min(page*size,count)} of ${count}`:'0 results'}</span><div>${button('Previous','page','quiet',`data-page="${page-1}" ${page<=1?'disabled':''}`)}<span aria-live="polite">Page ${page} of ${pages}</span>${button('Next','page','quiet',`data-page="${page+1}" ${page>=pages?'disabled':''}`)}</div></div>`;}
export function table(headers,rows,caption,cls='') {return `<div class="table-scroll" tabindex="0" role="region" aria-label="${e(caption)}"><table class="${cls}"><caption class="sr-only">${e(caption)}</caption><thead><tr>${headers.map(h=>`<th scope="col">${h||'<span class="sr-only">Actions</span>'}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;}
export const field=(label,name,value='',type='text',attrs='')=>`<label class="field"><span>${e(label)}</span><input name="${name}" type="${type}" value="${e(value)}" ${attrs}></label>`;
export const area=(label,name,value='',attrs='')=>`<label class="field full"><span>${e(label)}</span><textarea name="${name}" rows="3" ${attrs}>${e(value)}</textarea></label>`;
export const formSelect=(label,name,options,value,attrs='')=>select(label,name,options,value,attrs).replace(` data-filter="${name}"`,'');
