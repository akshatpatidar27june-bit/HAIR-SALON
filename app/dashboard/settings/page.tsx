'use client';

import { useState } from 'react';
import { ArrowLeft, Lock, Save, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';

export default function Settings() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  async function resetDashboard() {
    if (!confirm('Reset dashboard metrics? This will remove transaction records only. Your outlets, services, staff, managers and customer profiles will NOT be deleted.')) return;

    setMessage('Resetting dashboard transactions...');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage('Please sign in again.');
      return;
    }

    const { error } = await supabase.rpc('reset_owner_dashboard');
    setMessage(
      error?.message ||
        'Dashboard metrics reset successfully. Outlets, services, staff and customers were kept.'
    );
  }

  async function savePassword() {
    setMessage('');

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    setMessage(error?.message || 'Password updated successfully.');
  }

  return (
    <main className="min-h-screen bg-[#f5f1ea] p-5 md:p-8">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-6 flex items-center gap-2 text-sm"
        >
          <ArrowLeft size={16} /> Dashboard
        </button>

        <h1 className="text-4xl font-bold">Owner settings</h1>
        <p className="mt-2 text-[#756b62]">
          Control account security and dashboard data.
        </p>

        <section className="mt-8 rounded-3xl border border-[#e5ddd2] bg-white p-6">
          <div className="flex items-center gap-3">
            <Lock />
            <div>
              <h2 className="font-bold">Change password</h2>
              <p className="text-xs text-[#756b62]">
                Only the signed-in owner can change this password.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className="rounded-2xl border border-[#e5ddd2] px-4 py-4 outline-none"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="rounded-2xl border border-[#e5ddd2] px-4 py-4 outline-none"
            />
          </div>

          {message && (
            <p className="mt-4 rounded-2xl bg-[#f5f1ea] p-3 text-sm">
              {message}
            </p>
          )}

          <button
            onClick={savePassword}
            className="mt-5 flex items-center gap-2 rounded-2xl bg-[#17130f] px-6 py-4 font-semibold text-white"
          >
            <Save size={17} /> Update password
          </button>
        </section>

        <section className="mt-5 rounded-3xl border border-[#e5ddd2] bg-white p-5">
          <div className="flex items-center gap-3">
            <RotateCcw className="text-[#8c6b43]" />
            <div>
              <h2 className="font-bold">Reset dashboard metrics</h2>
              <p className="text-xs text-[#756b62]">
                Clears transaction history used for today/monthly sales. It does
                NOT remove your outlets, services, staff, managers or customer
                profiles.
              </p>
            </div>
          </div>

          <button
            onClick={resetDashboard}
            className="mt-4 flex items-center gap-2 rounded-2xl border border-[#d8c5a8] px-4 py-3 text-sm font-semibold text-[#6f4d27]"
          >
            <RotateCcw size={16} /> Reset dashboard metrics
          </button>
        </section>
      </div>
    </main>
  );
}
