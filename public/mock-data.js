export const TODAY = '2026-10-28';
export const STORAGE_KEY = 'dxc-admin-prototype-v2';
const names = ['Avery Ellis','Rowan Brooks','Jordan Vale','Morgan Reed','Quinn Rivers','Riley Stone','Sage Monroe','Taylor Finch','Emerson Lake','Casey Rowan','Jamie West','Parker Bell','Alex Linden','Drew Hart','Cameron Wells','Blair Hayes','Reese Arden','Finley Moss','Charlie Hale','Skyler Lane','Robin Frost','Dakota Wynn','Marley Fox','Remy Cole'];
export function createSeed() {
  const slots = ['17:30','18:00','18:30','19:00','19:30','20:00'].map((time,i) => ({id:'s'+i,time}));
  const menus = [
    {id:'med',name:'Mediterranean 2026',category:'Public',active:true,release:'Open',releaseAt:'2026-08-31T10:00',capacity:8,dates:[TODAY,'2026-10-29','2026-10-30'],description:'A six-course journey around the Mediterranean.',courses:['Roasted Aleppo chicken','Grilled lamb & beef','Seasonal vegetarian']},
    {id:'german',name:'German autumn',category:'Public',active:true,release:'Pre-release',releaseAt:'2026-11-02T10:00',capacity:8,dates:['2026-11-06','2026-11-07','2026-11-13'],description:'A seasonal German tasting menu.',courses:['Braised short rib','Roasted chicken','Wild mushroom spaetzle']},
    {id:'well',name:'The Well',category:'Private',active:true,release:'Open',releaseAt:'2026-10-15T10:00',capacity:20,dates:[TODAY],description:'Private dining at the chef’s table.',courses:['Roasted Aleppo chicken','Grilled lamb & beef','Seasonal vegetarian']},
    {id:'sides',name:'Thanksgiving sides',category:'Pop-up',active:false,release:'Pre-release',releaseAt:'2026-11-09T10:00',capacity:50,dates:['2026-11-25'],description:'Thanksgiving collection menu.',courses:['Classic collection','Vegetarian collection']},
    {id:'asia',name:'Mexican + Asia',category:'Public',active:false,release:'Open',releaseAt:'2026-06-29T10:00',capacity:8,dates:['2026-09-24','2026-09-25'],description:'From our previous season.',courses:['Miso short rib','Chile chicken','Market vegetables']}
  ];
  const reservations = [];
  for (let i=0;i<66;i++) {
    const past=i>=48, date=past?['2026-09-24','2026-09-25'][i%2]:[TODAY,'2026-10-29','2026-10-30'][Math.floor(i/16)];
    const menu=past?'asia':'med', party=i%7===0?4:2;
    const status = past?'served':i===14?'cancelled':i===15?'no-show':i<3?'served':i===3?'seated':'confirmed';
    const menuObj=menus.find(m=>m.id===menu);
    reservations.push({id:'r'+(100+i),name:names[i%names.length],email:`guest${i+1}@example.com`,phone:`202-555-${String(100+i).padStart(4,'0')}`,date,time:slots[Math.floor((i%16)/3)%6].time,menu,party,status,kitchen:i%9===0,allergies:i%11===0?'Tree nuts':i%8===0?'Dairy':'',occasion:i%7===0?'Anniversary':i%5===0?'Birthday':'',note:i===5?'Prefers a quieter table.':i===11?'Arriving 10 minutes early.':'',created:past?'2026-08-31T14:30':i%names.length>=18?'2026-10-24T14:30':'2026-10-19T14:30',visits:i%6+1,remembered:i%3,courses:Array.from({length:party},(_,n)=>({name:n===0?names[i%names.length]:`Guest ${n+1}`,course:menuObj.courses[(i+n)%menuObj.courses.length]})),charge:0});
  }
  const waitlist=Array.from({length:27},(_,i)=>({id:'w'+i,name:names[(i+5)%names.length],phone:`202-555-${String(200+i).padStart(4,'0')}`,date:['2026-10-28','2026-10-29','2026-10-30'][i%3],time:i%3===0?'Any time':slots[i%6].time,menu:'med',party:i%5===0?4:2,note:i%6===0?'Flexible after 6 PM.':'',status:i===26?'offered':'open',created:i<5?'2026-10-24':'2026-10-19'}));
  return {schema:1,menus,slots,reservations,waitlist,
    holds:[{id:'h1',name:'Sam Birch',menu:'med',date:TODAY,time:'19:30',party:2,expires:'2026-10-28T17:00',status:'active'},{id:'h2',name:'Eden Park',menu:'med',date:'2026-10-29',time:'18:00',party:3,expires:'2026-10-29T12:00',status:'active'}],
    plans:[{id:'p1',name:'Friends & Family',active:true,grant:'Admin granted',price:0,seats:2,perMenu:1,earlyHours:1,duration:0},{id:'p2',name:'Chef’s Circle',active:true,grant:'Subscription',price:45,seats:4,perMenu:2,earlyHours:24,duration:365}],
    members:Array.from({length:9},(_,i)=>({id:'m'+i,name:names[i],email:`member${i+1}@example.com`,plan:i<6?'p1':'p2',status:i===8?'cancelled':'active',issued:'2026-08-31',expires:i<6?'':'2027-08-31'})),
    reviews:[{id:'v1',name:'Avery E.',rating:5,text:'Thoughtful dishes and the warmest welcome. A memorable evening.',status:'pending',date:'2026-10-27'},{id:'v2',name:'Morgan R.',rating:5,text:'The tasting menu was exceptional from beginning to end.',status:'published',date:'2026-10-25'},{id:'v3',name:'Quinn R.',rating:4,text:'A beautiful dinner. We loved the seasonal courses.',status:'pending',date:'2026-10-24'}],
    events:[{id:'e1',name:'Northwood team dinner',contact:'Blair Hayes',email:'events@example.com',date:'2026-11-12',party:18,status:'Inquiry',note:'Vegetarian options for four guests.'},{id:'e2',name:'Autumn anniversary',contact:'Rowan Brooks',email:'celebrate@example.com',date:'2026-11-19',party:12,status:'Confirmed',note:'A family celebration.'}],
    content:{headline:'An intimate dining experience',intro:'Seasonal ingredients. Thoughtful cooking. A seat at our table.',reservationPolicy:'Reservations are required. Please provide dietary requirements when booking.',cancellationPolicy:'Please cancel at least 48 hours before your reservation.',lateCancelHours:48,noShowFee:35,suppressHolds:false},
    notifications:[{id:'n1',title:'A guest has dietary requirements',body:'Review the prep sheet before tonight’s service.',route:'prep-sheet',read:false},{id:'n2',title:'German autumn is scheduled',body:'Pre-release opens November 2 at 10:00 AM.',route:'menu-blocks',read:false}],
    logs:[{id:'l1',at:'2026-10-28T15:42:00',action:'Reservation added',detail:'Table for two · 7:00 PM',actor:'Demo host'},{id:'l2',at:'2026-10-28T15:30:00',action:'Prep note updated',detail:'Mediterranean 2026',actor:'Demo host'},{id:'l3',at:'2026-10-28T14:10:00',action:'Membership issued',detail:'Friends & Family',actor:'Demo host'}]
  };
}
