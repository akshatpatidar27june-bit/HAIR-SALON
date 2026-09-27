'use client';

import { FormEvent, useEffect, useState } from 'react';

export function TemporaryPaymentGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'checking' | 'locked' | 'open'>('checking');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch('/api/payment-lock', { cache: 'no-store' })
      .then(async (r) => {
        if (!r.ok) throw new Error('Could not verify access.');
        const data = await r.json();
        setStatus(data.unlocked ? 'open' : 'locked');
      })
      .catch(() => { setError('Access check is temporarily unavailable. Please try again.'); setStatus('locked'); });
  }, []);

  async function unlock(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const r = await fetch('/api/payment-lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await r.json();
      if (!r.ok || !data.unlocked) throw new Error(data.error || 'That code was not accepted.');
      setStatus('open');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to unlock right now.');
    } finally { setBusy(false); }
  }

  if (status === 'checking') return <main className="grid min-h-screen place-items-center bg-[#f7f2ea] text-[#17130f]">Checking workspace access…</main>;
  if (status === 'open') return <>{children}</>;

  return <main className="grid min-h-screen place-items-center bg-[#f7f2ea] px-5 py-10 text-[#17130f]">
    <section className="w-full max-w-md rounded-3xl border border-[#e5ddd2] bg-white p-7 shadow-xl">
      <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-[#17130f] text-xl text-white">🔒</div>
      <p className="text-xs font-bold uppercase tracking-[.2em] text-[#9b6b16]">Temporary access pause</p>
      <h1 className="mt-2 text-2xl font-bold">Salon workspace locked</h1>
      <p className="mt-3 text-sm leading-6 text-[#756b62]">Access to this software is temporarily paused while the outstanding ₹1,600 development payment is being resolved. Your salon records have not been deleted.</p>
      <form onSubmit={unlock} className="mt-6 space-y-3">
        <label className="block text-sm font-semibold" htmlFor="unlock-code">Unlock code</label>
        <input id="unlock-code" value={code} onChange={e=>setCode(e.target.value)} inputMode="numeric" autoComplete="one-time-code" required className="w-full rounded-xl border border-[#e5ddd2] px-4 py-3 outline-none focus:border-[#9b6b16]" placeholder="Enter code provided by developer" />
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button disabled={busy} className="w-full rounded-xl bg-[#17130f] px-4 py-3 font-semibold text-white disabled:opacity-60">{busy ? 'Checking…' : 'Unlock workspace'}</button>
      </form>
      <p className="mt-5 text-xs leading-5 text-[#756b62]">If you believe this is an error, contact the developer to discuss the invoice and access. No customer-facing booking page is affected by this notice.</p>
    </section>
  </main>;
}
