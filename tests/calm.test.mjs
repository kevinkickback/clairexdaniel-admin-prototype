import test from 'node:test';
import assert from 'node:assert/strict';
import { createSeed, TODAY, STORAGE_KEY } from '../public/mock-data.js';
import { navigationGroups, renderShell } from '../public/shell.js';
import { renderView, titles, prepColumns } from '../public/views.js';

const state = route => ({ route, menu:'med', date:TODAY, filters:{}, disclosures:{}, columns:prepColumns.map(([key])=>key) });

test('The quieter navigation still exposes every screen and opens the active section', () => {
  const routes=navigationGroups.flatMap(group=>group.routes);
  assert.deepEqual([...routes].sort(),Object.keys(titles).sort());
  assert.equal(new Set(routes).size,routes.length);
  for(const route of routes) {
    const html=renderShell(createSeed(),state(route),'',titles);
    assert.match(html,new RegExp(`href="#/${route}" aria-current="page"`));
    const group=navigationGroups.find(group=>group.routes.includes(route));
    if(!group.primary)assert.ok(html.includes(`open><summary>`)&&html.includes(group.label));
  }
});

test('The overview keeps operational counts visible and detailed reports available on demand', () => {
  const db=createSeed(),ui=state('overview'),html=renderView(db,ui);
  assert.match(html,/Expected guests/);
  assert.match(html,/Seats available/);
  assert.match(html,/On the waitlist/);
  assert.match(html,/Dietary notes/);
  assert.match(html,/data-disclosure="seating" ><summary>/);
  assert.match(html,/data-disclosure="insights" ><summary>/);
  for(const label of ['guests yet to serve','parties already served','guest profiles','people on waitlist','Menu performance'])assert.ok(html.includes(label),label);
  ui.disclosures={seating:true,insights:true};
  assert.match(renderView(db,ui),/data-disclosure="seating" open>/);
  assert.match(renderView(db,ui),/data-disclosure="insights" open>/);
});

test('Before-service holds use both the selected menu and date', () => {
  const db=createSeed(),ui=state('overview');
  db.holds=[{ id:'same-date-other-menu',menu:'well',date:TODAY,status:'active',party:2 }];
  assert.match(renderView(db,ui),/<span class="needs-count">0<\/span><div><strong>Active holds/);
});

test('Reservation filters remain usable and make applied hidden filters discoverable', () => {
  const db=createSeed(),ui=state('reservations');
  ui.filters.reservations={day:TODAY,status:'confirmed'};
  const html=renderView(db,ui);
  assert.match(html,/Filters · Applied/);
  assert.match(html,/aria-label="Day"/);
  assert.match(html,/aria-label="Status"/);
  assert.doesNotMatch(html,/no-show<\/span>/);
  assert.ok(!STORAGE_KEY.endsWith('-v1'));
});

test('Menu cards keep release, capacity, dates, and edit/delete actions', () => {
  const ui=state('menu-blocks'),html=renderView(createSeed(),ui);
  for(const text of ['seasonal-menu.png','seats / slot','service dates','Pre-release','data-action="edit-menu"','data-action="delete-menu"'])assert.ok(html.includes(text),text);
});
