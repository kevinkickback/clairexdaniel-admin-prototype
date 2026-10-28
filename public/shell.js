import { icon, button } from './ui.js';

export const navigationGroups = [
  { label:'Daily service', icon:'calendar', routes:['overview','reservations','prep-sheet'], primary:true },
  { label:'Service tools', icon:'clock', routes:['availability','waitlist','holds','cancellations'] },
  { label:'Menus & website', icon:'book', routes:['menu-blocks','slots','cms','reviews'] },
  { label:'Guests & events', icon:'people', routes:['users','memberships','membership-plans','private-events'] },
  { label:'Reports', icon:'chart', routes:['analytics','logs'] }
];
const icons = { overview:'grid', reservations:'calendar', 'prep-sheet':'prep' };

export function renderShell(db, ui, content, titles) {
  const item = route => `<a class="nav-item ${ui.route===route?'active':''}" href="#/${route}" ${ui.route===route?'aria-current="page"':''}>${icons[route]?icon(icons[route]):''}<span>${route==='overview'?'Today':titles[route]}</span></a>`;
  const unread = db.notifications.filter(n=>!n.read).length;
  return `<aside class="sidebar" id="workspace-navigation" aria-label="Main navigation">
    <button class="icon-button sidebar-close" data-action="close-nav" aria-label="Close navigation">${icon('close')}</button>
    <a class="brand" href="#/overview"><div class="brand-name">daniel <span>×</span> claire</div><span class="brand-caption">Restaurant workspace</span></a>
    <nav class="nav-scroll" aria-label="Restaurant tools">
      <div class="nav-primary">${navigationGroups[0].routes.map(item).join('')}</div>
      <p class="nav-label">Manage</p>
      ${navigationGroups.slice(1).map((group,index)=>`<details class="nav-section" data-disclosure="nav-${index}" ${ui.disclosures?.[`nav-${index}`]??group.routes.includes(ui.route)?'open':''}><summary>${icon(group.icon)}<span>${group.label}</span>${icon('chevron','nav-chevron')}</summary><div class="nav-children">${group.routes.map(item).join('')}</div></details>`).join('')}
    </nav>
    <div class="sidebar-foot"><span class="concept-number">02</span><div><strong>Calm service</strong><small>Prototype · Mock data only</small></div></div>
  </aside>
  <button class="nav-veil" data-action="close-nav" aria-label="Close navigation" tabindex="-1"></button>
  <div class="workspace"><header class="topbar"><div class="breadcrumb"><button class="icon-button mobile-toggle" data-action="toggle-nav" aria-label="Open navigation" aria-expanded="false" aria-controls="workspace-navigation">${icon('menu')}</button><span>Workspace</span>${icon('chevron')}<span>${titles[ui.route]}</span></div><div class="topbar-actions"><a class="library-link" href="/library/" aria-label="Prototype library">${icon('grid')}<span>Prototype library</span></a><button class="icon-button" data-action="notifications" aria-label="Notifications, ${unread} unread">${icon('bell')}${unread?'<span class="unread-dot"></span>':''}</button><button class="profile" data-action="account" aria-label="Open demo account menu"><span class="avatar">DH</span></button></div></header>
    <main id="main" tabindex="-1">${content}<footer class="subtle-footer"><span>Calm service <span aria-hidden="true">·</span> Prototype 02</span><span>Fictional data · Saved in this browser ${button('Reset demo','reset-demo','quiet small')}</span></footer></main>
  </div>`;
}
