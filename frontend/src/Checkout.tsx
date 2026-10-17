import { useEffect, useRef, useState } from 'react';
import { Button, Icon } from './Foundation';
import { FoodDetails, QuantitySelector, type CartLine } from './FoodDetails';
import './checkout.css';
import type { SessionOrder } from './OrderTracking';
import { api } from './api';

const money = (n: number) => `ETB ${n.toLocaleString()}`;

type Props = {
  cart: CartLine[];
  setCart: (value: CartLine[] | ((c: CartLine[]) => CartLine[])) => void;
  onBack: () => void;
  samples: CartLine[];
  onRecord: (order: SessionOrder) => void;
  onTrack: (ref: string) => void;
  onProfileSaved?: (name: string, phone: string) => void;
};

const statuses = ['Received', 'Accepted', 'Preparing', 'Ready', 'Completed'];

export default function Checkout({ cart, setCart, onBack, samples, onRecord, onTrack, onProfileSaved }: Props) {
  const [step, setStep] = useState<'cart' | 'review' | 'confirmation' | 'tracking'>('cart');
  const [editing, setEditing] = useState<CartLine | null>(null);
  const [name, setName] = useState(() => localStorage.getItem('gebeta_customer_name') || '');
  const [phone, setPhone] = useState(() => localStorage.getItem('gebeta_customer_phone') || '');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Telebirr' | 'CBE Birr' | 'Chapa' | 'Cash'>('Telebirr');
  const [busy, setBusy] = useState(false);
  const [nameError, setNameError] = useState('');
  const [snapshot, setSnapshot] = useState<CartLine[]>([]);
  const [reference, setReference] = useState('');
  const [status, setStatus] = useState('Received');
  const [chapaActive, setChapaActive] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus();
    window.scrollTo(0, 0);
  }, [step]);

  const submitted = step === 'confirmation' || step === 'tracking';
  const lines = submitted ? snapshot : cart;
  const total = lines.reduce((a, l) => a + l.unitPrice * l.quantity, 0);
  const count = lines.reduce((a, l) => a + l.quantity, 0);

  const submit = async () => {
    if (!name.trim()) {
      setNameError('Please enter your name so the kitchen knows who this order is for.');
      setStep('review');
      return;
    }
    if (!cart.length) return;

    setNameError('');
    setBusy(true);

    try {
      localStorage.setItem('gebeta_customer_name', name.trim());
      if (phone.trim()) localStorage.setItem('gebeta_customer_phone', phone.trim());
      if (onProfileSaved) onProfileSaved(name.trim(), phone.trim());
    } catch (e) {}

    try {
      const txRef = `GQ-AK-TX-${Date.now()}`;
      // Connect to backend MongoDB
      const savedOrder = await api.checkoutOrder({
        customerName: name.trim(),
        customerPhone: phone.trim(),
        table: 'Dine-in',
        lines: cart.map(l => ({
          key: l.key,
          dishId: String(l.dish.id),
          name: l.dish.name,
          portion: l.portion,
          extras: [...l.extras],
          instructions: l.instructions,
          unitPrice: l.unitPrice,
          quantity: l.quantity,
          dish: l.dish
        })),
        orderNotes: notes,
        paymentMethod,
        chapaTxRef: txRef
      });

      const newRef = savedOrder.reference;
      setReference(newRef);
      setSnapshot(cart.map(l => ({ ...l, extras: [...l.extras] })));
      setStatus('Received');

      onRecord({
        reference: newRef,
        placedAt: new Date().toISOString(),
        lines: cart.map(l => ({ ...l, extras: [...l.extras] })),
        status: 'Received',
        customerName: name.trim()
      } as any);

      // If user selected Chapa, redirect directly to real Chapa checkout page
      if (paymentMethod === 'Chapa') {
        try {
          const returnUrl = `${window.location.origin}${window.location.pathname}#tracking?ref=${newRef}&payment=success&tx_ref=${txRef}`;
          const chapaRes = await api.initializeChapaPayment({
            amount: total,
            customerName: name.trim(),
            customerPhone: phone.trim(),
            orderReference: newRef,
            txRef,
            returnUrl
          });

          if (chapaRes && chapaRes.checkout_url) {
            setCart([]);
            // Direct real redirect to Chapa hosted payment portal
            window.location.href = chapaRes.checkout_url;
            return;
          }
        } catch (chapaErr: any) {
          console.error('Chapa direct initialization error:', chapaErr);
          setNameError(`Chapa Error: ${chapaErr.message || 'Unable to open Chapa payment gateway'}. Please try again or pay with Cash.`);
          setBusy(false);
          return;
        }
      }

      setCart([]);
      setStep('confirmation');
    } catch (err: any) {
      console.error('Backend order submission error:', err);
      setNameError(err.message || 'Unable to send order to kitchen. Please retry.');
      setBusy(false);
    } finally {
      setBusy(false);
    }
  };

  const update = (key: string, q: number) => {
    setCart(c => c.map(l => (l.key === key ? { ...l, quantity: q } : l)));
  };

  const remove = (key: string) => {
    setCart(c => c.filter(l => l.key !== key));
  };

  const saveEdit = (line: CartLine) => {
    setCart(c => {
      const rest = c.filter(l => l.key !== editing?.key);
      const match = rest.find(l => l.key === line.key);
      return match
        ? rest.map(l => (l.key === line.key ? { ...l, quantity: l.quantity + line.quantity } : l))
        : [...rest, line];
    });
    setEditing(null);
  };

  return (
    <div className="customer-menu checkout-page">
      <header className="checkout-header">
        <a href="#" onClick={e => { e.preventDefault(); if (!busy) onBack(); }} className="checkout-brand">
          ABAY KITCHEN<small>AUTHENTIC ETHIOPIAN DINING</small>
        </a>
        <span><Icon name="check" size={15} /> Dine-in</span>
        <span className="checkout-preview" style={{ background: '#e8f5e9', color: '#143d2b', border: '1px solid #c9e4c3' }}>
          ✓ LIVE QR ORDERING
        </span>
      </header>

      <div className="checkout-container">
        <button className="back-to-menu" disabled={busy} onClick={onBack}>
          ← Back to menu
        </button>

        <div className="checkout-title">
          <span className="menu-eyebrow">
            {submitted ? 'ORDER CONFIRMED & RECEIVED' : 'AUTHENTIC ETHIOPIAN DINING'}
          </span>
          <h1 ref={heading} tabIndex={-1}>
            {step === 'cart'
              ? 'Review your selection'
              : step === 'review'
              ? 'Complete your order'
              : step === 'confirmation'
              ? 'Your order is sent to the kitchen!'
              : 'From our kitchen to your table'}
          </h1>
          <p>
            {step === 'cart'
              ? 'Review your items before adding your name and payment method.'
              : step === 'review'
              ? 'Enter your name and select your payment method (Telebirr, CBE Birr, or Chapa).'
              : step === 'confirmation'
              ? `Thank you, ${name || 'valued guest'}! The kitchen has received your order.`
              : 'Track your order status directly from your seat.'}
          </p>
        </div>

        {!submitted && (
          <div className="checkout-steps">
            <span className={step === 'cart' ? 'current' : 'done'}>
              <b>{step === 'cart' ? '1' : '✓'}</b> Your cart
            </span>
            <i />
            <span className={step === 'review' ? 'current' : ''}>
              <b>2</b> Name & Payment
            </span>
            <i />
            <span>
              <b>3</b> Confirmation
            </span>
          </div>
        )}

        {!lines.length && !submitted ? (
          <div className="checkout-empty">
            <div className="empty-plate">
              <Icon name="book" size={36} />
            </div>
            <span className="menu-eyebrow">YOUR TABLE IS WAITING</span>
            <h2>Your cart is empty.</h2>
            <p>Discover something delicious and make yourself at home.</p>
            <Button onClick={onBack}>
              Browse menu <Icon name="arrow" size={16} />
            </Button>
            <button className="sample-link" onClick={() => setCart(samples)}>
              Preview sample cart · 2 dishes
            </button>
          </div>
        ) : (
          <div className="checkout-grid">
            <div className="checkout-main">
              {submitted && (
                <section className="checkout-panel confirmation-panel">
                  <span className={`confirmation-symbol ${status === 'Cancelled' ? 'cancel-symbol' : ''}`}>
                    <Icon name={status === 'Cancelled' ? 'info' : 'check'} size={28} />
                  </span>
                  <span className="menu-eyebrow">ABAY KITCHEN · DINE-IN</span>
                  <h2>Order Received Successfully!</h2>
                  <p>
                    The chef has been notified and is preparing your meal. No need to call a server.
                  </p>
                  <div className="order-reference">
                    <span>ORDER REFERENCE CODE</span>
                    <strong>{reference}</strong>
                  </div>
                  <div className="confirmation-meta" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <span><Icon name="check" size={15} /> Dine-in</span>
                    <span className="badge success">{paymentMethod} · Paid</span>
                    <span>Guest: <strong>{name}</strong></span>
                  </div>
                  {step === 'confirmation' ? (
                    <Button onClick={() => onTrack(reference)}>
                      Track Order Live <Icon name="arrow" size={16} />
                    </Button>
                  ) : (
                    <ol className="order-timeline">
                      {statuses.map((s, i) => {
                        const index = statuses.indexOf(status);
                        return (
                          <li key={s} className={i === index ? 'timeline-current' : i < index ? 'timeline-done' : ''}>
                            <span>{i < index ? <Icon name="check" size={14} /> : i + 1}</span>
                            <div>
                              <strong>{s}</strong>
                              <p>{i === index ? 'Current stage' : i < index ? 'Completed' : 'Upcoming'}</p>
                            </div>
                            {i === index && <b>Current</b>}
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </section>
              )}

              {/* Items in Cart / Review */}
              <section className="checkout-panel">
                <div className="checkout-panel-heading">
                  <h2>{submitted ? 'Ordered Items' : step === 'cart' ? 'Your Cart' : 'Order Items'}</h2>
                  <span>{count} {count === 1 ? 'item' : 'items'}</span>
                  {step === 'review' && <button onClick={() => setStep('cart')}>Edit cart</button>}
                </div>

                {lines.map(line => (
                  <article className="checkout-item" key={line.key}>
                    <img
                      src={`https://images.unsplash.com/${line.dish.image}?auto=format&fit=crop&w=180&q=80`}
                      alt={line.dish.name}
                    />
                    <div className="checkout-item-info">
                      <h3>{line.dish.name}</h3>
                      <p>{[line.portion, ...line.extras].filter(Boolean).join(' · ') || 'Standard serving'}</p>
                      {line.instructions && <p className="item-instruction">Note: “{line.instructions}”</p>}
                      <span>
                        {money(line.unitPrice)} each{submitted || step === 'review' ? ` × ${line.quantity}` : ''}
                      </span>
                      {step === 'cart' && (
                        <div className="item-actions">
                          <button onClick={() => setEditing(line)}>Edit</button>
                          <i />
                          <button onClick={() => remove(line.key)}>Remove</button>
                        </div>
                      )}
                    </div>
                    <div className="checkout-item-end">
                      <strong>{money(line.unitPrice * line.quantity)}</strong>
                      {step === 'cart' && (
                        <QuantitySelector value={line.quantity} onChange={q => update(line.key, q)} />
                      )}
                    </div>
                  </article>
                ))}
              </section>

              {/* Step 2 Customer Information Form */}
              {!submitted && step === 'review' && (
                <section className="checkout-panel customer-information" style={{ border: nameError ? '2px solid #b83b3b' : undefined }}>
                  <div className="checkout-panel-heading">
                    <h2>Who is this order for?</h2>
                    <span style={{ color: '#23734b', fontWeight: 600 }}>Required</span>
                  </div>
                  <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--muted)' }}>
                    No account or password needed! Just enter your name so our staff knows which guest to serve.
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label htmlFor="customer-name" style={{ fontWeight: 600 }}>
                      Your Full Name <span style={{ color: '#b83b3b' }}>*</span>
                    </label>
                    {name && (
                      <span style={{ fontSize: '11px', color: '#23734b', background: '#eef6ee', border: '1px solid #cce5ce', padding: '2px 7px', borderRadius: '4px', fontWeight: 600 }}>
                        ✓ Saved to your profile
                      </span>
                    )}
                  </div>
                  <input
                    id="customer-name"
                    type="text"
                    autoComplete="name"
                    maxLength={80}
                    value={name}
                    onChange={e => {
                      setName(e.target.value);
                      if (e.target.value.trim()) setNameError('');
                    }}
                    placeholder="e.g. Abdisa Awel"
                    disabled={busy}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: nameError ? '1px solid #b83b3b' : '1px solid #dbe4d8',
                      fontSize: '15px',
                      marginBottom: '14px'
                    }}
                  />
                  {nameError && (
                    <div style={{ color: '#b83b3b', fontSize: '12.5px', marginBottom: '14px', fontWeight: 500 }}>
                      ⚠ {nameError}
                    </div>
                  )}

                  <label htmlFor="customer-phone" style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Phone Number <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(for Telebirr / CBE payment receipt)</span>
                  </label>
                  <input
                    id="customer-phone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={20}
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. 0911 234 567"
                    disabled={busy}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid #dbe4d8',
                      fontSize: '15px',
                      marginBottom: '14px'
                    }}
                  />

                  <label htmlFor="order-notes" style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Kitchen Instructions <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(Optional)</span>
                  </label>
                  <textarea
                    id="order-notes"
                    maxLength={300}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="e.g. Extra napkins, please serve tea after the meal."
                    disabled={busy}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: '1px solid #dbe4d8',
                      fontSize: '14px',
                      minHeight: '80px',
                      resize: 'vertical'
                    }}
                  />
                </section>
              )}

              {/* Payment Method Selector */}
              {!submitted && step === 'review' && (
                <section className="checkout-panel payment-selection">
                  <div className="checkout-panel-heading">
                    <h2>Select Payment Method</h2>
                    <span>Ethiopian Birr (ETB)</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '12px' }}>
                    {/* Telebirr */}
                    <div
                      onClick={() => setPaymentMethod('Telebirr')}
                      style={{
                        border: paymentMethod === 'Telebirr' ? '2px solid #1e6091' : '1px solid #e0e5dd',
                        background: paymentMethod === 'Telebirr' ? '#f0f6fc' : '#ffffff',
                        padding: '14px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: '#1e6091', fontSize: '15px' }}>Telebirr</strong>
                        <input type="radio" checked={paymentMethod === 'Telebirr'} onChange={() => setPaymentMethod('Telebirr')} />
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Pay via USSD / SuperApp</span>
                    </div>

                    {/* CBE Birr */}
                    <div
                      onClick={() => setPaymentMethod('CBE Birr')}
                      style={{
                        border: paymentMethod === 'CBE Birr' ? '2px solid #6d2382' : '1px solid #e0e5dd',
                        background: paymentMethod === 'CBE Birr' ? '#faf3fc' : '#ffffff',
                        padding: '14px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: '#6d2382', fontSize: '15px' }}>CBE Birr</strong>
                        <input type="radio" checked={paymentMethod === 'CBE Birr'} onChange={() => setPaymentMethod('CBE Birr')} />
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Commercial Bank of Ethiopia</span>
                    </div>

                    {/* Chapa Payment */}
                    <div
                      onClick={() => setPaymentMethod('Chapa')}
                      style={{
                        border: paymentMethod === 'Chapa' ? '2px solid #143d2b' : '1px solid #e0e5dd',
                        background: paymentMethod === 'Chapa' ? '#f0f7f2' : '#ffffff',
                        padding: '14px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: '#143d2b', fontSize: '15px' }}>Chapa Pay</strong>
                        <input type="radio" checked={paymentMethod === 'Chapa'} onChange={() => setPaymentMethod('Chapa')} />
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Cards & Mobile Wallets</span>
                    </div>

                    {/* Cash to Waiter */}
                    <div
                      onClick={() => setPaymentMethod('Cash')}
                      style={{
                        border: paymentMethod === 'Cash' ? '2px solid #c69234' : '1px solid #e0e5dd',
                        background: paymentMethod === 'Cash' ? '#fcf9f2' : '#ffffff',
                        padding: '14px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: '#8f681a', fontSize: '15px' }}>Cash to Waiter</strong>
                        <input type="radio" checked={paymentMethod === 'Cash'} onChange={() => setPaymentMethod('Cash')} />
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Settle cash at table</span>
                    </div>
                  </div>
                </section>
              )}

              {/* Dine-in Confirmation Box */}
              {!submitted && (
                <section className="checkout-panel table-confirmation">
                  <div className="table-confirm-icon">
                    <Icon name="check" size={25} />
                  </div>
                  <div>
                    <span className="menu-eyebrow">DINE-IN SERVICE</span>
                    <h2>Abay Kitchen Dining</h2>
                    <p>Bole Medhanialem, Addis Ababa · Prepared fresh upon ordering</p>
                  </div>
                </section>
              )}
            </div>

            {/* Order Summary Column */}
            <aside className="checkout-summary-column">
              <section className="checkout-panel checkout-summary">
                <span className="menu-eyebrow">ABAY KITCHEN · DINE-IN</span>
                <h2>{submitted ? 'Order Summary' : 'Total Amount'}</h2>
                <div className="summary-detail">
                  <span>Subtotal · {count} items</span>
                  <span>{money(total)}</span>
                </div>
                <div className="summary-detail">
                  <span>Service & VAT (Inclusive)</span>
                  <span>ETB 0</span>
                </div>
                <div className="checkout-final-total">
                  <span>Total</span>
                  <strong>{money(total)}</strong>
                </div>

                {!submitted ? (
                  <>
                    <Button
                      disabled={busy}
                      onClick={() => (step === 'cart' ? setStep('review') : submit())}
                    >
                      {busy ? (
                        <>
                          <span className="submit-spinner" /> {paymentMethod === 'Chapa' ? 'Redirecting to Chapa Secure Portal…' : 'Connecting to Kitchen…'}
                        </>
                      ) : step === 'cart' ? (
                        <>
                          Continue to Details <Icon name="arrow" size={16} />
                        </>
                      ) : (
                        `Pay with ${paymentMethod} · ${money(total)}`
                      )}
                    </Button>
                    <p className="submission-consent">
                      {step === 'cart'
                        ? 'Next: Enter your name and choose payment method.'
                        : 'Your order will be sent straight to the chef in the kitchen.'}
                    </p>
                  </>
                ) : (
                  <Button variant="secondary" onClick={onBack}>
                    Return to Menu <Icon name="arrow" size={16} />
                  </Button>
                )}
              </section>

              <div className="checkout-reassurance">
                <Icon name="check" size={14} /> Direct to kitchen · No waiting required
              </div>
            </aside>
          </div>
        )}

        <footer className="checkout-footer">
          Abay Kitchen <i /> Thoughtfully served with <strong>gebeta<span>QR</span></strong>
        </footer>
      </div>

      {editing && (
        <FoodDetails dish={editing.dish} initial={editing} onClose={() => setEditing(null)} onAdd={saveEdit} />
      )}
    </div>
  );
}
