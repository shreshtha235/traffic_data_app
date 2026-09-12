import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Sector, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useVehicleAnalytics } from '../hooks/useVehicleAnalytics';
import type { DrillState } from '../types';

const COLORS = { Free: '#22c55e', Moderate: '#f59e0b', Heavy: '#ef4444' };
const VEHICLE_COLORS: Record<string, string> = { Car: '#6366f1', Truck: '#f59e0b', Bus: '#22c55e', Motorcycle: '#22d3ee' };
const VEHICLE_EMOJI: Record<string, string> = { Car: '🚗', Truck: '🚚', Bus: '🚌', Motorcycle: '🏍️' };
const CHART_H = 360;

interface Props { from: string; to: string; drill: DrillState; }

const VehicleTick = ({ x, y, payload }: any) => (
  <text x={x} y={y + 4} textAnchor="end" fontSize={11}
    transform={`rotate(-40, ${x}, ${y + 4})`}
    fill="#94a3b8">
    {payload.value}
  </text>
);

const VehicleTooltip = ({ active, payload, label }: any) => {
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

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const emoji = VEHICLE_EMOJI[payload.name] ?? '';
  return (
    <g>
      <text x={cx} y={cy - 18} textAnchor="middle" fill="#f1f5f9" fontSize={13} fontWeight={700}>{emoji} {payload.name}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#f1f5f9" fontSize={20} fontWeight={700}>{Number(value).toLocaleString()}</text>
      <text x={cx} y={cy + 34} textAnchor="middle" fill="#6366f1" fontSize={13}>{((percent ?? 0) * 100).toFixed(1)}%</text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 10} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 14} outerRadius={outerRadius + 18} startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  );
};

export function VehicleChart({ from, to, drill }: Props) {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [barDir, setBarDir] = useState<'v' | 'h'>('h');
  const [pieTab, setPieTab] = useState<'Free' | 'Moderate' | 'Heavy'>('Heavy');
  const { data, loading } = useVehicleAnalytics(from, to, drill.country, drill.city);

  const chartData = data.map((row) => {
    const name = row.label.charAt(0).toUpperCase() + row.label.slice(1);
    return {
      name,
      display: `${VEHICLE_EMOJI[name] ?? ''} ${name}`,
      Free: parseInt(row.free_count),
      Moderate: parseInt(row.moderate_count),
      Heavy: parseInt(row.heavy_count),
      total: parseInt(row.total_count),
      percentage: data.length
        ? ((parseInt(row.total_count) / data.reduce((s, r) => s + parseInt(r.total_count), 0)) * 100).toFixed(1)
        : '0',
    };
  });

  const pieData = chartData.map((row) => ({ name: row.name, value: row[pieTab] }));


  const LegendRow = () => (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 8, padding: '8px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      {(['Free', 'Moderate', 'Heavy'] as const).map((k) => (
        <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[k], display: 'inline-block' }} />
          {k} traffic
        </span>
      ))}
    </div>
  );

  const gradientDefs = (
    <defs>
      {(['Free', 'Moderate', 'Heavy'] as const).map((k) => (
        <linearGradient key={k} id={`vgrad-${k}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLORS[k]} stopOpacity={0.95} />
          <stop offset="100%" stopColor={COLORS[k]} stopOpacity={0.5} />
        </linearGradient>
      ))}
      {(['Free', 'Moderate', 'Heavy'] as const).map((k) => (
        <linearGradient key={`h-${k}`} id={`vhgrad-${k}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={COLORS[k]} stopOpacity={0.6} />
          <stop offset="100%" stopColor={COLORS[k]} stopOpacity={1} />
        </linearGradient>
      ))}
    </defs>
  );

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
      {/* spacer matches CountryChart's hint <p> height */}
      <div style={{ height: 20 }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
            Vehicle Type Distribution{drill.city ? ` — ${drill.city}` : drill.country ? ` — ${drill.country}` : ''}
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
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
          {barDir === 'h' ? (
            <ResponsiveContainer width="100%" height={CHART_H}>
              <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
                {gradientDefs}
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v: number) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)}
                  label={{ value: 'Readings', position: 'insideBottom', offset: -2, fill: '#94a3b8', fontSize: 12 }} />
                <YAxis type="category" dataKey="display" tick={{ fill: '#94a3b8', fontSize: 12 }} width={120}
                  label={{ value: 'Vehicle Type', angle: -90, position: 'insideLeft', offset: 16, fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip content={<VehicleTooltip />} />
                {(['Free', 'Moderate', 'Heavy'] as const).map((key) => (
                  <Bar key={key} dataKey={key} fill={`url(#vhgrad-${key})`} stackId="a" radius={key === 'Heavy' ? [0, 6, 6, 0] : undefined} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={CHART_H}>
              <BarChart data={chartData} margin={{ top: 4, right: 16, left: 16, bottom: 60 }}>
                {gradientDefs}
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="display" tick={<VehicleTick />} interval={0}
                  label={{ value: 'Vehicle Type', position: 'insideBottom', offset: -14, fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v: number) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)}
                  label={{ value: 'Readings', angle: -90, position: 'insideLeft', offset: 10, fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip content={<VehicleTooltip />} />
                {(['Free', 'Moderate', 'Heavy'] as const).map((key) => (
                  <Bar key={key} dataKey={key} fill={`url(#vgrad-${key})`} stackId="a" radius={key === 'Heavy' ? [6, 6, 0, 0] : undefined} />
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
            <LineChart data={chartData} margin={{ top: 4, right: 16, left: 16, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="display" tick={<VehicleTick />} interval={0}
                label={{ value: 'Vehicle Type', position: 'insideBottom', offset: -14, fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v: number) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)}
                label={{ value: 'Readings', angle: -90, position: 'insideLeft', offset: 10, fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip content={<VehicleTooltip />} />
              {(['Free', 'Moderate', 'Heavy'] as const).map((key) => (
                <Line key={key} type="monotone" dataKey={key} stroke={COLORS[key]} strokeWidth={2} dot={{ r: 5 }} />
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
          <ResponsiveContainer width="100%" height={CHART_H}>
            <PieChart>
              <Pie activeShape={renderActiveShape}
                data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                innerRadius={80} outerRadius={130}
                >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={VEHICLE_COLORS[entry.name] ?? '#6366f1'} />
                ))}
              </Pie>
              <Legend formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 13 }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </>
      )}

      {!loading && chartData.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${chartData.length}, 1fr)`, gap: 8, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          {chartData.map((d) => (
            <div key={d.name} style={{ textAlign: 'center', padding: '8px 4px', borderRadius: 8, background: 'var(--bg-primary)' }}>
              <div style={{ fontSize: 22 }}>{VEHICLE_EMOJI[d.name] ?? '🚙'}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2, textTransform: 'capitalize' }}>{d.name}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: VEHICLE_COLORS[d.name] ?? 'var(--accent)' }}>{d.percentage}%</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
