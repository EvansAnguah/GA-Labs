import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useAuthStore } from '../store/useAuthStore';
import { Navigate } from 'react-router-dom';
import { Users, Activity, LayoutDashboard, Globe } from 'lucide-react';

export default function AdminDashboard() {
  const { user, profile, loading: authLoading } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (profile?.role !== 'admin') {
        setLoading(false);
        return;
      }
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const portfoliosSnap = await getDocs(collection(db, 'portfolios'));
        
        setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setPortfolios(portfoliosSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Error fetching admin data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (!authLoading) {
       fetchData();
    }
  }, [profile, authLoading]);

  if (authLoading) return <div className="p-8">Loading administration dashboard...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.role !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-500 mb-4">You do not have permission to view this page.</p>
          <a href="/editor" className="text-emerald-500 hover:text-emerald-600 font-medium">Return to Editor</a>
        </div>
      </div>
    );
  }

  if (loading) return <div className="p-8">Loading administration dashboard...</div>;

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <aside className="w-64 bg-[#0F172A] text-slate-300 p-6 flex flex-col">
        <div className="text-2xl font-serif font-bold italic tracking-tighter text-emerald-400 mb-12">GA Admin</div>
        <nav className="space-y-2 flex-1">
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-emerald-500/10 text-emerald-400 font-medium">
            <LayoutDashboard className="w-5 h-5" /> Overview
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
            <Users className="w-5 h-5" /> Users
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
            <Globe className="w-5 h-5" /> Portfolios
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors">
            <Activity className="w-5 h-5" /> System Logs
          </a>
        </nav>
      </aside>

      <main className="flex-1 p-12 overflow-y-auto">
        <header className="mb-12">
          <h1 className="text-3xl font-bold text-slate-900">Platform Overview</h1>
          <p className="text-slate-500 mt-2">Monitor active users and portfolios.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 text-sm font-medium mb-1">Total Users</div>
            <div className="text-4xl font-bold text-slate-900">{users.length}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 text-sm font-medium mb-1">Active Portfolios</div>
            <div className="text-4xl font-bold text-slate-900">{portfolios.filter(p => p.isPublished).length}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 text-sm font-medium mb-1">Total Drafts</div>
            <div className="text-4xl font-bold text-slate-900">{portfolios.filter(p => !p.isPublished).length}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="font-bold text-slate-800">Recent Users</h2>
          </div>
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-3 font-semibold">User</th>
                <th className="px-6 py-3 font-semibold">Role</th>
                <th className="px-6 py-3 font-semibold">Portfolio Status</th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map(u => {
                const p = portfolios.find(port => port.ownerId === u.id);
                return (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{u.displayName || 'Unnamed'}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-semibold capitalize">{u.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      {p && p.isPublished ? (
                        <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-600 text-xs font-semibold">Published</span>
                      ) : (
                        <span className="px-2 py-1 rounded bg-amber-50 text-amber-600 text-xs font-semibold">Draft</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-rose-500 hover:text-rose-600 text-xs font-semibold">Suspend</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
