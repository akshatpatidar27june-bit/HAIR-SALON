'use client';

import { useEffect, useState } from 'react';
import { Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabasePublic } from '../lib/supabase';

export default function OwnerTeamEmailsShortcut() {
  const router = useRouter();
  const [owner, setOwner] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabasePublic.rpc('get_my_profile').then(({ data }) => {
      const profile = Array.isArray(data) ? data[0] : data;
      if (mounted) setOwner(profile?.role === 'owner' && profile?.active === true);
    });
    return () => { mounted = false; };
  }, []);

  if (!owner) return null;

  return (
    <button
      onClick={() => router.push('/dashboard/team')}
      className="fixed bottom-5 right-5 z-[70] flex items-center gap-2 rounded-2xl bg-[#17130f] px-4 py-3 text-sm font-semibold text-white shadow-2xl ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:bg-[#2a241e]"
      title="View staff and manager login emails"
    >
      <Mail size={17} />
      <span>Team login emails</span>
    </button>
  );
}
