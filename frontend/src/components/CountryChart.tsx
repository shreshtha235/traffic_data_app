import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAnalytics } from '../hooks/useAnalytics';
import type { DrillState } from '../types';

const COLORS = { Free: '#22c55e', Moderate: '#f59e0b', Heavy: '#ef4444' };
const PIE_COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#22c55e', '#f43f5e', '#a78bfa', '#34d399', '#60a5fa', '#fb923c', '#e879f9'];
const CHART_H = 360;

interface Props {
  drill: DrillState;
  onDrill: (next: DrillState) => void;
  from: string;
  to: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '12px 16px' }}>
      <p style={{ fontWeight: 600, marginBottom: 8, color: '#f1f5f9' }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.fill, display: 'inline-block' }} />
          <span style={{ color: '#94a3b8', fontSize: 13 }}>{p.dataKey}: </span>
          <span style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600 }}>{Number(p.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

type ShowTop = '5' | '10' | 'all';

export function CountryChart({ drill, onDrill, from, to }: Props) {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [barDir, setBarDir] = useState<'v' | 'h'>('v');
  const [pieTab, setPieTab] = useState<'Free' | 'Moderate' | 'Heavy'>('Heavy');
  const [showTop, setShowTop] = useState<ShowTop>('all');

  const { data, loading } = useAnalytics(drill, from, to);

  const allChartData = data.map((row) => ({
    name: row.label,
    Free: parseInt(row.free_count),
    Moderate: parseInt(row.moderate_count),
    Heavy: parseInt(row.heavy_count),
  }));

  // Top N filter only at country level
  const chartData = drill.level !== 'country' ? allChartData : (
    showTop === 'all' ? allChartData :
    allChartData.slice(0, parseInt(showTop))
  );

  const pieData = chartData.map((row) => ({ name: row.name, value: row[pieTab] }));
  const isHorizontal = chartType === 'bar' && barDir === 'h';

  const title = drill.city
    ? `Road Segments — ${drill.city}`
    : drill.country
    ? `Cities — ${drill.country}`
    : 'Country-wise Traffic Distribution';


  const handleClick = (entry: any) => {
    if (drill.level === 'country') onDrill({ level: 'city', country: entry.name });
    else if (drill.level === 'city') onDrill({ level: 'segment', country: drill.country, city: entry.name });
  };

  const ClickableTick = ({ x, y, payload }: any) => (
    <text x={x} y={y + 4} textAnchor="end" fontSize={11}
      transform={`rotate(-40, ${x}, ${y + 4})`}
      fill={drill.level !== 'segment' ? '#6366f1' : '#94a3b8'}
      cursor={drill.level !== 'segment' ? 'pointer' : 'default'}
      onClick={() => drill.level !== 'segment' && handleClick({ name: payload.value })}>
      {payload.value}
    </text>
  );

  const ClickableYTick = ({ x, y, payload }: any) => (
    <text x={x - 4} y={y + 4} textAnchor="end" fontSize={11}
      fill={drill.level !== 'segment' ? '#6366f1' : '#94a3b8'}
      cursor={drill.level !== 'segment' ? 'pointer' : 'default'}
      onClick={() => drill.level !== 'segment' && handleClick({ name: payload.value })}>
      {payload.value}
    </text>
  );

  const gradientDefs = (
    <defs>
      {(['Free', 'Moderate', 'Heavy'] as const).map((k) => (
        <linearGradient key={k} id={`grad-${k}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLORS[k]} stopOpacity={0.95} />
          <stop offset="100%" stopColor={COLORS[k]} stopOpacity={0.5} />
        </linearGradient>
      ))}
      {(['Free', 'Moderate', 'Heavy'] as const).map((k) => (
        <linearGradient key={`h-${k}`} id={`hgrad-${k}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={COLORS[k]} stopOpacity={0.6} />
          <stop offset="100%" stopColor={COLORS[k]} stopOpacity={1} />
        </linearGradient>
      ))}
    </defs>
  );

  const LegendRow = () => (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 12, padding: '8px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      {(['Free', 'Moderate', 'Heavy'] as const).map((k) => (
        <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[k], display: 'inline-block' }} />
          {k} traffic
        </span>
      ))}
    </div>
  );

  const vBottomMargin = chartData.length > 6 ? 70 : 50;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
      <p style={{ textAlign: 'center', fontSize: 13, fontWeight: 600, color: 'var(--accent)', visibility: drill.level !== 'segment' && chartType !== 'pie' ? 'visible' : 'hidden', margin: 0, lineHeight: '20px', height: 20 }}>
        👆 {drill.level === 'country' ? 'Click a bar/label to drill into cities' : 'Click a bar/label to drill into road segments'}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h2>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {/* Top N — only at country level */}
          {drill.level === 'country' && (
            <select value={showTop} onChange={(e) => setShowTop(e.target.value as ShowTop)}
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 8px', fontSize: 12, cursor: 'pointer' }}>
              <option value="5">Top 5</option>
              <option value="10">Top 10</option>
              <option value="all">All</option>
            </select>
          )}
          {/* H/V toggle — only for bar */}
          {chartType === 'bar' && (
            <>
              <button className={`btn${barDir === 'v' ? ' active' : ''}`} onClick={() => setBarDir('v')} title="Vertical bars">↕</button>
              <button className={`btn${barDir === 'h' ? ' active' : ''}`} onClick={() => setBarDir('h')} title="Horizontal bars">↔</button>
            </>
          )}
          {(['bar', 'line', 'pie'] as const).map((t) => (
            <button key={t} className={`btn${chartType === t ? ' active' : ''}`} onClick={() => setChartType(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="skeleton" style={{ height: CHART_H }} />}

      {!loading && chartType === 'bar' && (
        <>
          <LegendRow />
          {isHorizontal ? (
            <ResponsiveContainer width="100%" height={CHART_H}>
              <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
                {gradientDefs}
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                <YAxis type="category" dataKey="name" tick={<ClickableYTick />} width={110} />
                <Tooltip content={<CustomTooltip />} />
                {(['Free', 'Moderate', 'Heavy'] as const).map((key) => (
                  <Bar key={key} dataKey={key} fill={`url(#hgrad-${key})`} stackId="a"
                    cursor={drill.level !== 'segment' ? 'pointer' : 'default'} onClick={handleClick} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={CHART_H}>
              <BarChart data={chartData} margin={{ top: 4, right: 16, left: 16, bottom: vBottomMargin }}>
                {gradientDefs}
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={<ClickableTick />} interval={0}
                  label={{ value: drill.level === 'country' ? 'Country' : drill.level === 'city' ? 'City' : 'Segment', position: 'insideBottom', offset: -(vBottomMargin - 14), fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                  label={{ value: 'Readings', angle: -90, position: 'insideLeft', offset: 10, fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                {(['Free', 'Moderate', 'Heavy'] as const).map((key) => (
                  <Bar key={key} dataKey={key} fill={`url(#grad-${key})`} stackId="a"
                    cursor={drill.level !== 'segment' ? 'pointer' : 'default'} onClick={handleClick} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </>
      )}

      {!loading && chartType === 'line' && (
        <>
          <LegendRow />
          <ResponsiveContainer width="100%" height={CHART_H}>
            <LineChart data={chartData} margin={{ top: 4, right: 16, left: 16, bottom: vBottomMargin }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={<ClickableTick />} interval={0}
                label={{ value: drill.level === 'country' ? 'Country' : 'City', position: 'insideBottom', offset: -(vBottomMargin - 14), fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }}
                label={{ value: 'Readings', angle: -90, position: 'insideLeft', offset: 10, fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              {(['Free', 'Moderate', 'Heavy'] as const).map((key) => (
                <Line key={key} type="monotone" dataKey={key} stroke={COLORS[key]} strokeWidth={2} dot={false}
                  activeDot={{ r: 7, onClick: (_evt: any, dot: any) => handleClick({ name: dot?.payload?.name }) }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </>
      )}

      {!loading && chartType === 'pie' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            {(['Free', 'Moderate', 'Heavy'] as const).map((t) => (
              <button key={t} className={`btn${pieTab === t ? ' active' : ''}`}
                style={{ borderColor: pieTab === t ? undefined : COLORS[t], color: pieTab === t ? undefined : COLORS[t] }}
                onClick={() => setPieTab(t)}>{t}</button>
            ))}
          </div>
          {drill.level !== 'segment' && (
            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--accent)', fontWeight: 600, margin: 0 }}>
              👆 {drill.level === 'country' ? 'Click a slice to drill into cities' : 'Click a slice to drill into road segments'}
            </p>
          )}
          <ResponsiveContainer width="100%" height={CHART_H}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={130} innerRadius={60}
                label={({ name, percent }: any) => (percent ?? 0) > 0.04 ? `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%` : ''}
                labelLine={false}>
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}
                    cursor={drill.level !== 'segment' ? 'pointer' : 'default'}
                    onClick={() => handleClick({ name: entry.name })} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => Number(v).toLocaleString()}
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }}
                itemStyle={{ color: '#f1f5f9' }} labelStyle={{ color: '#94a3b8', fontWeight: 600 }} />
              <Legend formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 13 }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
