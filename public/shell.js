import { icon, button, e } from './ui.js';

export const navigationGroups = [
  { label:'Service', routes:['overview','reservations','availability','waitlist','holds','cancellations','prep-sheet'] },
  { label:'Menus', routes:['menu-blocks','slots'] },
  { label:'Guests', routes:['users','memberships','membership-plans','private-events'] },
  { label:'Website', routes:['cms','reviews'] },
  { label:'Reports', routes:['analytics','logs'] }
];

export function renderShell(db, ui, content, titles) {
  const activeGroup=navigationGroups.find(group=>group.routes.includes(ui.route))||navigationGroups[0];
  const unread=db.notifications.filter(n=>!n.read).length;
  return `<div class="workspace studio-workspace">
    <header class="studio-header"><div class="studio-masthead"><a class="studio-brand" href="#/overview" aria-label="Daniel × Claire, service board">daniel<span>×</span>claire</a><span class="studio-edition">Service studio <b>03</b></span><div class="studio-header-actions"><a class="library-link" href="/library/" aria-label="Prototype library">${icon('grid')}<span>Prototype library</span></a><button class="icon-button" data-action="notifications" aria-label="Notifications, ${unread} unread">${icon('bell')}${unread?'<span class="unread-dot"></span>':''}</button><button class="studio-account" data-action="account" aria-label="Open demo account menu">DH</button></div></div>
      <nav class="studio-primary" aria-label="Main sections"><div class="studio-nav-inner">${navigationGroups.map(group=>`<a class="studio-section ${activeGroup===group?'active':''}" href="#/${group.routes[0]}" ${activeGroup===group?'aria-current="true"':''}>${group.label}</a>`).join('')}</div></nav>
      <nav class="studio-secondary" aria-label="${e(activeGroup.label)} tools"><div class="studio-nav-inner">${activeGroup.routes.map(route=>`<a href="#/${route}" ${ui.route===route?'class="active" aria-current="page"':''}>${titles[route]}</a>`).join('')}</div></nav>
    </header>
    <main id="main" tabindex="-1">${content}<footer class="subtle-footer"><span><strong>Service studio</strong> · Prototype 03</span><span>Fictional data · Saved in this browser ${button('Reset demo','reset-demo','quiet small')}</span></footer></main>
  </div>`;
}
