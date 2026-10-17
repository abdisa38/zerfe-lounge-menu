import React, { useEffect, useRef, useState } from 'react';
import Foundation, { Button, Icon } from './Foundation';
import './menu.css';
import Checkout from './Checkout';
import OrderTracking, { type SessionOrder } from './OrderTracking';
import { FoodDetails, type CartLine } from './FoodDetails';
import AdminDashboard from './AdminDashboard';
import { api } from './api';
const photo=(id:string,w=700)=>`https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;
const defaultCategories=['All Items','Breakfast','Ethiopian Food','Main Courses','Burgers','Pizza','Drinks','Desserts'];
type Dish={id:number|string;name:string;description:string;price:number;category:string;image:string;tag?:string;custom?:boolean;unavailable?:boolean};
const defaultDishes:Dish[]=[
{id:1,name:'Doro Wat',description:'Slow-simmered chicken in a rich berbere sauce, with a boiled egg and soft injera.',price:680,category:'Ethiopian Food',image:'photo-1746716447103-e1618bbd0669',tag:'House favourite',custom:true},
{id:2,name:'Sizzling Beef Tibs',description:'Tender beef, rosemary, peppers and onions. Served sizzling, with fresh injera.',price:720,category:'Ethiopian Food',image:'photo-1544025162-d76694265947',custom:true,tag:'Popular'},
{id:3,name:'The Garden Beyaynetu',description:'A colourful spread of lentils, seasonal greens and spiced vegetables on injera.',price:460,category:'Ethiopian Food',image:'photo-1593252719532-53f183016149',tag:'Plant-based'},
{id:4,name:'Herb-Grilled Chicken',description:'Flame-grilled chicken, garden vegetables and our signature herb dressing.',price:650,category:'Main Courses',image:'photo-1670398564097-0762e1b30b3a'},
{id:5,name:'Abay Signature Burger',description:'Grilled beef, aged cheddar, caramelised onions and house sauce. Served with fries.',price:580,category:'Burgers',image:'photo-1568901346375-23c9450c58cd',custom:true},
{id:6,name:'Garden Margherita',description:'Stone-baked dough, tomato, fresh mozzarella and a scattering of basil.',price:620,category:'Pizza',image:'photo-1574071318508-1cdbab80d002',tag:'Vegetarian'},
{id:7,name:'Fresh Mango Juice',description:'Freshly blended ripe mango. Sunshine in a glass, with no added sugar.',price:180,category:'Drinks',image:'photo-1622597467836-f3285f2131b8'},
{id:8,name:'Chocolate Indulgence',description:'Warm chocolate cake with a soft centre and a scoop of vanilla ice cream.',price:320,category:'Desserts',image:'photo-1578985545062-69928b1d9587',unavailable:true},
{id:9,name:'Morning Shakshuka',description:'Free-range eggs nestled in slow-cooked tomatoes, with warm sourdough.',price:340,category:'Breakfast',image:'photo-1525351484163-7529414344d8'}];
function MenuIcon({name}:{name:'bag'|'info'|'close'|'leaf'|'pin'|'logout'|'user'}){return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{name==='bag'?<><path d="M5 7h14l1 14H4L5 7Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></>:name==='info'?<><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v.1"/></>:name==='close'?<path d="m6 6 12 12M6 18 18 6"/>:name==='leaf'?<><path d="M20 4C8 2 2 12 8 17s15-3 12-13Z"/><path d="m5 21 10-11"/></>:name==='logout'?<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></>:name==='user'?<><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>:<><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/></>}</svg>}
function FoodCard({dish,add,count}:{dish:Dish;add:(d:Dish)=>void;count:number}){return <article className={`menu-food-card ${dish.unavailable?'sold-out':''}`} tabIndex={0} role="button" aria-label={`View ${dish.name} details`} onClick={()=>add(dish)} onKeyDown={e=>{if(e.target!==e.currentTarget)return;if(e.key==='Enter'||e.key===' '){e.preventDefault();add(dish)}}}><div className="dish-photo"><img src={photo(dish.image)} alt={dish.name} loading="lazy"/>{dish.tag&&<span className={`dish-tag ${dish.tag.includes('based')||dish.tag==='Vegetarian'?'plant':''}`}>{dish.tag.includes('based')&&<MenuIcon name="leaf"/>}{dish.tag}</span>}{dish.unavailable&&<span className="sold-overlay">Temporarily unavailable</span>}</div><div className="dish-body"><div className="dish-title-row"><h3>{dish.name}</h3>{dish.custom&&<span className="custom-dot" title="Customizable">✧</span>}</div><p>{dish.description}</p><div className="dish-footer"><div className="dish-price"><span>ETB</span> {dish.price.toLocaleString()}<small>{dish.custom?'Make it your own':' '}</small></div><Button variant="secondary" disabled={dish.unavailable} onClick={e=>{e.stopPropagation();add(dish)}} aria-label={`Add ${dish.name} to order`}>{dish.unavailable?'Unavailable':<><Icon name={count?'check':'plus'} size={15}/>{count?`Added · ${count}`:'Add'}</>}</Button></div></div></article>}
const defaultSampleOrders: SessionOrder[] = [
  {
    reference: 'DEMO-AK-8F92B104',
    placedAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    status: 'Preparing',
    lines: [
      { key: 'sample-doro', dish: defaultDishes[0], portion: 'Regular', extras: ['Extra egg'], instructions: 'Less spicy, please.', unitPrice: 740, quantity: 1 },
      { key: 'sample-tibs', dish: defaultDishes[1], portion: 'Regular', extras: ['Extra injera'], instructions: '', unitPrice: 765, quantity: 1 }
    ]
  },
  {
    reference: 'DEMO-AK-3A10C921',
    placedAt: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
    status: 'Completed',
    feedback: true,
    lines: [
      { key: 'sample-drinks', dish: defaultDishes[6], portion: '', extras: [], instructions: 'With ice', unitPrice: 180, quantity: 2 }
    ]
  }
];
export default function App(){
  const [orders,setOrders]=useState<SessionOrder[]>(defaultSampleOrders);
  const [dishes,setDishes]=useState<Dish[]>(defaultDishes);
  const [categories,setCategories]=useState<string[]>(defaultCategories);
  const [tracking,setTracking]=useState<string|null>(location.hash==='#tracking'?defaultSampleOrders[0].reference:null);
  const [foundation,setFoundation]=useState(location.hash==='#foundation');
  const [admin,setAdmin]=useState(location.hash==='#admin'||location.hash==='#orders');
  const [category,setCategory]=useState('All Items');
  const [search,setSearch]=useState('');
  const [cart,setCart]=useState<CartLine[]>([]);
  const [panel,setPanel]=useState<'info'|'cart'|'profile'|null>(null);
  const [custom,setCustom]=useState<Dish|null>(null);
  const [toast,setToast]=useState('');
  const [loading,setLoading]=useState(true);
  const [customerName, setCustomerName] = useState(() => localStorage.getItem('gebeta_customer_name') || '');
  const [customerPhone, setCustomerPhone] = useState(() => localStorage.getItem('gebeta_customer_phone') || '');
  const [profileInputName, setProfileInputName] = useState(customerName);
  const [profileInputPhone, setProfileInputPhone] = useState(customerPhone);
  const searchRef=useRef<HTMLInputElement>(null);
  const closeRef=useRef<HTMLButtonElement>(null);

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [staffUser, setStaffUser] = useState<any>(() => {
    try {
      return JSON.parse(localStorage.getItem('gebeta_staff_user') || 'null');
    } catch {
      return null;
    }
  });
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleAuthLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const username = loginUsername.trim();
    const pin = loginPin.trim();

    if (!username) {
      setLoginError('Please enter your username or email');
      return;
    }
    if (!pin) {
      setLoginError('Please enter your password / PIN');
      return;
    }

    setLoginBusy(true);
    setLoginError('');

    try {
      const user = await api.loginStaff({ username, pin });
      setLoginModalOpen(false);

      const staffRoles = ['Owner', 'Admin', 'Manager', 'Kitchen', 'Waiter', 'Cashier'];
      if (staffRoles.includes(user.role)) {
        // Staff / Admin Role -> Redirect to Admin Dashboard
        localStorage.setItem('gebeta_staff_user', JSON.stringify(user));
        setStaffUser(user);
        setToast(`Welcome back, ${user.name} (${user.role})!`);
        setAdmin(true);
        location.hash = 'admin';
      } else {
        // Customer Role -> Redirect to Customer Dining Dashboard
        localStorage.setItem('gebeta_customer_name', user.name);
        if (user.phone) localStorage.setItem('gebeta_customer_phone', user.phone);
        setCustomerName(user.name);
        if (user.phone) setCustomerPhone(user.phone);
        setProfileInputName(user.name);
        if (user.phone) setProfileInputPhone(user.phone);
        setToast(`Welcome back, ${user.name}!`);
        setPanel('profile');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoginBusy(false);
    }
  };

  const handleStaffLogout = () => {
    localStorage.removeItem('gebeta_staff_user');
    setStaffUser(null);
    setAdmin(false);
    if (location.hash === '#admin' || location.hash === '#orders') {
      location.hash = '';
    }
    setToast('Logged out of staff account.');
  };

  const handleCustomerLogout = () => {
    localStorage.removeItem('gebeta_customer_name');
    localStorage.removeItem('gebeta_customer_phone');
    setCustomerName('');
    setCustomerPhone('');
    setProfileInputName('');
    setProfileInputPhone('');
    setLoginCustomerName('');
    setLoginCustomerPhone('');
    setPanel(null);
    setToast('Logged out of guest profile.');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = profileInputName.trim();
    if (!trimmed) {
      setToast('Please enter your name');
      return;
    }
    localStorage.setItem('gebeta_customer_name', trimmed);
    if (profileInputPhone.trim()) localStorage.setItem('gebeta_customer_phone', profileInputPhone.trim());
    setCustomerName(trimmed);
    setCustomerPhone(profileInputPhone.trim());
    setPanel(null);
    setToast(`Profile saved! Welcome, ${trimmed}`);
  };

  const handleClearProfile = () => {
    handleCustomerLogout();
  };

  // Fetch real data from MongoDB backend
  useEffect(() => {
    api.getCategories().then(cats => {
      if (cats && cats.length) {
        setCategories(['All Items', ...cats.filter(c => c.isActive !== false).map(c => c.name)]);
      }
    }).catch(() => {});

    api.getMenuItems().then(items => {
      if (items && items.length) {
        setDishes(items.map((it: any) => ({
          id: it._id || it.id,
          name: it.name,
          description: it.description,
          price: it.price,
          category: it.category,
          image: it.image,
          tag: it.tag,
          custom: it.isCustomizable,
          unavailable: it.isAvailable === false
        })));
      }
    }).catch(() => {});

    const mapOrder = (o: any) => ({
      reference: o.reference,
      placedAt: o.placedAt || new Date().toISOString(),
      status: o.status === 'New' ? 'Received' : o.status,
      customerName: o.customerName,
      paymentMethod: o.paymentMethod || 'Chapa',
      paymentStatus: o.paymentStatus || (o.paymentMethod === 'Cash' ? 'Pending' : 'Paid'),
      lines: (o.lines || []).map((l: any) => ({
        key: l.key || l.name,
        dish: {
          id: l.dishId || 1,
          name: l.name,
          description: '',
          price: l.unitPrice,
          category: 'Ethiopian Food',
          image: 'photo-1746716447103-e1618bbd0669'
        },
        portion: l.portion || 'Regular',
        extras: l.extras || [],
        instructions: l.instructions || '',
        unitPrice: l.unitPrice,
        quantity: l.quantity
      }))
    });

    api.getOrders().then(ords => {
      if (ords && ords.length) {
        setOrders(ords.map(mapOrder));
      }
    }).catch(() => {});
  }, []);

  useEffect(()=>{const t=setTimeout(()=>setLoading(false),600);return()=>clearTimeout(t)},[]);

  useEffect(()=>{
    const handleHash = async () => {
      const hash = location.hash || '';
      const search = location.search || '';

      // Check URL search or hash parameters for Chapa redirect
      const urlParams = new URLSearchParams(search);
      const hashQuery = hash.includes('?') ? hash.substring(hash.indexOf('?')) : '';
      const hashParams = new URLSearchParams(hashQuery);

      const txRef = urlParams.get('tx_ref') || urlParams.get('trx_ref') || hashParams.get('tx_ref');
      const orderRef = urlParams.get('ref') || hashParams.get('ref');

      if (txRef) {
        try {
          await api.verifyChapaPayment(txRef);
          const fresh = await api.getOrders();
          if (fresh && fresh.length) {
            setOrders(fresh.map((o: any) => ({
              reference: o.reference,
              placedAt: o.placedAt || new Date().toISOString(),
              status: o.status === 'New' ? 'Received' : o.status,
              customerName: o.customerName,
              paymentMethod: o.paymentMethod || 'Chapa',
              paymentStatus: o.paymentStatus || 'Paid',
              lines: (o.lines || []).map((l: any) => ({
                key: l.key || l.name,
                dish: {
                  id: l.dishId || 1,
                  name: l.name,
                  description: '',
                  price: l.unitPrice,
                  category: 'Ethiopian Food',
                  image: 'photo-1746716447103-e1618bbd0669'
                },
                portion: l.portion || 'Regular',
                extras: l.extras || [],
                instructions: l.instructions || '',
                unitPrice: l.unitPrice,
                quantity: l.quantity
              }))
            })));
          }
        } catch (e) {
          console.warn('Chapa verification notice:', e);
        }
      }

      if (hash === '#foundation') {
        setFoundation(true);
        setTracking(null);
        setPanel(null);
        setAdmin(false);
      } else if (hash.startsWith('#tracking')) {
        setFoundation(false);
        const targetRef = orderRef || orders[0]?.reference || defaultSampleOrders[0].reference;
        setTracking(targetRef);
        setPanel(null);
        setAdmin(false);
      } else if (hash === '#admin' || hash === '#orders') {
        setFoundation(false);
        setTracking(null);
        setPanel(null);
        setAdmin(true);
      } else {
        setFoundation(false);
        setTracking(null);
        setAdmin(false);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [orders.length]);
  useEffect(()=>{if(!panel)return;const prev=document.activeElement as HTMLElement;closeRef.current?.focus();const listener=(e:KeyboardEvent)=>{if(e.key==='Escape'){setPanel(null);setCustom(null)}if(e.key==='Tab'){const els=Array.from(document.querySelectorAll<HTMLElement>('.menu-modal button:not(:disabled),.menu-modal input'));const first=els[0],last=els[els.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}};document.addEventListener('keydown',listener);return()=>{document.removeEventListener('keydown',listener);prev?.focus()}},[panel,custom]);
  useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),2800);return()=>clearTimeout(t)},[toast]);
  const count=cart.reduce((a,l)=>a+l.quantity,0),total=cart.reduce((a,l)=>a+l.unitPrice*l.quantity,0);
  const addConfigured=(line:CartLine)=>{setCart(c=>{const exists=c.some(l=>l.key===line.key);return exists?c.map(l=>l.key===line.key?{...l,quantity:l.quantity+line.quantity}:l):[...c,line]});setToast(`${line.quantity} × ${line.dish.name} added · ETB ${(total+line.unitPrice*line.quantity).toLocaleString()} subtotal`)};
  const filtered=dishes.filter(d=>(category==='All Items'||d.category===category)&&`${d.name} ${d.description}`.toLowerCase().includes(search.toLowerCase()));
  if(foundation)return <><button className="return-menu" onClick={()=>{setFoundation(false);location.hash=''}}>← Back to Abay Kitchen</button><Foundation/></>;
  if(admin)return <AdminDashboard sharedOrders={orders} onUpdateOrders={setOrders} onNavigateToCustomer={()=>{setAdmin(false);location.hash=''}} onLogout={handleStaffLogout}/>;
  if(tracking&&orders.some(o=>o.reference===tracking))return <OrderTracking order={orders.find(o=>o.reference===tracking)!} orders={orders} onBack={()=>{setTracking(null);setPanel(null);if(location.hash==='#tracking')location.hash=''}} onSelect={setTracking} onUpdate={order=>setOrders(c=>c.map(o=>o.reference===order.reference?order:o))}/>;
  if(panel==='cart')return <Checkout onRecord={order=>setOrders(c=>[order,...c])} onTrack={ref=>{setTracking(ref);location.hash='tracking'}} cart={cart} setCart={setCart} onBack={()=>setPanel(null)} onProfileSaved={(n, p) => { setCustomerName(n); setCustomerPhone(p); setProfileInputName(n); setProfileInputPhone(p); }} samples={[{key:'sample-doro',dish:dishes[0],portion:'Regular',extras:['Extra egg'],instructions:'Less spicy, please.',unitPrice:740,quantity:1},{key:'sample-tibs',dish:dishes[1],portion:'Regular',extras:[],instructions:'',unitPrice:720,quantity:1}]}/>;
return <div className="customer-menu"><header className="restaurant-header"><div className="header-inner"><a className="restaurant-logo" href="#" aria-label="Abay Kitchen home"><span className="abay-symbol">a<span>k</span></span><span>ABAY KITCHEN<small>ROOTED IN TRADITION. MADE WITH LOVE.</small></span></a><div className="header-actions">{staffUser ? (<div className="navbar-auth-cluster"><button className="navbar-login-btn logged-in" onClick={()=>{setAdmin(true);location.hash='admin'}} title={`Signed in as ${staffUser.name} (${staffUser.role}) · Go to Dashboard`}><Icon name="check" size={14}/><span className="nav-btn-text">Dashboard ({staffUser.role})</span></button><button className="navbar-logout-btn" onClick={handleStaffLogout} title="Log out of Staff account" aria-label="Logout Staff"><MenuIcon name="logout"/><span className="nav-logout-text">Logout</span></button></div>) : customerName ? (<div className="navbar-auth-cluster"><button className="customer-profile-pill" onClick={() => { setProfileInputName(customerName); setProfileInputPhone(customerPhone); setPanel('profile'); }} title={`Logged in as ${customerName} · Click to view profile & active orders`} aria-label="Customer Profile"><span className="profile-chip-avatar">{customerName.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}</span><span className="profile-chip-name">{customerName.split(' ')[0]}</span></button><button className="navbar-logout-btn" onClick={handleCustomerLogout} title="Log out of customer account" aria-label="Logout Customer"><MenuIcon name="logout"/><span className="nav-logout-text">Logout</span></button></div>) : (<button className="navbar-login-btn" onClick={()=>{setLoginUsername('');setLoginPin('');setLoginError('');setLoginModalOpen(true)}} title="Login to your account"><Icon name="user" size={14}/><span>Login</span></button>)}{orders.length>0&&<button className="session-history-action" onClick={()=>{setTracking(orders[0].reference);location.hash='tracking'}} title="View active orders history"><Icon name="clock" size={16}/><span>Your orders</span><b>{orders.length}</b></button>}<button className="icon-action search-action" aria-label="Search menu" onClick={()=>searchRef.current?.focus()}><Icon name="search"/></button><button className="icon-action info-action" onClick={()=>setPanel('info')} aria-label="Restaurant information"><MenuIcon name="info"/><span>Restaurant info</span></button><button className="cart-action" onClick={()=>setPanel('cart')} aria-label={`View order, ${count} items`}><MenuIcon name="bag"/><span>Your order</span><b>{count}</b></button></div></div></header>
<div className="restaurant-cover"><img src={photo('photo-1593252719532-53f183016149',2000)} alt="Authentic Ethiopian dining with traditional injera and stews at Abay Kitchen"/><div className="cover-shade"/><div className="cover-content"><span className="cover-eyebrow">A TASTE OF HOME. A LITTLE DISCOVERY.</span><h1>Good food.<br/>Great company.</h1><p>Ethiopian soul. A world of flavour.<br className="mobile-break"/> Made fresh, shared generously.</p><span className="cover-location"><MenuIcon name="pin"/> Bole, Addis Ababa <i/> <span className="open-dot"/> Open until 10:00 PM</span></div><span className="cover-note">PULL UP A CHAIR. STAY A LITTLE LONGER.</span></div>
<div className="menu-content"><div className="restaurant-welcome"><div><span className="menu-eyebrow">WELCOME TO OUR TABLE</span><h2>What sounds good today?</h2><p>Old favourites, new discoveries. Always made with care.</p></div><div className="table-welcome"><span className="table-welcome-icon"><Icon name="utensils" size={20}/></span><div>Welcome to <strong>Abay Kitchen</strong><small>Scan, order & enjoy authentic Ethiopian dining.</small></div></div></div>
<div className="menu-tools"><div className="menu-search"><Icon name="search" size={19}/><input ref={searchRef} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Find your next favourite…" aria-label="Search dishes"/>{search&&<button onClick={()=>setSearch('')} aria-label="Clear search"><MenuIcon name="close"/></button>}</div><span className="menu-diet-note"><MenuIcon name="leaf"/> A little something for everyone</span></div><nav className="category-nav" aria-label="Food categories">{categories.map(c=><button key={c} aria-pressed={category===c} className={category===c?'category-selected':''} onClick={()=>setCategory(c)}>{c}</button>)}</nav>
<div className="menu-section-header"><div><span className="menu-eyebrow">{search?'MADE FOR YOUR CRAVING':category==='All Items'?'THE ONES YOU COME BACK FOR':'FRESH FROM OUR KITCHEN'}</span><h2>{search?`Results for “${search}”`:category==='All Items'?'Find your favourite':category} <span>{filtered.length} dishes</span></h2></div><span className="price-note">All prices in ETB · Inclusive of VAT</span></div>
{loading?<div className="food-grid" aria-label="Loading menu" aria-busy="true">{[1,2,3].map(n=><div className="menu-skeleton" key={n}><div/><span/><span/><span/></div>)}</div>:filtered.length?<div className="food-grid">{filtered.map(d=><FoodCard dish={d} key={d.id} count={cart.filter(l=>l.dish.id===d.id).reduce((n,l)=>n+l.quantity,0)} add={d=>setCustom(d)}/>)}</div>:<div className="empty-search"><Icon name="search" size={34}/><h3>No dishes found</h3><p>Try a different name or explore another category.</p><Button variant="secondary" onClick={()=>{setSearch('');setCategory('All Items')}}>Explore all dishes</Button></div>}
<div className="hospitality-note"><MenuIcon name="leaf"/><div><strong>A little care goes into every plate.</strong><p>Have an allergy or dietary preference? Please let your server know before ordering.</p></div><span>Made fresh. Served with heart.</span></div><footer className="menu-footer"><a className="footer-restaurant" href="#">ABAY KITCHEN<span>Good food brings us together.</span></a><div><span>Thoughtfully served with</span><button onClick={()=>{setFoundation(true);location.hash='foundation'}} className="powered-brand">gebeta<span>QR</span></button></div><span className="footer-right">You're in good company.</span></footer><details className="design-annotation"><summary>02 — Customer Digital Menu · Design notes & Prototypes</summary><p>Mobile: one column, swipeable categories, compact header. Tablet: two columns. Desktop: three columns within a 1200px content area. Search and categories combine; unavailable items cannot be added. Cards support keyboard focus. Prototype cart is session-only; prices and photography are illustrative, not verified dish representations.</p><div style={{display:'flex',gap:'10px',marginTop:'14px',flexWrap:'wrap'}}><button className="button secondary" style={{minHeight:'36px',fontSize:'10px'}} onClick={()=>{setFoundation(true);location.hash='foundation'}}>View 01 — Design System Foundation</button><button className="button secondary" style={{minHeight:'36px',fontSize:'10px'}} onClick={()=>{setTracking(orders[0].reference);location.hash='tracking'}}>View 02D — Order Tracking & Customer Feedback</button><button className="button secondary" style={{minHeight:'36px',fontSize:'10px'}} onClick={()=>{setAdmin(true);location.hash='admin'}}>View 03A — Restaurant Admin Dashboard & Orders</button></div></details></div>
{count>0&&<button className="mobile-cart-bar" onClick={()=>setPanel('cart')}><span><MenuIcon name="bag"/> {count} {count===1?'item':'items'}</span><strong>View your order</strong><span>ETB {total.toLocaleString()}</span></button>}{toast&&<div className="menu-toast" role="status"><Icon name="check"/>{toast}</div>}
{custom&&<FoodDetails dish={custom} onClose={()=>setCustom(null)} onAdd={addConfigured}/>}
{panel&&<div className="menu-modal-backdrop" onClick={()=>{setPanel(null);setCustom(null)}}><div className="menu-modal" role="dialog" aria-modal="true" aria-labelledby="menu-dialog-title" onClick={e=>e.stopPropagation()}><button className="modal-close icon-action" ref={closeRef} aria-label="Close dialog" onClick={()=>{setPanel(null);setCustom(null)}}><MenuIcon name="close"/></button>{panel==='profile'?(<div className="customer-profile-dialog"><div className="profile-dialog-header"><div className="profile-dialog-avatar">{customerName?customerName.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase():<Icon name="user" size={26}/>}</div><div><span className="menu-eyebrow">YOUR DINING PROFILE</span><h2 id="menu-dialog-title" style={{margin:'4px 0 0',fontSize:'22px'}}>{customerName||'Welcome, Valued Guest!'}</h2><p className="profile-status-desc">{customerName?'Your name is saved for quick ordering and personalized table service.':'Enter your name once so the kitchen and staff know who to prepare dishes for.'}</p></div></div><form onSubmit={handleSaveProfile} className="profile-dialog-form"><div className="profile-field-group"><label htmlFor="modal-customer-name">Your Full Name <span style={{color:'#b83b3b'}}>*</span></label><input id="modal-customer-name" type="text" value={profileInputName} onChange={e=>setProfileInputName(e.target.value)} placeholder="e.g. Abdisa Awel" maxLength={60} required autoFocus/></div><div className="profile-field-group"><label htmlFor="modal-customer-phone">Phone Number <small style={{color:'var(--muted)',fontWeight:400}}>(for Telebirr / CBE payment)</small></label><input id="modal-customer-phone" type="tel" value={profileInputPhone} onChange={e=>setProfileInputPhone(e.target.value)} placeholder="e.g. 0911 234 567" maxLength={20}/></div><div className="profile-table-badge"><Icon name="check" size={16}/><div><strong>Dine-in Guest · Abay Kitchen</strong><small>Bole Medhanialem, Addis Ababa</small></div></div><div className="profile-dialog-buttons"><Button type="submit"><Icon name="check" size={15}/> Save Details</Button>{customerName&&<button type="button" className="profile-logout-btn" onClick={handleCustomerLogout}>Log Out Guest</button>}</div></form>{orders.length>0&&<div className="profile-orders-section"><span className="menu-eyebrow">ACTIVE SESSION ORDERS ({orders.length})</span><button className="profile-active-order-chip" onClick={()=>{setPanel(null);setTracking(orders[0].reference);location.hash='tracking'}}><div><strong>Latest: {orders[0].reference}</strong><small style={{display:'block',color:'#667269',fontSize:'11px',marginTop:'2px'}}>Status: <span className="status-highlight">{orders[0].status}</span> · {orders[0].lines.length} items</small></div><Icon name="arrow" size={15}/></button></div>}</div>):panel==='info'?<><span className="menu-eyebrow">A WARM WELCOME</span><h2 id="menu-dialog-title">Abay Kitchen</h2><p>A neighbourhood kitchen celebrating Ethiopian hospitality, seasonal ingredients and the joy of sharing a meal.</p><div className="restaurant-info-line"><MenuIcon name="pin"/> Bole, Addis Ababa, Ethiopia</div><div className="restaurant-info-line"><Icon name="clock"/> Daily · 8:00 AM – 10:00 PM</div><div className="restaurant-info-line"><Icon name="check"/> Dine-in & Takeaway Available</div><p className="prototype-note">Authentic Ethiopian Cuisine · Addis Ababa, Ethiopia.</p></>:<><span className="menu-eyebrow">YOUR ORDER</span><h2 id="menu-dialog-title">Your order <span className="cart-dialog-count">({count})</span></h2>{count?<><div className="cart-lines">{cart.map(line=><div className="cart-line" key={line.key}><img src={photo(line.dish.image,150)} alt=""/><div><strong>{line.dish.name}</strong><small>{[line.portion,...line.extras].filter(Boolean).join(' · ')}</small>{line.instructions&&<small className="cart-instructions">“{line.instructions}”</small>}<small>ETB {line.unitPrice.toLocaleString()} each · ETB {(line.unitPrice*line.quantity).toLocaleString()}</small></div><div className="quantity"><button aria-label={`Remove one ${line.dish.name}`} onClick={()=>setCart(c=>c.map(l=>l.key===line.key?{...l,quantity:l.quantity-1}:l).filter(l=>l.quantity>0))}>−</button><span>{line.quantity}</span><button aria-label={`Add one ${line.dish.name}`} onClick={()=>setCart(c=>c.map(l=>l.key===line.key?{...l,quantity:l.quantity+1}:l))}>+</button></div></div>)}</div><div className="cart-total"><span>Total · VAT included</span><strong>ETB {total.toLocaleString()}</strong></div><p className="prototype-note">This is a menu preview. To place your order, please speak with your server.</p><Button onClick={()=>setPanel(null)}>Continue exploring <Icon name="arrow" size={16}/></Button></>:<div className="empty-cart"><MenuIcon name="bag"/><h3>Something delicious awaits.</h3><p>Add a dish from the menu to start your order.</p><Button onClick={()=>setPanel(null)}>Explore the menu</Button></div>}</>}</div></div>}
{loginModalOpen && (
  <div className="menu-modal-backdrop" onClick={() => setLoginModalOpen(false)}>
    <div className="menu-modal" role="dialog" aria-modal="true" aria-labelledby="login-dialog-title" onClick={e => e.stopPropagation()}>
      <button className="modal-close icon-action" aria-label="Close dialog" onClick={() => setLoginModalOpen(false)}>
        <MenuIcon name="close"/>
      </button>

      <div className="staff-login-dialog">
        <div className="staff-login-header">
          <div className="staff-login-avatar">
            <Icon name="user" size={24}/>
          </div>
          <div>
            <span className="menu-eyebrow">ACCOUNT ACCESS</span>
            <h2 id="login-dialog-title" style={{ margin: '4px 0 0', fontSize: '22px' }}>Login</h2>
            <p className="profile-status-desc">Enter your credentials to access your dashboard.</p>
          </div>
        </div>

        {loginError && <div className="login-error-msg">⚠ {loginError}</div>}

        <form onSubmit={handleAuthLogin} className="staff-login-form">
          <div className="profile-field-group">
            <label htmlFor="login-username">Username or Email <span style={{ color: '#b83b3b' }}>*</span></label>
            <input
              id="login-username"
              type="text"
              value={loginUsername}
              onChange={e => setLoginUsername(e.target.value)}
              placeholder="Enter username or email"
              required
              autoFocus
              disabled={loginBusy}
            />
          </div>

          <div className="profile-field-group">
            <label htmlFor="login-pin">Password / PIN <span style={{ color: '#b83b3b' }}>*</span></label>
            <input
              id="login-pin"
              type="password"
              value={loginPin}
              onChange={e => setLoginPin(e.target.value)}
              placeholder="Enter password or PIN"
              required
              disabled={loginBusy}
            />
          </div>

          <div className="profile-dialog-buttons" style={{ marginTop: '8px' }}>
            <Button type="submit" disabled={loginBusy}>
              {loginBusy ? 'Signing in…' : <><Icon name="arrow" size={15}/> Login</>}
            </Button>
            <Button variant="secondary" type="button" onClick={() => setLoginModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}
</div>}
