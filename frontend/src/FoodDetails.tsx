import { useEffect, useRef, useState } from 'react';
import { Button, Icon } from './Foundation';
import './details.css';
import { getDishImageUrl } from './api';
export type DetailDish={id:number|string;name:string;description:string;price:number;image:string;category:string;unavailable?:boolean};
export type CartLine={key:string;dish:DetailDish;quantity:number;unitPrice:number;portion:string;extras:string[];instructions:string};
type Choice={name:string;price:number;description?:string};
const format=(n:number)=>`ETB ${n.toLocaleString()}`;
function getOptions(d:DetailDish):{portions:Choice[];extras:Choice[];ingredients:string;allergens:string}{
 const name = d.name.toLowerCase();
 if(name.includes('kitfo') || name.includes('ክትፎ')){
  return {
   portions:[
    {name:'Regular (Leb-Leb)',price:0,description:'Warm with spiced butter & mitmita'},
    {name:'Raw (Tire)',price:0,description:'Traditional authentic raw preparation'},
    {name:'Fully Cooked (Yebesele)',price:0,description:'Gently pan-cooked with spiced butter'},
    {name:'Large Platter',price:220,description:'Double portion with Kocho & Ayib'}
   ],
   extras:[
    {name:'Extra Kocho (Enset bread)',price:80},
    {name:'Fresh Ayib (Cottage cheese)',price:70},
    {name:'Extra Niter Kibbeh (Spiced butter)',price:60},
    {name:'Extra Mitmita & Senafich',price:35}
   ],
   ingredients:'Finely minced lean beef, authentic Ethiopian niter kibbeh (clarified spiced butter), spicy mitmita chili, and cardamom. Served with fresh injera or kocho, ayib, and gomen.',
   allergens:'Contains dairy (spiced butter, cottage cheese). Injera may contain wheat.'
  };
 }
 if(name.includes('tibs') || name.includes('ጥብስ')){
  return {
   portions:[
    {name:'Regular Pan',price:0,description:'Sizzling pan serving for one'},
    {name:'Large Platter',price:240,description:'Generous sharing portion'}
   ],
   extras:[
    {name:'Extra Injera Roll',price:45},
    {name:'Spicy Awaze Sauce Dip',price:40},
    {name:'Senafich Mustard Dip',price:35},
    {name:'Fresh Rosemary & Sliced Chilies',price:30}
   ],
   ingredients:'Prime meat cuts pan-seared with red onions, garlic, fresh rosemary sprigs, green jalapeño peppers, and Ethiopian herbal butter. Served sizzling with fresh injera.',
   allergens:'Dairy present in spiced butter. Injera may contain teff and wheat.'
  };
 }
 if(name.includes('doro') || name.includes('ዶሮ')){
  return {
   portions:[
    {name:'Regular Portion',price:0,description:'Tender chicken cut with hard-boiled egg'},
    {name:'Double Piece Serving',price:240,description:'Two chicken cuts with two hard-boiled eggs'}
   ],
   extras:[
    {name:'Extra Hard-Boiled Egg',price:60},
    {name:'Extra Injera Roll',price:45},
    {name:'Fresh Ayib (Cottage Cheese)',price:70},
    {name:'Extra Rich Berbere Gravy',price:50}
   ],
   ingredients:'Slow-simmered chicken, caramelized red onions, rich berbere chili spice, garlic, ginger, niter kibbeh, and a hard-boiled egg. Served with soft teff injera.',
   allergens:'Contains poultry, egg, and dairy (clarified butter). Injera may contain wheat.'
  };
 }
 if(name.includes('tere siga') || name.includes('ጥሬ ሥጋ') || name.includes('gored') || name.includes('ጎረድ') || name.includes('dulet') || name.includes('ዱለት')){
  return {
   portions:[
    {name:'1/2 Kilogram (500g)',price:0,description:'Standard hotel dining cut'},
    {name:'1 Kilogram (1000g)',price:480,description:'Full table sharing portion'}
   ],
   extras:[
    {name:'Spicy Awaze & Senafich',price:45},
    {name:'Mitmita & Spiced Butter Dip',price:55},
    {name:'Fresh Warm Injera Roll',price:45}
   ],
   ingredients:'Prime butcher-carved beef or finely minced liver and tripe with mitmita, cardamom, and niter kibbeh. Served fresh with dipping sauces and injera.',
   allergens:'Raw meat preparation. Dairy present in spiced butter. Mitmita contains hot chili pepper.'
  };
 }
 if(name.includes('firfir') || name.includes('ፍርፍር') || name.includes('shiro') || name.includes('ሽሮ')){
  return {
   portions:[
    {name:'Traditional Clay Pot',price:0,description:'Bubbling hot serving'},
    {name:'Large Family Pot',price:180,description:'Hearty sharing serving'}
   ],
   extras:[
    {name:'Extra Spiced Butter (Kibbeh)',price:60},
    {name:'Extra Injera Roll',price:45},
    {name:'Extra Sautéed Beef Chunks',price:130},
    {name:'Fresh Green Jalapeños',price:25}
   ],
   ingredients:'Tender beef cuts, sun-dried dirkosh injera or slow-cooked chickpea flour, red onions, garlic, berbere, and herbal spiced butter.',
   allergens:'Legumes (chickpea), dairy (butter). Injera may contain teff and wheat.'
  };
 }
 if(name.includes('burger') || name.includes('በርገር')){
  return {
   portions:[
    {name:'Single Prime Patty',price:0,description:'Juicy 180g beef patty with brioche bun'},
    {name:'Double Patty Stacker',price:140,description:'Two 180g beef patties with double cheese'}
   ],
   extras:[
    {name:'Crispy Bacon Rashers',price:60},
    {name:'Melted Aged Cheddar',price:50},
    {name:'Hand-Cut Golden Fries',price:70},
    {name:'Garlic Herb Aioli Dip',price:35}
   ],
   ingredients:'Prime grass-fed beef patty, aged cheddar, crisp lettuce, farm-ripe tomato, caramelized balsamic red onions, and house special relish on a toasted brioche bun.',
   allergens:'Contains gluten (brioche bun), dairy (cheddar cheese), and eggs (sauce).'
  };
 }
 if(name.includes('pizza') || name.includes('ፒዛ')){
  return {
   portions:[
    {name:'Medium 12"',price:0,description:'Classic 6-slice stone-baked crust'},
    {name:'Large 16"',price:160,description:'Generous 8-slice sharing size'}
   ],
   extras:[
    {name:'Extra Stretchy Mozzarella',price:70},
    {name:'Spicy Minced Beef Sausage',price:80},
    {name:'Fresh Basil & Garlic Olive Oil',price:35},
    {name:'Black Olives & Sliced Jalapeños',price:40}
   ],
   ingredients:'Slow-fermented artisan sourdough, rich crushed San Marzano tomato sauce, whole-milk mozzarella cheese, and selected premium hotel toppings.',
   allergens:'Contains gluten (wheat flour) and dairy (mozzarella cheese).'
  };
 }
 if(name.includes('shakshuka') || name.includes('chechebsa') || name.includes('ጨጨብሳ') || name.includes('ቁርስ') || name.includes('breakfast')){
  return {
   portions:[
    {name:'Regular Skillet',price:0,description:'Hot morning skillet serving'},
    {name:'Generous Breakfast Set',price:90,description:'Includes extra bread & fresh tea'}
   ],
   extras:[
    {name:'Pure Organic Bale Forest Honey',price:40},
    {name:'Extra Spiced Clarified Butter',price:50},
    {name:'Fresh House Yogurt (Ergo)',price:45},
    {name:'Fresh Warm Flatbread',price:35}
   ],
   ingredients:'Fresh farm eggs poached in spiced tomato-chili reduction, or hand-torn crisp flatbread sautéed with fragrant niter kibbeh, berbere, and organic raw honey.',
   allergens:'Contains eggs, dairy (clarified butter, yogurt), and gluten (flatbread).'
  };
 }
 if(name.includes('spris') || name.includes('juice') || name.includes('ጭማቂ') || name.includes('coffee') || name.includes('ቡና')){
  return {
   portions:[
    {name:'Regular Glass',price:0,description:'Chilled tall glass serving'},
    {name:'Large Pot / Sharing Glass',price:60,description:'Extended morning or afternoon portion'}
   ],
   extras:[
    {name:'Fresh Lime Squeeze & Mint',price:20},
    {name:'Organic Honey Sweetener',price:30},
    {name:'Fresh Roasted Traditional Popcorn',price:30},
    {name:'Spiced Cardamom & Cloves Infusion',price:25}
   ],
   ingredients:'Layered tree-ripened Hass avocados, sunrise papayas, and tropical mangoes, or single-origin Bale highland roasted Arabica coffee brewed in a traditional jebena.',
   allergens:'100% natural, caffeine in coffee.'
  };
 }
 if(name.includes('cake') || name.includes('ኬክ') || name.includes('dessert') || name.includes('lava')){
  return {
   portions:[
    {name:'Single Warm Soufflé',price:0,description:'Warm individual molten cake'},
    {name:'Double Celebration Portion',price:120,description:'Two molten cakes with extra scoop'}
   ],
   extras:[
    {name:'Artisan Vanilla Bean Ice Cream',price:60},
    {name:'Fresh Forest Berry Coulis',price:40},
    {name:'Toasted Crushed Hazelnuts',price:40}
   ],
   ingredients:'70% rich Belgian dark chocolate, European cultured butter, farm eggs, cocoa, and molten center.',
   allergens:'Contains gluten, dairy, and eggs. May contain traces of tree nuts.'
  };
 }
 if(name.includes('beyaynetu') || name.includes('በያይነቱ')){
  return {
   portions:[
    {name:'Traditional Fasting Platter',price:0,description:'Array of 8 slow-simmered vegetable wats'},
    {name:'Grand Deluxe Fasting Platter',price:130,description:'Generous platter for sharing with extra salads'}
   ],
   extras:[
    {name:'Extra Injera Roll',price:45},
    {name:'Extra Shiro Bowl',price:55},
    {name:'Fresh Sliced Jalapeños & Tomatoes',price:30}
   ],
   ingredients:'Slow-cooked spicy red lentils (misir wat), yellow split pea stew (kik alicha), collard greens (gomen), green beans & carrots (fasolia), beetroot salad, and chickpea shiro served atop soft teff injera.',
   allergens:'100% plant-based / vegan. Injera may contain teff and wheat.'
  };
 }
 return {
  portions:[
   {name:'Regular Serving',price:0,description:'Standard hotel portion'},
   {name:'Large Serving',price:170,description:'Generous hotel portion'}
  ],
  extras:[
   {name:'Extra Injera Roll',price:45},
   {name:'Extra Niter Kibbeh',price:50},
   {name:'Spicy Awaze Dip',price:40}
  ],
  ingredients:d.description,
  allergens:'Prepared with traditional Ethiopian spices, onions, garlic, and clarified butter. Please speak to your server regarding dietary preferences.'
 };
}
export function QuantitySelector({value,onChange}:{value:number;onChange:(n:number)=>void}){return <div className="detail-quantity"><button aria-label="Decrease quantity" disabled={value===1} onClick={()=>onChange(Math.max(1,value-1))}>−</button><output aria-label="Quantity">{value}</output><button aria-label="Increase quantity" onClick={()=>onChange(value+1)}>+</button></div>}
export function FoodDetails({dish,onClose,onAdd,initial}:{initial?:CartLine;dish:DetailDish;onClose:()=>void;onAdd:(line:CartLine)=>void}){
 const options=getOptions(dish);const [portion,setPortion]=useState<string>(initial?.portion||'');const [extras,setExtras]=useState<string[]>(initial?.extras||[]);const [quantity,setQuantity]=useState(initial?.quantity||1);const [instructions,setInstructions]=useState(initial?.instructions||'');const [error,setError]=useState(false);const ref=useRef<HTMLDivElement>(null);const close=useRef<HTMLButtonElement>(null);const required=options.portions.length>0;
 const portionCost=options.portions.find(p=>p.name===portion)?.price||0;const extrasCost=options.extras.filter(e=>extras.includes(e.name)).reduce((a,e)=>a+e.price,0);const unitPrice=dish.price+portionCost+extrasCost;const total=unitPrice*quantity;
 useEffect(()=>{const previous=document.activeElement as HTMLElement;const overflow=document.body.style.overflow;document.body.style.overflow='hidden';close.current?.focus();const key=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();if(e.key==='Tab'){const nodes=ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),summary');const first=nodes?.[0],last=nodes?.[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}};document.addEventListener('keydown',key);return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',key);previous?.focus()}},[]);
 const submit=()=>{if(dish.unavailable)return;if(required&&!portion){setError(true);ref.current?.querySelector<HTMLElement>('.portion-options')?.scrollIntoView({block:'center',behavior:'smooth'});ref.current?.querySelector<HTMLInputElement>('input[name=portion]')?.focus();return}const key=JSON.stringify([dish.id,portion,[...extras].sort(),instructions.trim()]);onAdd({key,dish,quantity,unitPrice,portion,extras:[...extras],instructions:instructions.trim()});onClose()};
 return <div className="detail-backdrop" onClick={onClose}><div ref={ref} className="food-detail" role="dialog" aria-modal="true" aria-labelledby="food-detail-title" onClick={e=>e.stopPropagation()}><button ref={close} className="detail-close" aria-label="Close food details" onClick={onClose}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="m6 6 12 12M6 18 18 6"/></svg></button><aside className="detail-visual"><img src={getDishImageUrl(dish.image, 1000)} alt={dish.name}/><div className="detail-image-caption"><span>ZERFE LOUNGE</span><p>Made with time.<br/>Served with heart.</p><small>Refined hospitality · Bale Robe.</small></div></aside><div className="detail-right"><div className="detail-scroll"><span className="menu-eyebrow">ZERFE LOUNGE / {dish.category.toUpperCase()}</span><div className={`detail-availability ${dish.unavailable?'not-available':''}`}><i/>{dish.unavailable?'Temporarily unavailable':'Freshly prepared · Available'}</div><h2 id="food-detail-title">{dish.name}</h2><p className="detail-description">{dish.description}</p><div className="detail-base-price">{format(dish.price)} <span>base price · VAT included</span></div><details className="ingredients"><summary>Ingredients & dietary information <Icon name="plus" size={14}/></summary><p>{options.ingredients}</p><p>{options.allergens}</p></details>
 {dish.unavailable?<div className="detail-unavailable"><strong>A favourite worth waiting for.</strong><p>This dish is temporarily unavailable. Please explore our other dishes or ask your server for a recommendation.</p></div>:<>{required&&<fieldset className={`detail-options portion-options ${error?'option-error':''}`} aria-describedby={error?'portion-error':undefined}><legend>Choose your portion <span className="required-tag">Required · Choose 1</span></legend><div className="portion-grid">{options.portions.map(p=><label className={`portion-option ${portion===p.name?'option-selected':''}`} key={p.name}><input type="radio" name="portion" value={p.name} checked={portion===p.name} required aria-invalid={error} onChange={()=>{setPortion(p.name);setError(false)}}/><span><strong>{p.name}</strong>{p.description&&<small>{p.description}</small>}</span><b>{p.price?`+ ${format(p.price)}`:'Included'}</b></label>)}</div>{error&&<p id="portion-error" className="portion-error" role="alert">Please choose a portion before adding this dish.</p>}</fieldset>}
 {options.extras.length>0&&<fieldset className="detail-options addon-options"><legend>A little extra? <span className="optional-tag">Optional</span></legend><p className="option-helper">Make it just the way you like it.</p>{options.extras.map(e=><label className={`addon-option ${extras.includes(e.name)?'option-selected':''}`} key={e.name}><input type="checkbox" checked={extras.includes(e.name)} onChange={()=>setExtras(prev=>prev.includes(e.name)?prev.filter(n=>n!==e.name):[...prev,e.name])}/><span>{e.name}</span><strong>+ {format(e.price)}</strong></label>)}</fieldset>}
 <div className="detail-instructions"><label htmlFor="special-instructions">Special instructions <span className="optional-tag">Optional</span></label><p className="option-helper">We'll do our best to accommodate your request.</p><textarea id="special-instructions" value={instructions} maxLength={200} onChange={e=>setInstructions(e.target.value)} placeholder="Less spicy, sauce on the side…" aria-describedby="instructions-count"/><div id="instructions-count" className="instructions-count">{instructions.length} / 200 characters</div></div>
 <div className="detail-price-summary" aria-live="polite" aria-atomic="true"><div><span>Base price</span><span>{format(dish.price)}</span></div>{portion&&<div><span>{portion} portion</span><span>{portionCost?`+ ${format(portionCost)}`:'Included'}</span></div>}{extras.map(n=><div key={n}><span>{n}</span><span>+ {format(options.extras.find(e=>e.name===n)?.price||0)}</span></div>)}<div className="summary-unit"><span>Per item</span><strong>{format(unitPrice)}</strong></div>{quantity>1&&<div><span>Quantity</span><span>× {quantity}</span></div>}</div></>}
 <details className="detail-annotation"><summary>02B — Food Details & Customization</summary><p>Total = (base price + portion surcharge + selected add-ons) × quantity. Options are configured per dish. Matching dish, portion, add-ons and instructions merge; different configurations remain separate cart lines. Mobile uses a scrollable sheet with a safe-area-aware fixed action row; desktop uses a split modal. Prices and photography are illustrative.</p></details></div><div className="detail-action-bar">{!dish.unavailable&&<div className="detail-quantity-wrap"><span>Quantity</span><QuantitySelector value={quantity} onChange={setQuantity}/></div>}<Button disabled={dish.unavailable} onClick={submit}>{dish.unavailable?'Currently unavailable':<><span>{initial?'Save changes':'Add to Cart'}</span><span>{format(total)}</span><Icon name="arrow" size={17}/></>}</Button></div></div></div></div>
}
