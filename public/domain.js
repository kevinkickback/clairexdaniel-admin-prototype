import { createSeed, STORAGE_KEY, TODAY } from './mock-data.js';
export { TODAY };
export const occupiesSeat = r => ['confirmed','seated','served'].includes(r.status);
export const sum = (rows, key='party') => rows.reduce((n,r)=>n+(Number(r[key])||0),0);
export function scopedReservations(db, menu='all', date='all') {return db.reservations.filter(r=>(menu==='all'||r.menu===menu)&&(date==='all'||r.date===date));}
export function availability(db, menuId, date, time, excludeId) {
  const menu=db.menus.find(m=>m.id===menuId);
  if(!menu||!menu.dates.includes(date)||!db.slots.some(s=>s.time===time)) return {capacity:0,booked:0,held:0,left:0,valid:false};
  const booked=sum(db.reservations.filter(r=>r.id!==excludeId&&r.menu===menuId&&r.date===date&&r.time===time&&occupiesSeat(r)));
  const held=sum(db.holds.filter(h=>h.menu===menuId&&h.date===date&&h.time===time&&h.status==='active'));
  return {capacity:menu.capacity,booked,held,left:Math.max(0,menu.capacity-booked-held),valid:true};
}
export function validateReservation(db,r,{override=false}={}) {
  if(!r.name?.trim()) return 'Enter the guest’s name.';
  if(!r.email||!/^\S+@\S+\.\S+$/.test(r.email)) return 'Enter a valid email address.';
  if(!r.phone?.trim()) return 'Enter a phone number.';
  if(!Number.isInteger(Number(r.party))||Number(r.party)<1||Number(r.party)>50) return 'Party size must be a whole number from 1 to 50.';
  if(!['confirmed','seated','served','cancelled','no-show'].includes(r.status)) return 'Choose a valid reservation status.';
  const slot=availability(db,r.menu,r.date,r.time,r.id);
  if(!slot.valid) return 'Choose a valid menu, service date, and time slot.';
  if(occupiesSeat(r)&&slot.left<Number(r.party)&&!override) return `Only ${slot.left} seats remain. Select the overbooking confirmation to continue.`;
  return '';
}
export function upsertReservation(db,record,options={}) {
  const error=validateReservation(db,record,options); if(error) throw new Error(error);
  const data={...record,name:record.name.trim(),party:Number(record.party)};
  const menu=db.menus.find(m=>m.id===data.menu);
  data.courses=Array.from({length:data.party},(_,i)=>{const previous=record.courses?.[i];return previous&&menu.courses.includes(previous.course)?{...previous}:{name:i===0?data.name:`Guest ${i+1}`,course:menu.courses[0]};});
  const index=db.reservations.findIndex(r=>r.id===data.id);
  if(index<0) db.reservations.push(data); else db.reservations[index]=data;
  return data;
}
export function transitionReservation(db,id,status) {
  const r=db.reservations.find(r=>r.id===id); if(!r) throw new Error('Reservation not found.');
  if(!['confirmed','seated','served','cancelled','no-show'].includes(status)) throw new Error('Unknown status.');
  r.status=status;
  r.charge=status==='no-show'?Number(db.content.noShowFee)*r.party:0;
  return r;
}
export function loadState(storage) {
  try {const parsed=JSON.parse(storage.getItem(STORAGE_KEY)); if(parsed?.schema===1&&['menus','slots','reservations','waitlist','holds','plans','members','reviews','events','notifications','logs'].every(k=>Array.isArray(parsed[k]))&&parsed.content) return parsed;}catch{}
  return createSeed();
}
export function saveState(db,storage) {storage.setItem(STORAGE_KEY,JSON.stringify(db));}
export function log(db,action,detail='') {db.logs.unshift({id:uid('l'),at:new Date().toISOString(),action,detail,actor:'Demo host'});}
export const uid = prefix => prefix+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
export function filterByText(rows,query,keys=['name','phone','email']) {const q=query.trim().toLowerCase();return q?rows.filter(r=>keys.some(k=>String(r[k]||'').toLowerCase().includes(q))):rows;}
export function groupBy(rows,key) {return rows.reduce((all,r)=>{const value=typeof key==='function'?key(r):r[key];(all[value]??=[]).push(r);return all;},{});}
export function courseCounts(rows) {return rows.flatMap(r=>r.courses||[]).reduce((all,g)=>{all[g.course]=(all[g.course]||0)+1;return all;},{});}
export function safeCsv(rows) {return '\uFEFF'+rows.map(row=>row.map(value=>{let s=String(value??''); if(/^[=+@\-\t\r]/.test(s))s="'"+s; return '"'+s.replaceAll('"','""')+'"';}).join(',')).join('\r\n');}
