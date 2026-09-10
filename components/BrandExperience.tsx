'use client';

import {useEffect,useState} from 'react';

const LOGO_DATA = 'data:image/webp;base64,UklGRgYrAABXRUJQVlA4IPoqAACwtACdASqNAY8BPjEYikOiIaESOMT4IAMEtLd+A8ojqdreZ4GKncMP/o/7+cA/1e8C38f/XP7X+wn94/6fmP+afrn46/2n/ydcnrb/n+hv8T+vX27+6fs3/Z/2++cfBH4k/1vqC/iP8a/tP90/ZL/CfsX7lP9p3Vmzf7D0BfWv6j/kf8J/iP+b/b/Tf/iPRz7G/7b3AP5X/WP8v+Vf7//838C/6XiE+r+wF/Ov7T/sP8R+VX0rfzv/k/y3+v/db26fnH+K/7v+U/13yD/y3+s/7L+//5n/r/43////byhek0QzlpJJux9nrkNoAZfGacG4dNdFhnbU5bfm8W3eRIkQE7berk3kn/0fJr9+qkQX6MKo7OSmkgLY';

export function BrandLogo({compact=false}:{compact?:boolean}){
  return (
    <div className="pointer-events-none" aria-label="Lucky Hair Salon">
      <img
        src={LOGO_DATA}
        alt="Lucky Salon & Academy — Since 1994"
        className={compact ? 'block h-auto w-[92px] object-contain' : 'block h-auto w-[132px] object-contain drop-shadow-[0_8px_22px_rgba(0,0,0,.35)] sm:w-[145px]'}
      />
    </div>
  );
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
    const hideTimer=window.setTimeout(()=>setVisible(false),2950);
    return()=>{window.clearTimeout(leaveTimer);window.clearTimeout(hideTimer)};
  },[]);

  if(!visible) return null;

  return (
    <div className={`fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-black transition-opacity duration-700 ${leaving?'opacity-0':'opacity-100'}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,.09),transparent_34%),radial-gradient(circle_at_15%_85%,rgba(255,255,255,.05),transparent_30%)]" />
      <div className="relative flex flex-col items-center px-6 text-center">
        <img
          src={LOGO_DATA}
          alt="Lucky Salon & Academy — Since 1994"
          className="w-[250px] max-w-[78vw] object-contain drop-shadow-[0_18px_45px_rgba(0,0,0,.55)] sm:w-[310px]"
        />
        <div className="mt-8 h-px w-24 bg-white/35" />
        <p className="mt-5 text-[10px] font-semibold uppercase tracking-[.45em] text-white/70">Welcome</p>
      </div>
    </div>
  );
}
