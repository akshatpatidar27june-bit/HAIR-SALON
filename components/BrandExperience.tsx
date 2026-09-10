'use client';

import {useEffect,useState} from 'react';

export function BrandLogo({compact=false}:{compact?:boolean}){
  return <div className={`brand-logo pointer-events-none flex items-center gap-2.5 rounded-2xl border border-white/60 bg-white/80 px-2.5 py-2 shadow-lg backdrop-blur-xl ${compact?'':'pr-4'}`} aria-label="Lucky Hair Salon">
    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#17130f] text-sm font-bold tracking-tight text-white">LH</div>
    {!compact&&<div className="leading-none"><div className="serif text-sm font-bold tracking-wide text-[#17130f]">Lucky Hair Salon</div><div className="mt-1 text-[8px] font-semibold uppercase tracking-[.22em] text-[#8c6b43]">Since 1994</div></div>}
  </div>
}

export function BrandExperience(){
  const [visible,setVisible]=useState(false);
  const [leaving,setLeaving]=useState(false);

  useEffect(()=>{
    try{
      if(sessionStorage.getItem('lucky_hair_salon_intro_seen')==='1') return;
      sessionStorage.setItem('lucky_hair_salon_intro_seen','1');
    }catch{}

    setVisible(true);
    const leaveTimer=window.setTimeout(()=>setLeaving(true),2200);
    const hideTimer=window.setTimeout(()=>setVisible(false),2850);
    return()=>{window.clearTimeout(leaveTimer);window.clearTimeout(hideTimer)};
  },[]);

  if(!visible) return null;

  return <div className={`fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-[#17130f] text-white transition-opacity duration-700 ${leaving?'opacity-0':'opacity-100'}`}>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(184,138,69,.24),transparent_34%),radial-gradient(circle_at_15%_85%,rgba(255,255,255,.06),transparent_30%)]"/>
    <div className="relative flex flex-col items-center px-6 text-center">
      <div className="brand-intro-mark grid h-24 w-24 place-items-center rounded-[30px] border border-white/15 bg-white/[.07] text-3xl font-bold tracking-tight shadow-2xl backdrop-blur-xl">LH</div>
      <p className="mt-7 text-[11px] font-semibold uppercase tracking-[.45em] text-[#d2ad70]">Since 1994</p>
      <h1 className="serif mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Lucky Hair Salon</h1>
      <div className="mt-7 h-px w-20 bg-[#b88a45]/70"/>
    </div>
  </div>
}
