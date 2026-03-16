import React, { useState, useMemo } from 'react';
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
import { cn } from './lib/utils';

interface Player {
  id: string;
  name: string;
  age: number;
  position: string;
  team: string;
  image: string;
  percentiles: Record<string, number>;
  trends: { date: string; rating: number }[];
  advanced: Record<string, number | string>;
}

const MOCK_PLAYERS: Player[] = [
  {
    id: '1',
    name: 'Kylian Mbappé',
    age: 25,
    position: 'Forward',
    team: 'Real Madrid',
    image: 'https://picsum.photos/seed/mbappe/400/400',
    percentiles: {
      'Non-Penalty xG': 99,
      'xA (Expected Assists)': 88,
      'Progressive Carries': 98,
      'Successful Dribbles': 94,
      'Touches (Att Pen)': 99,
      'Progressive Passes': 72
    },
    trends: [
      { date: 'Sep', rating: 8.2 },
      { date: 'Oct', rating: 8.5 },
      { date: 'Nov', rating: 8.1 },
      { date: 'Dec', rating: 8.9 },
      { date: 'Jan', rating: 9.1 },
      { date: 'Feb', rating: 8.8 }
    ],
    advanced: {
      'Goals per 90': 0.88,
      'xG per 90': 0.82,
      'Shots per 90': 4.5,
      'Pass Completion': '82.4%',
      'SCA (Shot Creating Actions)': 5.4,
      'Pressures': 12.4
    }
  },
  {
    id: '2',
    name: 'Jude Bellingham',
    age: 20,
    position: 'Midfielder',
    team: 'Real Madrid',
    image: 'https://picsum.photos/seed/jude/400/400',
    percentiles: {
      'Non-Penalty xG': 92,
      'xA (Expected Assists)': 85,
      'Progressive Carries': 89,
      'Successful Dribbles': 82,
      'Touches (Att Pen)': 88,
      'Progressive Passes': 94
    },
    trends: [
      { date: 'Sep', rating: 8.8 },
      { date: 'Oct', rating: 9.2 },
      { date: 'Nov', rating: 8.9 },
      { date: 'Dec', rating: 8.7 },
      { date: 'Jan', rating: 8.5 },
      { date: 'Feb', rating: 8.9 }
    ],
    advanced: {
      'Goals per 90': 0.45,
      'xG per 90': 0.38,
      'Passes into Final 3rd': 6.2,
      'Pass Completion': '89.1%',
      'Tackles Won': 2.4,
      'Interceptions': 1.8
    }
  },
  {
    id: '3',
    name: 'Erling Haaland',
    age: 23,
    position: 'Forward',
    team: 'Manchester City',
    image: 'https://picsum.photos/seed/haaland/400/400',
    percentiles: {
      'Non-Penalty xG': 99,
      'xA (Expected Assists)': 45,
      'Progressive Carries': 62,
      'Successful Dribbles': 58,
      'Touches (Att Pen)': 98,
      'Progressive Passes': 32
    },
    trends: [
      { date: 'Sep', rating: 9.4 },
      { date: 'Oct', rating: 8.8 },
      { date: 'Nov', rating: 9.1 },
      { date: 'Dec', rating: 8.5 },
      { date: 'Jan', rating: 8.2 },
      { date: 'Feb', rating: 9.5 }
    ],
    advanced: {
      'Goals per 90': 1.12,
      'xG per 90': 1.05,
      'Shots on Target %': '58%',
      'Aerial Duels Won': '64%',
      'Touches in Box': 8.4,
      'Distance per 90': '10.2km'
    }
  },
  {
    id: '4',
    name: 'Virgil van Dijk',
    age: 32,
    position: 'Defender',
    team: 'Liverpool',
    image: 'https://picsum.photos/seed/virgil/400/400',
    percentiles: {
      'Aerials Won': 98,
      'Interceptions': 92,
      'Clearances': 88,
      'Progressive Passes': 94,
      'Pass Completion': 96,
      'Tackles Won': 85
    },
    trends: [
      { date: 'Sep', rating: 7.8 },
      { date: 'Oct', rating: 8.1 },
      { date: 'Nov', rating: 8.4 },
      { date: 'Dec', rating: 8.2 },
      { date: 'Jan', rating: 8.5 },
      { date: 'Feb', rating: 8.3 }
    ],
    advanced: {
      'Tackle Success %': '94%',
      'Aerial Duel %': '78%',
      'Long Passes per 90': 8.2,
      'Clean Sheets': 12,
      'Recoveries': 6.4,
      'Fouls Committed': 0.4
    }
  }
];

export default function App() {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [comparePlayer, setComparePlayer] = useState<Player | null>(null);
  const [report, setReport] = useState<ScoutingReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'advanced' | 'trends'>('overview');

  const handleSelectPlayer = async (player: Player) => {
    if (selectedPlayer && !comparePlayer && selectedPlayer.id !== player.id) {
      setComparePlayer(player);
      return;
    }
    
    setSelectedPlayer(player);
    setComparePlayer(null);
    setLoading(true);
    setReport(null);
    
    try {
      const scoutingReport = await generateScoutingReport({ ...player.percentiles, ...player.advanced });
      setReport(scoutingReport);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Live Data Feed
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search database..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-64"
              />
            </div>
            <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full"><Info className="w-5 h-5" /></button>
          </div>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
          {/* Player Selection Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {MOCK_PLAYERS.map(player => (
              <button
                key={player.id}
                onClick={() => handleSelectPlayer(player)}
                className={cn(
                  "p-4 rounded-2xl border transition-all flex items-center gap-4 text-left",
                  selectedPlayer?.id === player.id ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200" : 
                  comparePlayer?.id === player.id ? "bg-pink-600 border-pink-600 text-white shadow-lg shadow-pink-200" :
                  "bg-white border-slate-200 hover:border-indigo-300 text-slate-600"
                )}
              >
                <img src={player.image} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white/20" referrerPolicy="no-referrer" />
                <div>
                  <div className="font-bold text-sm leading-tight">{player.name}</div>
                  <div className="text-[10px] opacity-70 uppercase tracking-wider font-semibold">{player.position}</div>
                </div>
              </button>
            ))}
          </div>

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
                    <img src={selectedPlayer.image} alt="" className="w-24 h-24 rounded-3xl object-cover shadow-xl relative z-10" referrerPolicy="no-referrer" />
                    <div className="relative z-10">
                      <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">Primary Subject</div>
                      <h2 className="text-4xl font-display font-extrabold text-slate-900 leading-none mb-2">{selectedPlayer.name}</h2>
                      <div className="flex items-center gap-4 text-sm font-semibold text-slate-500">
                        <span>{selectedPlayer.team}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>{selectedPlayer.position}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>Age {selectedPlayer.age}</span>
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
                      <img src={comparePlayer.image} alt="" className="w-24 h-24 rounded-3xl object-cover shadow-xl relative z-10 border-2 border-pink-200" referrerPolicy="no-referrer" />
                      <div className="relative z-10">
                        <div className="text-xs font-bold text-pink-500 uppercase tracking-widest mb-1">Comparison Subject</div>
                        <h2 className="text-4xl font-display font-extrabold text-slate-900 leading-none mb-2">{comparePlayer.name}</h2>
                        <div className="flex items-center gap-4 text-sm font-semibold text-slate-500">
                          <span>{comparePlayer.team}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span>{comparePlayer.position}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span>Age {comparePlayer.age}</span>
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
                                    {comparePlayer.advanced[key] || '-'}
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
                    <div className="pro-card p-8 bg-slate-900 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full -mr-16 -mt-16 opacity-20 blur-3xl" />
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-display font-bold">AI Scouting Report</h3>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest">Neural Analysis Engine</p>
                        </div>
                      </div>

                      {loading ? (
                        <div className="space-y-4">
                          <div className="h-4 bg-slate-800 rounded w-full animate-pulse" />
                          <div className="h-4 bg-slate-800 rounded w-5/6 animate-pulse" />
                          <div className="h-4 bg-slate-800 rounded w-4/6 animate-pulse" />
                        </div>
                      ) : report ? (
                        <div className="space-y-6">
                          <p className="text-sm leading-relaxed text-slate-300 italic">
                            "{report.summary}"
                          </p>
                          <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                              <h4 className="text-[10px] font-bold text-indigo-400 uppercase mb-2">Potential Ceiling</h4>
                              <p className="text-sm font-bold">{report.potential}</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                              <h4 className="text-[10px] font-bold text-pink-400 uppercase mb-2">Tactical Fit</h4>
                              <p className="text-sm font-bold">{report.tacticalFit}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-12 text-center text-slate-500">
                          <Info className="w-8 h-8 mx-auto mb-2 opacity-20" />
                          <p className="text-xs">Select a player to generate intelligence report</p>
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
                              <span className="px-2 py-1 bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded-md">
                                {selectedPlayer.name.split(' ').pop()} (4)
                              </span>
                              <span className="px-2 py-1 bg-pink-100 text-pink-600 text-[10px] font-bold rounded-md">
                                {comparePlayer.name.split(' ').pop()} (2)
                              </span>
                            </div>
                          </div>
                          <div className="pt-4 border-t border-slate-100">
                            <p className="text-xs text-slate-500 leading-relaxed">
                              Comparing {selectedPlayer.name} and {comparePlayer.name} reveals a significant difference in 
                              <span className="font-bold text-slate-900"> {Object.keys(selectedPlayer.percentiles)[0]}</span>.
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
        </div>
      </main>
    </div>
  );
}
