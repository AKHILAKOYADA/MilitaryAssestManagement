import React from 'react';
import { User } from 'lucide-react';

const StatCard = ({ title, value, subtitle, accent }) => (
  <div className="bg-[#0f1720] rounded-xl shadow-lg p-6 relative overflow-hidden border border-transparent">
    <div className={`absolute -top-1 left-0 w-20 h-1 rounded-tr-xl ${accent} opacity-90`} />
    <div className="text-[--text-secondary] text-xs uppercase tracking-wider mb-2">{title}</div>
    <div className="text-3xl font-extrabold text-[--text-primary] mb-1">{value}</div>
    <div className="text-sm text-[--text-secondary]">{subtitle}</div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-[#0b0f13] p-6 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600/10 rounded-full flex items-center justify-center text-blue-400">
            <User size={18}/>
          </div>
          <div>
            <div className="text-sm font-semibold text-[--text-primary]">System Administrator</div>
            <div className="text-xs text-[--text-secondary]">Administrator</div>
          </div>
        </div>
        <nav className="flex-1">
          <ul className="space-y-2 text-[--text-secondary]">
            <li className="p-3 rounded-lg bg-gradient-to-r from-blue-600/10 to-transparent text-blue-300">Dashboard</li>
            <li className="p-3 rounded-lg hover:bg-white/3">Purchases</li>
            <li className="p-3 rounded-lg hover:bg-white/3">Transfers</li>
            <li className="p-3 rounded-lg hover:bg-white/3">Assignments</li>
            <li className="p-3 rounded-lg hover:bg-white/3">Expenditures</li>
          </ul>
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto bg-[--bg-primary]">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-[--text-primary]">Dashboard</h1>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-[#111519] rounded-lg text-[--text-secondary]">Filters</button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">Logout</button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard title="Opening Balance" value="456,716" subtitle="Total assets at start" accent="bg-gradient-to-r from-blue-500 to-sky-400" />
          <StatCard title="Current Balance" value="456,716" subtitle="Available inventory" accent="bg-gradient-to-r from-blue-500 to-indigo-500" />
          <StatCard title="Net Movement" value="+0" subtitle="Click for details" accent="bg-gradient-to-r from-blue-400 to-cyan-400" />
          <StatCard title="Assigned" value="0" subtitle="To personnel" accent="bg-gradient-to-r from-blue-500 to-sky-400" />
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0f1720] rounded-xl p-6 shadow-lg border border-transparent">
            <div className="text-lg text-[--text-secondary] mb-4">Purchases</div>
            <div className="text-4xl font-extrabold text-[--text-primary]">25,155</div>
            <div className="text-sm text-[--text-secondary] mt-2">Units Purchased</div>
          </div>

          <div className="bg-[#0f1720] rounded-xl p-6 shadow-lg border border-transparent">
            <div className="text-lg text-[--text-secondary] mb-4">Transfers In</div>
            <div className="text-4xl font-extrabold text-emerald-400">+50</div>
            <div className="text-sm text-[--text-secondary] mt-2">Units Received</div>
          </div>

          <div className="bg-[#0f1720] rounded-xl p-6 shadow-lg border border-transparent">
            <div className="text-lg text-[--text-secondary] mb-4">Transfers Out</div>
            <div className="text-4xl font-extrabold text-rose-400">-50</div>
            <div className="text-sm text-[--text-secondary] mt-2">Units Sent</div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
