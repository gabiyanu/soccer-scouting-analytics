import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  User,
  TrendingUp,
  Shield,
  Zap,
  Target,
  ChevronRight,
  Loader2,
  AlertCircle,
  BarChart3,
  Star,
  Activity,
  Trophy,
  ArrowRight,
  GitCompare,
  LayoutDashboard,
  PieChart,
  History,
  Info
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { generateScoutingReport, ScoutingReport } from './services/gemini';
import { fetchPlayers, Player } from './services/players';
import { cn } from './lib/utils';

export default function App() {
  // ── Player data from BigQuery ──────────────────────────────────────────────
  const [players, setPlayers] = useState<Player[]>([]);
  const [playersLoading, setPlayersLoading] = useState(true);
  const [playersError, setPlayersError] = useState<string | null>(null);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [comparePlayer, setComparePlayer] = useState<Player | null>(null);
  const [report, setReport] = useState<ScoutingReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'advanced' | 'trends'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // ── Load players from BigQuery on mount ───────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function loadPlayers() {
      setPlayersLoading(true);
      setPlayersError(null);
      try {
        const data = await fetchPlayers({ limit: 50 });
        if (!cancelled) setPlayers(data);
      } catch (err: any) {
        if (!cancelled) setPlayersError(err.message || 'Failed to load players');
      } finally {
        if (!cancelled) setPlayersLoading(false);
      }
    }

    loadPlayers();
    return () => { cancelled = true; };
  }, []);

  // ── Client-side search filter ──────────────────────────────────────────────
  const filteredPlayers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return players;
    return players.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.team.toLowerCase().includes(q) ||
        p.position.toLowerCase().includes(q)
    );
  }, [players, searchQuery]);

  // ── Player selection / comparison ──────────────────────────────────────────
  const runReport = useCallback(async (primary: Player, compare?: Player) => {
    setLoading(true);
    setReport(null);
    setReportError(null);
    try {
      const scoutingReport = await generateScoutingReport(
        { name: primary.name, data: { ...primary.percentiles, ...primary.advanced } },
        compare ? { name: compare.name, data: { ...compare.percentiles, ...compare.advanced } } : undefined
      );
      setReport(scoutingReport);
    } catch (err: any) {
      console.error('Gemini error:', err);
      setReportError(err.message || 'Failed to generate scouting report.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectPlayer = useCallback(async (player: Player) => {
    // Second click → set as comparison and re-run report with both players
    if (selectedPlayer && !comparePlayer && selectedPlayer.id !== player.id) {
      setComparePlayer(player);
      runReport(selectedPlayer, player);
      return;
    }

    // First click → select as primary
    setSelectedPlayer(player);
    setComparePlayer(null);
    runReport(player);
  }, [selectedPlayer, comparePlayer, runReport]);

  // ── Chart data ─────────────────────────────────────────────────────────────
  const radarData = useMemo(() => {
    if (!selectedPlayer) return [];
    const metrics = Object.keys(selectedPlayer.percentiles);
    return metrics.map(metric => ({
      subject: metric,
      A: selectedPlayer.percentiles[metric],
      B: comparePlayer ? comparePlayer.percentiles[metric] || 0 : 0,
      fullMark: 100,
    }));
  }, [selectedPlayer, comparePlayer]);

  const barData = useMemo(() => {
    if (!selectedPlayer) return [];
    return Object.entries(selectedPlayer.percentiles).map(([name, value]) => ({
      name,
      value,
      compare: comparePlayer ? comparePlayer.percentiles[name] || 0 : 0
    }));
  }, [selectedPlayer, comparePlayer]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f8fafc] analytics-grid">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full w-20 bg-white border-r border-slate-200 flex flex-col items-center py-8 gap-8 z-50">
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
          <Target className="text-white w-6 h-6" />
        </div>
        <nav className="flex flex-col gap-6">
          <button className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><LayoutDashboard className="w-6 h-6" /></button>
          <button className="p-3 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors"><PieChart className="w-6 h-6" /></button>
          <button className="p-3 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors"><History className="w-6 h-6" /></button>
          <button className="p-3 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors"><GitCompare className="w-6 h-6" /></button>
        </nav>
      </aside>

      <main className="pl-20">
        {/* Top Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-display font-bold text-slate-900">Performance Analytics</h1>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className={cn(
                "w-2 h-2 rounded-full",
                playersLoading ? "bg-amber-400 animate-pulse" :
                playersError ? "bg-red-400" :
                "bg-emerald-500"
              )} />
              {playersLoading ? 'Connecting to BigQuery…' :
               playersError ? 'BigQuery error' :
               `Live Data Feed · ${players.length} players`}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search players, clubs…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-64"
              />
            </div>
            <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><Info className="w-5 h-5" /></button>
          </div>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto space-y-8">

          {/* ── Players loading / error states ── */}
          {playersLoading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-400">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
              <p className="text-sm font-medium">Querying BigQuery…</p>
              <p className="text-xs opacity-60">player-profiles-analyzer · Player_Analyzer.Player_profiles</p>
            </div>
          )}

          {playersError && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <AlertCircle className="w-10 h-10 text-red-400" />
              <p className="text-sm font-semibold text-red-600">Failed to load players from BigQuery</p>
              <p className="text-xs text-slate-400 max-w-md text-center">{playersError}</p>
              <p className="text-xs text-slate-400">Make sure your service account credentials are configured and the API server is running.</p>
            </div>
          )}

          {/* ── Player Selection Grid ── */}
          {!playersLoading && !playersError && (
            <>
              {/* Step-by-step guidance banner */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className={cn(
                  "flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-sm font-semibold transition-all",
                  !selectedPlayer
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200"
                    : "bg-white border-slate-200 text-slate-400 line-through"
                )}>
                  <span className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0",
                    !selectedPlayer ? "bg-white text-indigo-600" : "bg-slate-100 text-slate-400"
                  )}>1</span>
                  Click a player to analyse
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />

                <div className={cn(
                  "flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border text-sm font-semibold transition-all",
                  selectedPlayer && !comparePlayer
                    ? "bg-pink-500 border-pink-500 text-white shadow-md shadow-pink-200 animate-pulse"
                    : comparePlayer
                    ? "bg-white border-slate-200 text-slate-400 line-through"
                    : "bg-white border-slate-200 text-slate-400"
                )}>
                  <span className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0",
                    selectedPlayer && !comparePlayer ? "bg-white text-pink-500" : "bg-slate-100 text-slate-400"
                  )}>2</span>
                  Click another player to compare
                </div>

                {comparePlayer && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm font-semibold text-emerald-700"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    Comparing {selectedPlayer?.name.split(' ').pop()} vs {comparePlayer.name.split(' ').pop()}
                  </motion.div>
                )}
              </div>

              {filteredPlayers.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  No players match "{searchQuery}"
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {filteredPlayers.map(player => (
                    <button
                      key={player.id}
                      onClick={() => handleSelectPlayer(player)}
                      className={cn(
                        "p-3 rounded-2xl border transition-all flex items-center gap-3 text-left",
                        selectedPlayer?.id === player.id
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200"
                          : comparePlayer?.id === player.id
                          ? "bg-pink-600 border-pink-600 text-white shadow-lg shadow-pink-200"
                          : "bg-white border-slate-200 hover:border-indigo-300 text-slate-600"
                      )}
                    >
                      {/* Player photo with club crest overlay */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={player.image}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover border-2 border-white/20"
                          referrerPolicy="no-referrer"
                          onError={e => {
                            (e.target as HTMLImageElement).src =
                              `https://picsum.photos/seed/${encodeURIComponent(player.name)}/400/400`;
                          }}
                        />
                        {player.clubLogo && (
                          <img
                            src={player.clubLogo}
                            alt=""
                            className="absolute -bottom-1 -right-1 w-4 h-4 object-contain rounded-sm bg-white p-px shadow"
                            referrerPolicy="no-referrer"
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs leading-tight truncate">{player.name}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {player.flag && (
                            <img
                              src={player.flag}
                              alt=""
                              className="w-3 h-2.5 object-cover rounded-sm flex-shrink-0"
                              referrerPolicy="no-referrer"
                              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          )}
                          <div className="text-[9px] opacity-70 uppercase tracking-wider font-semibold truncate">{player.position}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <AnimatePresence mode="wait">
                {selectedPlayer && (
                  <motion.div
                    key={selectedPlayer.id + (comparePlayer?.id || '')}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    {/* Comparison Header */}
                    <div className="flex flex-col md:flex-row gap-8 items-stretch">
                      <div className="flex-1 pro-card p-8 flex items-center gap-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50" />
                        <img
                          src={selectedPlayer.image}
                          alt=""
                          className="w-24 h-24 rounded-3xl object-cover shadow-xl relative z-10"
                          referrerPolicy="no-referrer"
                          onError={e => {
                            (e.target as HTMLImageElement).src =
                              `https://picsum.photos/seed/${encodeURIComponent(selectedPlayer.name)}/400/400`;
                          }}
                        />
                        <div className="relative z-10">
                          <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">Primary Subject</div>
                          <h2 className="text-4xl font-display font-extrabold text-slate-900 leading-none mb-2">{selectedPlayer.name}</h2>
                          <div className="flex items-center gap-3 text-sm font-semibold text-slate-500 flex-wrap">
                            {/* Club crest + name */}
                            {selectedPlayer.clubLogo && (
                              <img
                                src={selectedPlayer.clubLogo}
                                alt=""
                                className="w-5 h-5 object-contain"
                                referrerPolicy="no-referrer"
                                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            )}
                            <span>{selectedPlayer.team}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span>{selectedPlayer.position}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span>Age {selectedPlayer.age}</span>
                            {/* Nationality flag + name */}
                            {selectedPlayer.flag && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <img
                                  src={selectedPlayer.flag}
                                  alt=""
                                  className="w-5 h-3.5 object-cover rounded-sm shadow-sm"
                                  referrerPolicy="no-referrer"
                                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                                <span>{selectedPlayer.nationality}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {comparePlayer && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex-1 pro-card p-8 flex items-center gap-8 border-pink-100 bg-pink-50/10 relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full -mr-16 -mt-16 opacity-50" />
                          <img
                            src={comparePlayer.image}
                            alt=""
                            className="w-24 h-24 rounded-3xl object-cover shadow-xl relative z-10 border-2 border-pink-200"
                            referrerPolicy="no-referrer"
                            onError={e => {
                              (e.target as HTMLImageElement).src =
                                `https://picsum.photos/seed/${encodeURIComponent(comparePlayer.name)}/400/400`;
                            }}
                          />
                          <div className="relative z-10">
                            <div className="text-xs font-bold text-pink-500 uppercase tracking-widest mb-1">Comparison Subject</div>
                            <h2 className="text-4xl font-display font-extrabold text-slate-900 leading-none mb-2">{comparePlayer.name}</h2>
                            <div className="flex items-center gap-3 text-sm font-semibold text-slate-500 flex-wrap">
                              {/* Club crest + name */}
                              {comparePlayer.clubLogo && (
                                <img
                                  src={comparePlayer.clubLogo}
                                  alt=""
                                  className="w-5 h-5 object-contain"
                                  referrerPolicy="no-referrer"
                                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                              )}
                              <span>{comparePlayer.team}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <span>{comparePlayer.position}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <span>Age {comparePlayer.age}</span>
                              {/* Nationality flag + name */}
                              {comparePlayer.flag && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                                  <img
                                    src={comparePlayer.flag}
                                    alt=""
                                    className="w-5 h-3.5 object-cover rounded-sm shadow-sm"
                                    referrerPolicy="no-referrer"
                                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                  />
                                  <span>{comparePlayer.nationality}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Main Analytics Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Left: Visualizations */}
                      <div className="lg:col-span-8 space-y-8">
                        <div className="pro-card p-8">
                          <div className="flex items-center justify-between mb-8">
                            <div className="flex gap-6">
                              <button
                                onClick={() => setActiveTab('overview')}
                                className={cn("text-sm font-bold pb-2 transition-all", activeTab === 'overview' ? "tab-active" : "text-slate-400")}
                              >
                                Percentile Overview
                              </button>
                              <button
                                onClick={() => setActiveTab('trends')}
                                className={cn("text-sm font-bold pb-2 transition-all", activeTab === 'trends' ? "tab-active" : "text-slate-400")}
                              >
                                Form Trends
                              </button>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 text-[10px] font-bold uppercase">
                                <span className="w-2 h-2 rounded-full bg-indigo-600" /> {selectedPlayer.name}
                              </div>
                              {comparePlayer && (
                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase">
                                  <span className="w-2 h-2 rounded-full bg-pink-600" /> {comparePlayer.name}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              {activeTab === 'overview' ? (
                                <BarChart data={barData} layout="vertical" margin={{ left: 120 }}>
                                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                  <XAxis type="number" domain={[0, 100]} hide />
                                  <YAxis
                                    dataKey="name"
                                    type="category"
                                    tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }}
                                    width={120}
                                  />
                                  <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: '#f8fafc' }}
                                  />
                                  <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                                  {comparePlayer && <Bar dataKey="compare" fill="#ec4899" radius={[0, 4, 4, 0]} barSize={20} />}
                                </BarChart>
                              ) : (
                                <LineChart data={selectedPlayer.trends}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                  <XAxis dataKey="date" tick={{ fontSize: 12, fontWeight: 600 }} />
                                  <YAxis domain={[0, 10]} tick={{ fontSize: 12, fontWeight: 600 }} />
                                  <Tooltip />
                                  <Line type="monotone" dataKey="rating" stroke="#6366f1" strokeWidth={3} dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} />
                                  {comparePlayer && (
                                    <Line type="monotone" data={comparePlayer.trends} dataKey="rating" stroke="#ec4899" strokeWidth={3} dot={{ r: 6, fill: '#ec4899', strokeWidth: 2, stroke: '#fff' }} />
                                  )}
                                </LineChart>
                              )}
                            </ResponsiveContainer>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="pro-card p-8">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Tactical Radar</h3>
                            <div className="h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                  <PolarGrid stroke="#f1f5f9" />
                                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
                                  <Radar dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} />
                                  {comparePlayer && <Radar dataKey="B" stroke="#ec4899" fill="#ec4899" fillOpacity={0.1} />}
                                </RadarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          <div className="pro-card p-8">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Advanced Metrics</h3>
                            <div className="space-y-4">
                              {Object.entries(selectedPlayer.advanced).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                  <span className="text-xs font-semibold text-slate-500">{key}</span>
                                  <div className="flex items-center gap-4">
                                    <span className="stat-value font-bold text-slate-900">{value}</span>
                                    {comparePlayer && (
                                      <span className="stat-value font-bold text-pink-600 border-l border-slate-200 pl-4">
                                        {comparePlayer.advanced[key] ?? '-'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: AI Intelligence */}
                      <div className="lg:col-span-4 space-y-8">
                        <div className="pro-card p-8 bg-white relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full -mr-16 -mt-16 blur-3xl" />
                          <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
                              <Zap className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-display font-bold text-slate-900">AI Scouting Report</h3>
                              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Neural Analysis Engine</p>
                            </div>
                          </div>

                          {loading ? (
                            <div className="space-y-3">
                              <div className="h-3 bg-slate-100 rounded w-full animate-pulse" />
                              <div className="h-3 bg-slate-100 rounded w-5/6 animate-pulse" />
                              <div className="h-3 bg-slate-100 rounded w-4/6 animate-pulse" />
                              <div className="h-3 bg-slate-100 rounded w-full animate-pulse mt-4" />
                              <div className="h-3 bg-slate-100 rounded w-3/4 animate-pulse" />
                            </div>
                          ) : reportError ? (
                            <div className="space-y-4">
                              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl border border-red-200">
                                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-xs font-bold text-red-600 mb-1">Report generation failed</p>
                                  <p className="text-xs text-slate-600 leading-relaxed">{reportError}</p>
                                </div>
                              </div>
                              <p className="text-[10px] text-slate-400 text-center">
                                Check that <span className="font-mono text-slate-500">GEMINI_API_KEY</span> is set on the server
                              </p>
                            </div>
                          ) : report ? (
                            <div className="space-y-4 overflow-y-auto max-h-[600px] pr-1">

                              {/* Summary */}
                              <p className="text-sm leading-relaxed text-slate-700 italic border-b border-slate-100 pb-4">
                                "{report.summary}"
                              </p>

                              {/* Head-to-Head Verdict */}
                              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                                <h4 className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">
                                  {comparePlayer ? '⚡ Head-to-Head Verdict' : '⚡ Scout Verdict'}
                                </h4>
                                <p className="text-xs text-slate-700 leading-relaxed">{report.comparisonVerdict}</p>
                                <div className="pt-1 border-t border-amber-200">
                                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Key differentiator · </span>
                                  <span className="text-[10px] font-bold text-slate-900">{report.keyDifference}</span>
                                </div>
                              </div>

                              {/* Potential Ceiling */}
                              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200 space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest">Potential Ceiling</h4>
                                  <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full border border-indigo-300">
                                    {report.potentialRating}
                                  </span>
                                </div>
                                <p className="text-[10px] text-indigo-600 font-semibold">{report.potentialTimeline}</p>
                                <p className="text-xs text-slate-700 leading-relaxed">{report.potentialDescription}</p>
                              </div>

                              {/* Tactical Fit */}
                              <div className="p-4 bg-pink-50 rounded-2xl border border-pink-200 space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-[10px] font-bold text-pink-700 uppercase tracking-widest">Tactical Fit</h4>
                                  <span className="text-[10px] font-bold px-2 py-0.5 bg-pink-100 text-pink-700 rounded-full border border-pink-300">
                                    {report.idealRole}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {report.bestFormations.map(f => (
                                    <span key={f} className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                                      {f}
                                    </span>
                                  ))}
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed">{report.tacticalDescription}</p>
                              </div>

                              {/* Strengths & Weaknesses */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                                  <h4 className="text-[9px] font-bold text-emerald-700 uppercase mb-2">Strengths</h4>
                                  <ul className="space-y-1">
                                    {report.strengths.slice(0, 3).map((s, i) => (
                                      <li key={i} className="text-[10px] text-slate-700 flex items-start gap-1">
                                        <span className="text-emerald-600 mt-0.5 font-bold">+</span> {s}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                                  <h4 className="text-[9px] font-bold text-red-700 uppercase mb-2">Weaknesses</h4>
                                  <ul className="space-y-1">
                                    {report.weaknesses.slice(0, 3).map((w, i) => (
                                      <li key={i} className="text-[10px] text-slate-700 flex items-start gap-1">
                                        <span className="text-red-600 mt-0.5 font-bold">−</span> {w}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                            </div>
                          ) : (
                            <div className="py-12 text-center text-slate-400">
                              <Info className="w-8 h-8 mx-auto mb-2 opacity-30" />
                              <p className="text-xs text-slate-500">Select a player to generate intelligence report</p>
                              <p className="text-[10px] mt-1 text-slate-400">Select two players for a head-to-head comparison</p>
                            </div>
                          )}
                        </div>

                        <div className="pro-card p-8">
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Comparison Insights</h3>
                          {comparePlayer ? (
                            <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">Age Gap</span>
                                <span className="text-sm font-bold">{Math.abs(selectedPlayer.age - comparePlayer.age)} Years</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">Metric Dominance</span>
                                <div className="flex gap-2">
                                  {(() => {
                                    const metrics = Object.keys(selectedPlayer.percentiles);
                                    const primaryWins = metrics.filter(
                                      m => (selectedPlayer.percentiles[m] || 0) >= (comparePlayer.percentiles[m] || 0)
                                    ).length;
                                    return (
                                      <>
                                        <span className="px-2 py-1 bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded-md">
                                          {selectedPlayer.name.split(' ').pop()} ({primaryWins})
                                        </span>
                                        <span className="px-2 py-1 bg-pink-100 text-pink-600 text-[10px] font-bold rounded-md">
                                          {comparePlayer.name.split(' ').pop()} ({metrics.length - primaryWins})
                                        </span>
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                              <div className="pt-4 border-t border-slate-100">
                                <p className="text-xs text-slate-500 leading-relaxed">
                                  Comparing {selectedPlayer.name} and {comparePlayer.name} reveals a notable difference in{' '}
                                  <span className="font-bold text-slate-900">
                                    {Object.keys(selectedPlayer.percentiles)[0]}
                                  </span>.
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <GitCompare className="w-12 h-12 mx-auto mb-4 text-slate-100" />
                              <p className="text-xs text-slate-400">Select another player to enable side-by-side comparison</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
