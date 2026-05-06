import { LayoutDashboard } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-purple-600/20">
          <LayoutDashboard size={20} className="text-purple-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-100">Dashboard</h1>
          <p className="text-sm text-gray-500">Hexa radar, metrics, recent trades</p>
        </div>
      </div>
      <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-12 text-center text-gray-600">
        <p className="text-sm">Coming in Phase 4 🔮</p>
      </div>
    </div>
  );
}
