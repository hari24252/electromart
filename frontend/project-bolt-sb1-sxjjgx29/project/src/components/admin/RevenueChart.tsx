import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { cn, formatCurrency } from '@/lib/utils';
import { api } from '@/api/services';
import { getApiErrorMessage } from '@/api/client';
import type { RevenueChartPoint } from '@/types';

type Period = 'day' | 'week' | 'month';

export function RevenueChart() {
  const [period, setPeriod] = useState<Period>('day');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [points, setPoints] = useState<RevenueChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    void api.admin.dashboard.revenueChart(period)
      .then((nextPoints) => active && setPoints(nextPoints))
      .catch((requestError) => active && setError(getApiErrorMessage(requestError, 'Revenue data could not be loaded.')))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [attempt, period]);

  const data = points.map((point) => ({ ...point, label: new Date(point.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) }));

  return (
    <div className="brutal-card bg-white p-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-bold text-sm uppercase tracking-wide">Revenue Overview</h3>
        <div className="flex items-center gap-2">
          <div className="flex brutal-border">{(['day', 'week', 'month'] as Period[]).map((value) => <button key={value} type="button" onClick={() => setPeriod(value)} className={cn('px-3 py-1.5 text-xs font-bold uppercase transition-colors', period === value ? 'bg-ink-900 text-white' : 'bg-white text-ink-600 hover:bg-paper-100')}>{value}</button>)}</div>
          <div className="flex brutal-border"><button type="button" onClick={() => setChartType('area')} className={cn('px-3 py-1.5 text-xs font-bold uppercase', chartType === 'area' ? 'bg-ink-900 text-white' : 'bg-white text-ink-600 hover:bg-paper-100')}>Area</button><button type="button" onClick={() => setChartType('bar')} className={cn('px-3 py-1.5 text-xs font-bold uppercase', chartType === 'bar' ? 'bg-ink-900 text-white' : 'bg-white text-ink-600 hover:bg-paper-100')}>Bar</button></div>
        </div>
      </div>

      {error ? <Alert variant="error" title="Revenue chart unavailable"><p>{error}</p><Button className="mt-3" size="sm" onClick={() => setAttempt((value) => value + 1)}>Try again</Button></Alert> : loading ? <div className="grid h-72 place-items-center text-sm text-ink-500">Loading revenue data…</div> : !data.length ? <div className="grid h-72 place-items-center text-sm text-ink-500">No delivered-order revenue for this period.</div> : <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%">{chartType === 'area' ? <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}><defs><linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#329fff" stopOpacity={0.8} /><stop offset="95%" stopColor="#329fff" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#eeeef1" /><XAxis dataKey="label" tick={{ fontSize: 10 }} interval={4} /><YAxis tick={{ fontSize: 10 }} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} /><Tooltip formatter={(value: number) => [formatCurrency(value), 'Revenue']} contentStyle={{ border: '2px solid #0d0d12', borderRadius: 0, fontSize: 12 }} /><Area type="monotone" dataKey="total" stroke="#1b80f5" strokeWidth={2} fill="url(#colorRev)" /></AreaChart> : <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="#eeeef1" /><XAxis dataKey="label" tick={{ fontSize: 10 }} interval={4} /><YAxis tick={{ fontSize: 10 }} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} /><Tooltip formatter={(value: number) => [formatCurrency(value), 'Revenue']} contentStyle={{ border: '2px solid #0d0d12', borderRadius: 0, fontSize: 12 }} /><Bar dataKey="total" fill="#329fff" /></BarChart>}</ResponsiveContainer></div>}
    </div>
  );
}
