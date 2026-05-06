import { PlusCircle } from 'lucide-react';
export default function TradeEntry() {
  return (<div className="space-y-6"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-purple-600/20"><PlusCircle size={20} className="text-purple-400" /></div><div><h1 className="text-xl font-semibold text-gray-100">New Trade</h1><p className="text-sm text-gray-500">Log a new trade</p></div></div><div className="rounded-xl border border-gray-800 bg-gray-900/50 p-12 text-center text-gray-600"><p className="text-sm">Coming in Phase 3 🔮</p></div></div>);
}
