import { useState, useEffect, useRef } from 'react';
import { CountryChart } from './components/CountryChart';
import { VehicleChart } from './components/VehicleChart';
import { useSummary } from './hooks/useSummary';
import type { DrillState } from './types';

const toDateInput = (iso: string) => iso.slice(0, 10);
const fromDateInput = (d: string) => new Date(d).toISOString();
const daysAgo = (days: number) => new Date(Date.now() - days * 86400000).toISOString();

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!value) return;
    const duration = 1200;
    const step = 16;
    const increment = value / (duration / step);
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(current));
    }, step);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display.toLocaleString()}</span>;
}

export default function App() {
  const [drill, setDrill] = useState<DrillState>({ level: 'country' });
  const [from, setFrom] = useState(daysAgo(30));
  const [to, setTo] = useState(new Date().toISOString());
  const [rangeMode, setRangeMode] = useState<'1' | '7' | '30' | 'custom'>('30');
  const [customFrom, setCustomFrom] = useState(toDateInput(daysAgo(7)));
  const [customTo, setCustomTo] = useState(toDateInput(new Date().toISOString()));
  const rangeRef = useRef(rangeMode);
  rangeRef.current = rangeMode;

  const applyPreset = (days: string) => {
    setRangeMode(days as '1' | '7' | '30' | 'custom');
    if (days !== 'custom') {
      setFrom(daysAgo(parseInt(days)));
      setTo(new Date().toISOString());
    }
  };

  const refresh = () => {
    if (rangeRef.current === 'custom') {
      setFrom(fromDateInput(customFrom));
      setTo(fromDateInput(customTo));
    } else {
      setFrom(daysAgo(parseInt(rangeRef.current)));
      setTo(new Date().toISOString());
    }
  };

  // Auto-refresh every 60s
  useEffect(() => {
    const id = setInterval(refresh, 60000);
    return () => clearInterval(id);
  }, []);

  const makeBreadcrumb = (d: DrillState, setD: (s: DrillState) => void) =>
    [
      { label: 'All Countries', onClick: () => setD({ level: 'country' }) },
      d.country ? { label: d.country, onClick: () => setD({ level: 'city', country: d.country }) } : null,
      d.city ? { label: d.city, onClick: () => {} } : null,
    ].filter(Boolean) as { label: string; onClick: () => void }[];

  const trafficCrumbs = makeBreadcrumb(drill, setDrill);
  const summary = useSummary(from, to);

  const Breadcrumb = ({ crumbs }: { crumbs: { label: string; onClick: () => void }[] }) =>
    crumbs.length > 1 ? (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        {crumbs.map((c, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {i > 0 && <span style={{ color: 'var(--text-secondary)' }}>›</span>}
            <span onClick={c.onClick} style={{ color: i === crumbs.length - 1 ? 'var(--text-primary)' : 'var(--accent)', cursor: 'pointer', fontSize: 14 }}>
              {c.label}
            </span>
          </span>
        ))}
      </div>
    ) : null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <header style={{ borderBottom: '1px solid var(--border)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>🚦</span>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Traffic Analytics</h1>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Global vehicle flow dashboard</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select value={rangeMode} onChange={(e) => applyPreset(e.target.value)}
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', fontSize: 13, cursor: 'pointer' }}>
            <option value="1">Last 24h</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="custom">Custom</option>
          </select>
          {rangeMode === 'custom' && (
            <>
              <input type="date" value={customFrom} onChange={(e) => { setCustomFrom(e.target.value); setFrom(fromDateInput(e.target.value)); }}
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', fontSize: 13 }} />
              <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>to</span>
              <input type="date" value={customTo} onChange={(e) => { setCustomTo(e.target.value); setTo(fromDateInput(e.target.value)); }}
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', fontSize: 13 }} />
            </>
          )}
          <button className="btn" onClick={refresh}>↻ Refresh</button>
        </div>
      </header>

      <main style={{ padding: '32px', maxWidth: 1600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16 }}>
          <KPICard label="Total Vehicles" numValue={summary?.total_vehicles} subtitle="All readings in range" icon="🚗" color="#6366f1" />
          <KPICard label="Countries Tracked" numValue={summary?.total_countries} subtitle="Unique countries in dataset" icon="🌍" color="#22d3ee" />
          <KPICard label="Road Segments" numValue={summary?.total_segments} subtitle="Active monitored segments" icon="🛣️" color="#a78bfa" />
          <KPICard label="Top Country" value={summary?.top_country ?? '—'} subtitle="Highest vehicle volume" icon="🏆" color="#f59e0b" />
          <KPICard label="Most Congesting Vehicle" value={summary ? `${summary.dominant_type.charAt(0).toUpperCase() + summary.dominant_type.slice(1)} ${summary.dominant_type_pct}%` : '—'} subtitle="Vehicle causing most heavy traffic" icon="🚦" color="#22c55e" />
          <KPICard label="Most Congested" value={summary ? `${summary.most_congested} ${summary.most_congested_pct}%` : '—'} subtitle="Highest heavy-traffic rate" icon="🔴" color="#ef4444" />
        </div>

        <div>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, fontWeight: 600 }}>Traffic Distribution</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'stretch' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ minHeight: 28 }}>
                <Breadcrumb crumbs={trafficCrumbs} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <CountryChart drill={drill} onDrill={setDrill} from={from} to={to} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ minHeight: 28 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <VehicleChart from={from} to={to} drill={drill} />
              </div>
            </div>
          </div>
        </div>

        <footer style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 12 }}>
          Traffic Analytics Dashboard · Auto-refresh every 60s
        </footer>
      </main>
    </div>
  );
}

function KPICard({ label, value, numValue, subtitle, icon, color }: {
  label: string; value?: string; numValue?: number; subtitle: string; icon: string; color: string;
}) {
  return (
    <div className="card" style={{ borderTop: `3px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 22 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
        {numValue !== undefined ? <AnimatedNumber value={numValue} /> : (value ?? '—')}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>{subtitle}</div>
    </div>
  );
}
