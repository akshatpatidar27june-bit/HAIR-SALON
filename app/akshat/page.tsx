'use client';

import { FormEvent, useEffect, useState } from 'react';
import { LockKeyhole, ShieldCheck, UnlockKeyhole, LogOut, AlertCircle, CheckCircle2 } from 'lucide-react';

type LockState = { locked: boolean; message: string | null };

export default function AkshatDeveloperPage() {
  const [passcode, setPasscode] = useState('');
  const [reason, setReason] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [state, setState] = useState<LockState>({ locked: false, message: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function refreshStatus() {
    const response = await fetch('/api/lock', { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not load lock status. Check the Vercel environment variables and Supabase migration.');
    const data = await response.json();
    setState({ locked: Boolean(data.locked), message: data.message || null });
  }

  useEffect(() => { refreshStatus().catch((e) => setError(e.message)); }, []);

  async function post(payload: Record<string, string>) {
    const response = await fetch('/api/lock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed.');
    return data;
  }

  async function login(event: FormEvent) {
    event.preventDefault();
    setLoading(true); setError(''); setNotice('');
    try {
      await post({ action: 'login', passcode });
      setAuthenticated(true); setPasscode('');
      await refreshStatus();
      setNotice('Developer access granted.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Sign in failed.'); }
    finally { setLoading(false); }
  }

  async function toggleLock() {
    setLoading(true); setError(''); setNotice('');
    try {
      if (state.locked) {
        await post({ action: 'unlock' });
        setNotice('Website unlocked successfully.');
      } else {
        await post({ action: 'lock', reason });
        setReason('');
        setNotice('Website locked. Visitors will see your message.');
      }
      await refreshStatus();
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to update lock.'); }
    finally { setLoading(false); }
  }

  async function logout() {
    try { await post({ action: 'logout' }); } finally { setAuthenticated(false); }
  }

  return (
    <main className="min-h-screen bg-[#17130f] px-5 py-12 text-[#f7f2ea]">
      <div className="mx-auto max-w-xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#d5a94d] text-[#17130f]"><ShieldCheck size={24}/></div>
          <div><p className="text-xs uppercase tracking-[.28em] text-[#d5a94d]">Private developer area</p><h1 className="text-3xl font-semibold">Akshat Control</h1></div>
        </div>
        <section className="rounded-[28px] border border-white/10 bg-white/[.05] p-6 shadow-2xl md:p-8">
          {!authenticated ? (
            <>
              <h2 className="text-xl font-semibold">Developer authentication</h2>
              <p className="mt-2 text-sm leading-6 text-white/60">Sign in with your private Vercel developer passcode to manage temporary website access.</p>
              <form onSubmit={login} className="mt-6 space-y-4">
                <label className="block text-sm font-medium">Developer passcode
                  <input type="password" autoComplete="current-password" required value={passcode} onChange={e=>setPasscode(e.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 outline-none focus:border-[#d5a94d]" placeholder="Enter your private passcode"/>
                </label>
                <button disabled={loading} className="w-full rounded-xl bg-[#d5a94d] px-4 py-3 font-semibold text-[#17130f] disabled:opacity-60">{loading?'Checking…':'Access developer controls'}</button>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <div><h2 className="text-xl font-semibold">Website access control</h2><p className="mt-1 text-sm text-white/60">Control the public site, owner login and staff panel.</p></div>
                <button onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs text-white/70"><LogOut size={14}/> Sign out</button>
              </div>
              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                <span className={`h-3 w-3 rounded-full ${state.locked?'bg-red-400':'bg-emerald-400'}`}/>
                <div><p className="font-semibold">{state.locked?'Website is locked':'Website is live'}</p><p className="text-xs text-white/50">{state.locked?'Visitors are redirected to the temporary lock page.':'All website pages are accessible.'}</p></div>
              </div>
              {!state.locked && (
                <label className="mt-6 block text-sm font-medium">Message visitors will see
                  <textarea value={reason} onChange={e=>setReason(e.target.value)} maxLength={500} rows={4} placeholder="Explain why the website is temporarily unavailable…" className="mt-2 w-full resize-y rounded-xl border border-white/15 bg-black/20 px-4 py-3 outline-none focus:border-[#d5a94d]"/>
                  <span className="mt-1 block text-right text-xs text-white/40">{reason.length}/500</span>
                </label>
              )}
              {state.locked && state.message && <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4"><p className="text-xs uppercase tracking-wider text-[#d5a94d]">Current visitor message</p><p className="mt-2 whitespace-pre-wrap text-sm text-white/80">{state.message}</p></div>}
              <button onClick={toggleLock} disabled={loading || (!state.locked && reason.trim().length<5)} className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-4 font-semibold disabled:opacity-50 ${state.locked?'bg-emerald-400 text-[#102017]':'bg-red-400 text-[#241010]'}`}>
                {state.locked?<><UnlockKeyhole size={18}/>{loading?'Unlocking…':'Unlock website'}</>:<><LockKeyhole size={18}/>{loading?'Locking…':'Lock website temporarily'}</>}
              </button>
              <p className="mt-3 text-center text-xs text-white/40">The website remains locked until you unlock it here.</p>
            </>
          )}
          {error && <div role="alert" className="mt-5 flex gap-2 rounded-xl bg-red-500/10 p-3 text-sm text-red-200"><AlertCircle size={18} className="shrink-0"/>{error}</div>}
          {notice && <div role="status" className="mt-5 flex gap-2 rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-200"><CheckCircle2 size={18} className="shrink-0"/>{notice}</div>}
        </section>
        <p className="mt-6 text-center text-xs text-white/35">Lucky Hair Salon • Developer-only controls</p>
      </div>
    </main>
  );
}
