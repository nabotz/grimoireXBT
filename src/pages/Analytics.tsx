import { BarChart3 } from 'lucide-react';
export default function Analytics() {
  return (<div className="space-y-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-purple-600/20"><BarChart3 size={20} className="text-purple-400" /></div><div><h1 className="text-xl font-semibold text-gray-100">Analytics</h1><p className="text-sm text-gray-500">PnL curve, drawdown, win rate</p></div></div><div className="rounded-xl border border-gray-800 bg-gray-900/50 p-12 text-center text-gray-600"><p className="text-sm">Coming in Phase 6 🔮</p></div></div>);
}
