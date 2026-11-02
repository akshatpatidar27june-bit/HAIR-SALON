'use client';

import { useEffect, useState } from 'react';
import { LockKeyhole, MessageSquareText, RefreshCw } from 'lucide-react';

export default function LockedPage() {
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadMessage() {
    setLoading(true);
    try {
      const response = await fetch('/api/lock', { cache: 'no-store' });
      const data = await response.json();
      setMessage(data.message || 'The website is temporarily unavailable. Please check again soon.');
      if (!data.locked) window.location.replace('/');
    } catch {
      setMessage('The website is temporarily unavailable. Please check again soon.');
    } finally { setLoading(false); }
  }

  useEffect(() => { loadMessage(); }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-[#17130f] px-5 py-12 text-[#f7f2ea]">
      <section className="w-full max-w-lg rounded-[30px] border border-white/10 bg-white/[.05] p-8 text-center shadow-2xl md:p-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#d5a94d]/15 text-[#d5a94d]"><LockKeyhole size={30}/></div>
        <p className="mt-7 text-xs font-semibold uppercase tracking-[.3em] text-[#d5a94d]">Lucky Hair Salon</p>
        <h1 className="mt-3 text-3xl font-semibold md:text-4xl">We’ll be back soon</h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-white/60">Our website is temporarily unavailable while we take care of something. Thank you for your patience.</p>
        <button onClick={()=>setShowMessage(v=>!v)} className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl border border-[#d5a94d]/40 bg-[#d5a94d]/10 px-5 py-3 text-sm font-semibold text-[#f0cf83] hover:bg-[#d5a94d]/20">
          <MessageSquareText size={17}/>{showMessage?'Hide message':'View Message'}
        </button>
        {showMessage && <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5 text-left"><p className="text-xs font-semibold uppercase tracking-wider text-[#d5a94d]">Message from the website administrator</p><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/80">{loading?'Loading message…':message}</p></div>}
        <button onClick={loadMessage} className="mx-auto mt-6 flex items-center gap-2 text-xs text-white/40 hover:text-white/70"><RefreshCw size={13}/> Check website status</button>
      </section>
    </main>
  );
}
