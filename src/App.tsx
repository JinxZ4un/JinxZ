/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, ReactNode, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dumbbell, 
  ChevronRight, 
  Utensils, 
  Calendar, 
  Info, 
  CheckCircle2, 
  Clock, 
  Flame,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Sparkles,
  Send,
  Loader2,
  RefreshCw,
  Plus,
  HelpCircle,
  Award,
  Apple,
  Search,
  X
} from 'lucide-react';
import { EXERCISES, ROUTINE, NUTRITION_ITEMS } from './constants';
import { Exercise, DayRoutine, NutritionItem } from './types';

// Simple types for conversation history
interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'routine' | 'exercises' | 'nutrition' | 'coach'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  
  // App states initialized with defaults, fully dynamic
  const [appExercises, setAppExercises] = useState<Record<string, Exercise>>(EXERCISES);
  const [appRoutine, setAppRoutine] = useState<DayRoutine[]>(ROUTINE);
  const [appNutrition, setAppNutrition] = useState<NutritionItem[]>(NUTRITION_ITEMS);
  
  const [today, setToday] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }));

  // Chat interface states
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: 'Greetings, Athlete. I am **STRIVE AI**, your elite fitness and performance strategist. How shall we optimize your biomechanics or nutritional focus today?',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Custom routine generator wizard states
  const [goals, setGoals] = useState('Hypertrophy & Strength');
  const [experience, setExperience] = useState('Intermediate');
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [equipment, setEquipment] = useState('Full Gym / Dumbbells');
  const [focusMuscles, setFocusMuscles] = useState('Full Body');
  const [generatingRoutine, setGeneratingRoutine] = useState(false);
  const [generatorError, setGeneratorError] = useState<string | null>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatLoading]);

  // Current day routine focus
  const currentDayRoutine = appRoutine.find(r => r.day === today) || appRoutine[0];

  // Send message to AI Coach
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || chatLoading) return;

    const userMessage: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: chatMessages.map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      if (!response.ok) {
        throw new Error('Our optimization frequency is currently saturated. Please check your developer secrets.');
      }

      const data = await response.json();
      const aiMessage: Message = {
        id: Math.random().toString(),
        sender: 'ai',
        text: data.text,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      setChatMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'ai',
        text: `**System Notice:** Could not connect to the STRIVE neural framework. Verify that your **GEMINI_API_KEY** is active in **Settings > Secrets**.`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Generate dynamic schedule from AI
  const handleGenerateCustomRoutine = async () => {
    setGeneratingRoutine(true);
    setGeneratorError(null);

    try {
      const response = await fetch('/api/generate-routine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goals,
          experience,
          daysPerWeek,
          equipment,
          focusMuscles
        })
      });

      if (!response.ok) {
        throw new Error('Internal scheduler failed. Please check the terminal logs or secrets configuration.');
      }

      const data = await response.json();

      // Update local states
      const newExercises: Record<string, Exercise> = {};
      data.exercises.forEach((item: Exercise) => {
        newExercises[item.id] = item;
      });

      setAppExercises(newExercises);
      setAppRoutine(data.routine);
      setAppNutrition(data.nutrition);

      // Flash feedback
      setChatMessages(prev => [...prev, {
        id: Math.random().toString(),
        sender: 'ai',
        text: `⚡ **Protocol Forged Successfully!** I have completely redesigned your active **Schedule**, **Movement Library**, and **Fuel Intake** programs to focus on your **${goals}** objective. Explore the tabs to view your customized mechanics.`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      }]);

      setActiveTab('routine');
    } catch (e: any) {
      setGeneratorError(e.message || 'Verification failed. Could not parse AI payload.');
    } finally {
      setGeneratingRoutine(false);
    }
  };

  // Filter search results of exercises, nutrition items, and daily routines
  const searchQueryLower = searchQuery.toLowerCase().trim();
  const matchedExercises: Exercise[] = searchQueryLower
    ? (Object.values(appExercises) as Exercise[]).filter(
        (item: Exercise) =>
          item.name.toLowerCase().includes(searchQueryLower) ||
          item.target.toLowerCase().includes(searchQueryLower) ||
          item.description.toLowerCase().includes(searchQueryLower)
      )
    : [];

  const matchedNutrition: NutritionItem[] = searchQueryLower
    ? appNutrition.filter(
        (item: NutritionItem) =>
          item.name.toLowerCase().includes(searchQueryLower) ||
          item.benefit.toLowerCase().includes(searchQueryLower) ||
          item.category.toLowerCase().includes(searchQueryLower)
      )
    : [];

  const matchedRoutine: DayRoutine[] = searchQueryLower
    ? appRoutine.filter(
        (item: DayRoutine) =>
          item.day.toLowerCase().includes(searchQueryLower) ||
          item.title.toLowerCase().includes(searchQueryLower) ||
          item.nutritionalFocus.toLowerCase().includes(searchQueryLower) ||
          item.exercises.some(id => {
            const exName = appExercises[id]?.name || id;
            return exName.toLowerCase().includes(searchQueryLower);
          })
      )
    : [];

  const totalMatches = matchedExercises.length + matchedNutrition.length + matchedRoutine.length;

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:pl-24 lg:pl-64 flex flex-col font-sans selection:bg-[#2DD4BF] selection:text-black bg-[#050505]">
      {/* Sidebar - Navigation */}
      <nav className="fixed bottom-0 left-0 w-full md:w-24 lg:w-64 md:h-screen bg-[#050505] border-t md:border-t-0 md:border-r border-white/10 z-50 flex md:flex-col justify-around md:justify-start p-2 md:p-6 gap-2">
        <div className="hidden md:flex items-center gap-3 mb-10 px-2 pt-4">
          <div className="w-10 h-10 bg-[#2DD4BF] rounded-full flex items-center justify-center shadow-lg shadow-[#2DD4BF]/20">
            <span className="text-black font-bold text-xl tracking-tighter italic">S</span>
          </div>
          <span className="hidden lg:block text-2xl font-serif italic tracking-tight">STRIVE <span className="accent-teal text-xs not-italic font-sans uppercase tracking-[0.3em] font-light">Coach</span></span>
        </div>

        <NavItem 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
          icon={<TrendingUp size={20} />} 
          label="Dashboard" 
        />
        <NavItem 
          active={activeTab === 'routine'} 
          onClick={() => setActiveTab('routine')} 
          icon={<Calendar size={20} />} 
          label="Schedule" 
        />
        <NavItem 
          active={activeTab === 'exercises'} 
          onClick={() => setActiveTab('exercises')} 
          icon={<Dumbbell size={20} />} 
          label="Library" 
        />
        <NavItem 
          active={activeTab === 'nutrition'} 
          onClick={() => setActiveTab('nutrition')} 
          icon={<Utensils size={20} />} 
          label="Fuel" 
        />
        <NavItem 
          active={activeTab === 'coach'} 
          onClick={() => setActiveTab('coach')} 
          icon={<Sparkles size={20} />} 
          label="AI Coach" 
        />

        <div className="hidden lg:block mt-auto p-4 border border-[#2DD4BF]/25 rounded-2xl bg-[#2DD4BF]/5">
          <div className="flex items-center gap-2 mb-2">
            <BrainCircuit size={16} className="accent-teal" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] accent-teal">Active Protocol</span>
          </div>
          <p className="text-[11px] text-white/40 leading-relaxed font-medium">
            AI personalizer updated. Click the <strong>AI Coach</strong> tab to design your custom weekly plan.
          </p>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-6 md:p-12 mb-10">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div className="flex-1">
            <h2 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.4em] mb-3">
              Performance Framework / {today}
            </h2>
            <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
              <h1 className="text-5xl md:text-7xl font-serif italic tracking-tight shrink-0">
                {activeTab === 'dashboard' && "The Dashboard"}
                {activeTab === 'routine' && "Your Routine"}
                {activeTab === 'exercises' && "The Library"}
                {activeTab === 'nutrition' && "Fuel Intake"}
                {activeTab === 'coach' && "STRIVE Assistant"}
              </h1>
              
              {/* Premium Integrated Search Bar */}
              <div className="relative w-full max-w-md lg:ml-6">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-white/30">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari latihan, nutrisi, jadwal harian, atau tanya AI..."
                  className="w-full bg-zinc-950/60 border border-white/10 rounded-full py-3.5 pl-11 pr-10 text-sm text-neutral-200 outline-none focus:border-[#2DD4BF] focus:bg-zinc-900 placeholder:text-white/20 transition-all font-sans"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-white/40 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-right justify-end shrink-0">
            <div className="hidden sm:block">
              <p className="text-[10px] uppercase text-white/40 tracking-tighter">Current Status</p>
              <p className="text-sm font-mono tracking-wider accent-teal font-bold uppercase block shadow-[0_0_10px_rgba(45,212,191,0.15)] bg-[#2DD4BF]/5 px-2 py-0.5 rounded border border-[#2DD4BF]/10">Ready <span className="text-white/20">•</span> Smart</p>
            </div>
            <div className="h-8 w-[1px] bg-white/10 hidden sm:block"></div>
            <div className="glass px-5 py-3 rounded-2xl border-white/5 font-mono text-xs">
              <span className="accent-teal">{new Date().toDateString().toUpperCase()}</span>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {searchQuery ? (
            <motion.div
              key="search-results"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-12 pb-24"
            >
              {/* Search Meta Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950/40 border border-white/5 p-6 rounded-[2rem] backdrop-blur-md">
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#2DD4BF] mb-1">Hasil Pencarian</h3>
                  <p className="text-white/40 text-xs">
                    Menampilkan <span className="text-white font-mono font-bold">{totalMatches}</span> kecocokan untuk <span className="text-[#2DD4BF] italic font-semibold">"{searchQuery}"</span>
                  </p>
                </div>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="self-start sm:self-auto px-5 py-2.5 border border-white/10 rounded-full hover:border-[#2DD4BF] text-xs text-white/60 hover:text-[#2DD4BF] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <X size={14} /> Bersihkan Pencarian
                </button>
              </div>

              {/* AI integration action card */}
              <div className="relative overflow-hidden bg-[#2DD4BF]/5 border border-[#2DD4BF]/20 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#2DD4BF]/5 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 bg-[#2DD4BF]/10 rounded-2xl flex items-center justify-center border border-[#2DD4BF]/20 shrink-0">
                    <Sparkles size={20} className="text-[#2DD4BF]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-serif italic text-white flex items-center gap-2">Asisten STRIVE Coach AI</h4>
                    <p className="text-xs text-white/50">Cari tahu biomekanik optimal, variasi gerakan, atau rencana diet kustom untuk: "{searchQuery}"</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setActiveTab('coach');
                    handleSendMessage(`Berikan saya saran kustom untuk latihan, biomekanik, atau diet terkait kata kunci ini: "${searchQuery}"`);
                  }}
                  className="relative z-10 flex items-center gap-2 bg-[#2DD4BF] text-black px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-white transition-colors cursor-pointer shrink-0"
                >
                  Tanya Coach AI <ArrowRight size={14} />
                </button>
              </div>

              {totalMatches === 0 ? (
                <div className="text-center py-20 border border-white/5 rounded-[3rem] bg-zinc-950/20">
                  <HelpCircle size={48} className="mx-auto text-white/20 mb-4 animate-bounce" />
                  <h3 className="text-2xl font-serif italic mb-2 text-white/75">Tidak Ada Hasil Ditemukan</h3>
                  <p className="text-white/40 text-xs max-w-md mx-auto leading-relaxed px-4">
                    Kami tidak menemukan latihan, nutrisi, atau rencana jadwal harian yang cocok dengan kata kunci Anda. Silakan coba kata kunci lain atau gunakan tombol AI di atas!
                  </p>
                </div>
              ) : (
                <div className="space-y-12">
                  {/* Exercises Section */}
                  {matchedExercises.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-6 px-2 border-b border-white/5 pb-3">
                        <Dumbbell size={18} className="text-[#2DD4BF]" />
                        <h4 className="text-xs uppercase tracking-[0.3em] font-mono font-bold text-white/60">Latihan & Gerakan ({matchedExercises.length})</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {matchedExercises.map((exercise) => (
                          <motion.div
                            key={`search-ex-${exercise.id}`}
                            onClick={() => setSelectedExercise(exercise)}
                            className="group relative overflow-hidden bg-white/[0.02] border border-white/5 rounded-[3rem] cursor-pointer hover:border-[#2DD4BF]/40 transition-all p-3"
                          >
                            <div className="p-8">
                              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-bold uppercase text-[#2DD4BF] tracking-wider mb-4 inline-block">
                                {exercise.target}
                              </span>
                              <h4 className="text-2xl font-serif italic mb-3 tracking-tight group-hover:text-[#2DD4BF] transition-colors">{exercise.name}</h4>
                              <p className="text-white/40 text-xs line-clamp-2 leading-relaxed mb-6 italic">"{exercise.description}"</p>
                              <div className="flex items-center justify-between text-white/30 border-t border-white/5 pt-4">
                                <span className="text-[10px] font-bold uppercase tracking-[0.1em]">{exercise.sets} Sets × {exercise.reps}</span>
                                <span className="text-[10px] font-mono accent-teal">Lihat Detail &rarr;</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Schedule / Routine Days Section */}
                  {matchedRoutine.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-6 px-2 border-b border-white/5 pb-3">
                        <Calendar size={18} className="text-[#2DD4BF]" />
                        <h4 className="text-xs uppercase tracking-[0.3em] font-mono font-bold text-white/60">Seni & Jadwal Harian ({matchedRoutine.length})</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {matchedRoutine.map((day, idx) => (
                          <div 
                            key={`search-rot-${day.day}`}
                            className="relative overflow-hidden bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 flex flex-col justify-between gap-6 hover:bg-white/[0.04] transition-all group"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] text-[#2DD4BF] font-mono uppercase tracking-[0.2em]">{day.day} Focus</span>
                                <span className="text-white/20 font-serif italic text-lg">0{idx+1}</span>
                              </div>
                              <h4 className="text-2xl font-serif italic tracking-tight text-white mb-2">{day.title}</h4>
                              <p className="text-white/45 text-xs">Nutrisi Pendukung: <span className="text-[#2DD4BF] font-semibold">{day.nutritionalFocus}</span></p>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {day.exercises.map((id: string) => {
                                const ex = appExercises[id];
                                return (
                                  <span key={id} className="px-3 py-1.5 bg-zinc-900 border border-white/5 rounded-xl text-[9px] font-bold text-white/40 uppercase tracking-widest">
                                    {ex ? ex.name : id.replace(/-/g, ' ')}
                                  </span>
                                );
                              })}
                            </div>
                            <button
                              onClick={() => {
                                setSearchQuery('');
                                setActiveTab('routine');
                              }}
                              className="w-full mt-2 py-3 border border-white/5 bg-zinc-900/60 rounded-2xl text-[9px] font-mono font-bold uppercase tracking-wider text-white/50 group-hover:text-[#2DD4BF] group-hover:border-[#2DD4BF]/20 transition-all text-center cursor-pointer"
                            >
                              Lihat Semua Jadwal &rarr;
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nutrition Section */}
                  {matchedNutrition.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-6 px-2 border-b border-white/5 pb-3">
                        <Utensils size={18} className="text-[#2DD4BF]" />
                        <h4 className="text-xs uppercase tracking-[0.3em] font-mono font-bold text-white/60">Asupan Makanan Pokok ({matchedNutrition.length})</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {matchedNutrition.map((item, idx) => (
                          <div 
                            key={`search-nut-${idx}`} 
                            className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] flex flex-col justify-between hover:bg-white/[0.04] transition-all group"
                          >
                            <div>
                              <div className="w-12 h-12 border border-white/10 rounded-xl flex items-center justify-center bg-zinc-900 mb-6 group-hover:border-[#2DD4BF]/40 transition-all">
                                <Utensils size={20} className="text-white/20 group-hover:text-[#2DD4BF]" />
                              </div>
                              <h4 className="text-2xl font-serif italic mb-3 tracking-tight text-white group-hover:text-[#2DD4BF] transition-colors">{item.name}</h4>
                              <p className="text-white/40 text-xs leading-relaxed italic mb-6">"{item.benefit}"</p>
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#2DD4BF]/60 bg-[#2DD4BF]/5 px-3 py-1.5 border border-[#2DD4BF]/10 rounded-lg w-max">
                              Kategori: {item.category}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
            {activeTab === 'dashboard' && (
              <Dashboard today={today} routine={currentDayRoutine} nutritionItems={appNutrition} onNav={setActiveTab} />
            )}

            {activeTab === 'routine' && (
              <RoutineSection routine={appRoutine} exercises={appExercises} />
            )}

            {activeTab === 'exercises' && (
              <ExerciseSection 
                onSelect={setSelectedExercise} 
                exercises={Object.values(appExercises)} 
              />
            )}

            {activeTab === 'nutrition' && (
              <NutritionSection items={appNutrition} />
            )}

            {activeTab === 'coach' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Custom Program Builder */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  <div className="bg-zinc-950/40 border border-white/10 rounded-[3rem] p-8">
                    <div className="flex items-center gap-2 mb-6">
                      <Sparkles size={16} className="text-[#2DD4BF]" />
                      <h3 className="text-sm uppercase tracking-[0.3em] font-bold text-[#2DD4BF]">Weekly Generator</h3>
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed mb-6">
                      Build a highly personalized weekly schedule, tailored exercises, and matching high-protein diet guidelines instantly.
                    </p>

                    <div className="space-y-4">
                      {/* Goals */}
                      <div>
                        <label className="text-[10px] uppercase tracking-[0.3em] font-mono text-white/30 block mb-2">Training Goal</label>
                        <select 
                          value={goals}
                          onChange={(e) => setGoals(e.target.value)}
                          className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-sm text-neutral-200 outline-none focus:border-[#2DD4BF]"
                        >
                          <option value="Hypertrophy (Muscle Mass)">Hypertrophy (Muscle Mass)</option>
                          <option value="Strength & Power">Strength & Power</option>
                          <option value="Fat Loss & Definition">Fat Loss & Definition</option>
                          <option value="Athletic Endurance">Athletic Endurance</option>
                        </select>
                      </div>

                      {/* Experience */}
                      <div>
                        <label className="text-[10px] uppercase tracking-[0.3em] font-mono text-white/30 block mb-2">Skill Level</label>
                        <select 
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-sm text-neutral-200 outline-none focus:border-[#2DD4BF]"
                        >
                          <option value="Beginner">Beginner (Perfect Form)</option>
                          <option value="Intermediate">Intermediate (Progressive)</option>
                          <option value="Advanced">Advanced (High Intensity / RPE)</option>
                        </select>
                      </div>

                      {/* Target Days */}
                      <div>
                        <label className="text-[10px] uppercase tracking-[0.3em] font-mono text-white/30 block mb-2">Frequency</label>
                        <select 
                          value={daysPerWeek}
                          onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                          className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-sm text-neutral-200 outline-none focus:border-[#2DD4BF]"
                        >
                          <option value={3}>3 Days Per Week</option>
                          <option value={4}>4 Days Per Week</option>
                          <option value={5}>5 Days Per Week</option>
                          <option value={6}>6 Days Per Week</option>
                        </select>
                      </div>

                      {/* Equipment */}
                      <div>
                        <label className="text-[10px] uppercase tracking-[0.3em] font-mono text-white/30 block mb-2">Available Gear</label>
                        <select 
                          value={equipment}
                          onChange={(e) => setEquipment(e.target.value)}
                          className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-sm text-neutral-200 outline-none focus:border-[#2DD4BF]"
                        >
                          <option value="Full Gym / Compound Rigs">Full Commercial Gym</option>
                          <option value="Dumbbells & Barbells only">Free-Weights (Home Gym)</option>
                          <option value="Pure Bodyweight (Calisthenics)">Pure Bodyweight / Calisthenics</option>
                        </select>
                      </div>

                      {/* Focus Muscles */}
                      <div>
                        <label className="text-[10px] uppercase tracking-[0.3em] font-mono text-white/30 block mb-2">Focus Target</label>
                        <input 
                          type="text" 
                          value={focusMuscles}
                          onChange={(e) => setFocusMuscles(e.target.value)}
                          placeholder="e.g., Arms & Back, Quads, Chest"
                          className="w-full bg-zinc-900 border border-white/10 rounded-2xl p-4 text-sm text-neutral-200 outline-none focus:border-[#2DD4BF] placeholder:text-white/20"
                        />
                      </div>

                      {generatorError && (
                        <p className="text-xs text-rose-500 mt-2 font-medium bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{generatorError}</p>
                      )}

                      <button 
                        onClick={handleGenerateCustomRoutine}
                        disabled={generatingRoutine}
                        className="w-full mt-6 bg-[#2DD4BF] text-black hover:bg-white font-bold text-xs uppercase tracking-[0.2em] py-4 rounded-full flex items-center justify-center gap-2 transition-colors duration-300 shadow-md shadow-[#2DD4BF]/20 disabled:opacity-40"
                      >
                        {generatingRoutine ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Synthesizing Program...
                          </>
                        ) : (
                          <>
                            <RefreshCw size={14} />
                            Generate & Set Active
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Chat workspace */}
                <div className="lg:col-span-8 flex flex-col h-[650px] bg-zinc-950/20 border border-white/10 rounded-[3.5rem] overflow-hidden">
                  {/* Chat header */}
                  <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#2DD4BF]/10 rounded-2xl flex items-center justify-center border border-[#2DD4BF]/20">
                        <Sparkles size={20} className="text-[#2DD4BF]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-serif italic">STRIVE Neural Engine</h3>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest font-mono">Advanced Sports & Kinematics AI</p>
                      </div>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>

                  {/* Message log */}
                  <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
                    {chatMessages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex gap-4 items-start max-w-[80%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 text-xs font-bold
                          ${msg.sender === 'user' ? 'bg-[#2DD4BF]/20 border-[#2DD4BF]/30 text-[#2DD4BF]' : 'bg-zinc-900 border-white/10 text-white/30'}
                        `}>
                          {msg.sender === 'user' ? 'YOU' : 'AI'}
                        </div>
                        <div className={`p-5 rounded-3xl text-sm leading-relaxed ${
                          msg.sender === 'user' 
                            ? 'bg-[#2DD4BF]/15 border border-[#2DD4BF]/20 text-white font-medium' 
                            : 'bg-white/[0.02] border border-white/5 text-white/80'
                        }`}>
                          <p className="whitespace-pre-line prose prose-invert max-w-none text-neutral-300">
                            {msg.text}
                          </p>
                          <span className="text-[9px] text-white/20 uppercase tracking-widest font-mono block mt-2 text-right">
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex gap-4 items-start max-w-[80%]">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-zinc-900 border border-white/10 text-white/30 shrink-0 text-xs font-bold">
                          AI
                        </div>
                        <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 text-white/80 flex items-center gap-3">
                          <Loader2 size={16} className="animate-spin text-[#2DD4BF]" />
                          <span className="text-xs uppercase font-mono tracking-widest text-[#2DD4BF]">Formulating Strategy...</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Suggestion tags */}
                  <div className="px-8 pb-4 flex gap-2 overflow-x-auto no-scrollbar py-2 border-t border-white/5 bg-zinc-950/20">
                    <button 
                      onClick={() => handleSendMessage('What is the perfect pre-workout meal for mass?')}
                      className="text-[10px] font-bold uppercase tracking-wider px-4 py-2 border border-white/10 rounded-full text-white/40 hover:text-white hover:border-[#2DD4BF] whitespace-nowrap transition-colors"
                    >
                      Pre-Workout Meal
                    </button>
                    <button 
                      onClick={() => handleSendMessage('Suggest alternative movements to Deadlift for back building.')}
                      className="text-[10px] font-bold uppercase tracking-wider px-4 py-2 border border-white/10 rounded-full text-white/40 hover:text-white hover:border-[#2DD4BF] whitespace-nowrap transition-colors"
                    >
                      Deadlift Alternatives
                    </button>
                    <button 
                      onClick={() => handleSendMessage('Explain how to maximize chest growth with bench press.')}
                      className="text-[10px] font-bold uppercase tracking-wider px-4 py-2 border border-white/10 rounded-full text-white/40 hover:text-white hover:border-[#2DD4BF] whitespace-nowrap transition-colors"
                    >
                      Maximize Chest Mass
                    </button>
                  </div>

                  {/* Chat input form */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage(chatInput);
                    }}
                    className="p-6 border-t border-white/5 bg-zinc-950 flex gap-4 items-center"
                  >
                    <input 
                      type="text" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask AI Coach prompt / custom biomechanics inquiries..."
                      className="flex-1 bg-zinc-900/60 border border-white/10 rounded-2xl py-4 px-6 text-sm text-neutral-200 outline-none focus:border-[#2DD4BF] placeholder:text-white/20"
                    />
                    <button 
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="w-14 h-14 bg-[#2DD4BF] text-black rounded-2xl flex items-center justify-center hover:bg-white transition-colors duration-300 disabled:opacity-30 disabled:hover:bg-[#2DD4BF]"
                    >
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              </div>
            )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Exercise Modal */}
      <AnimatePresence>
        {selectedExercise && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedExercise(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              layoutId={`exercise-${selectedExercise.id}`}
              className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <div className="h-56 bg-zinc-900/50 flex items-center justify-center relative border-b border-white/5">
                <Dumbbell size={80} className="text-white/10" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#2DD4BF]/5 to-transparent"></div>
                <button 
                  onClick={() => setSelectedExercise(null)}
                  className="absolute top-8 right-8 w-12 h-12 glass rounded-full flex items-center justify-center hover:bg-white/10 transition-colors z-10"
                >
                  &times;
                </button>
              </div>
              <div className="p-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] font-mono accent-teal">
                    Target: {selectedExercise.target}
                  </span>
                </div>
                <h3 className="text-4xl font-serif italic mb-6 tracking-tight">{selectedExercise.name}</h3>
                <p className="text-white/50 mb-8 leading-relaxed italic max-w-lg">
                  "{selectedExercise.description}"
                </p>

                <div className="grid grid-cols-2 gap-6 mb-10">
                  <div className="border border-white/5 bg-white/[0.02] p-6 rounded-3xl">
                    <span className="text-[10px] text-white/30 font-bold mb-2 uppercase tracking-widest block">Standard Volume</span>
                    <span className="text-2xl font-serif italic text-[#2DD4BF] tracking-tight">{selectedExercise.sets} Sets</span>
                  </div>
                  <div className="border border-white/5 bg-white/[0.02] p-6 rounded-3xl">
                    <span className="text-[10px] text-white/30 font-bold mb-2 uppercase tracking-widest block">Hypertrophy Reps</span>
                    <span className="text-2xl font-serif italic text-[#2DD4BF] tracking-tight">{selectedExercise.reps}</span>
                  </div>
                </div>

                <h4 className="text-xs uppercase tracking-[0.3em] font-bold accent-teal mb-6">Technical Execution</h4>
                <ul className="space-y-6">
                  {selectedExercise.instructions.map((step, i) => (
                    <li key={i} className="flex gap-6 items-start">
                      <span className="text-lg font-serif italic accent-teal opacity-50 shrink-0">
                        0{i + 1}
                      </span>
                      <p className="text-sm font-medium text-white/60 leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="hidden md:flex fixed bottom-0 left-24 lg:left-64 right-0 h-16 border-t border-white/5 px-12 items-center justify-between text-[9px] uppercase tracking-[0.4em] text-white/20 bg-[#050505]/80 backdrop-blur-xl z-40">
        <span>STRIVE PERFORMANCE SYSTEM / ASIA PACIFIC</span>
        <div className="flex gap-8">
          <span className="accent-teal font-bold italic tracking-widest">PHASE: HYPERTROPHY 1.0</span>
          <span>SYSTEM MMXXVI</span>
        </div>
      </footer>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: ReactNode, label: string }) {
  return (
    <button 
      id={`nav-${label.toLowerCase().replace(' ', '-')}`}
      onClick={onClick}
      className={`flex flex-col items-center gap-1 md:gap-2 px-2 py-4 rounded-2xl transition-all duration-500 w-full group relative cursor-pointer
        ${active ? 'text-[#2DD4BF]' : 'text-white/30 hover:text-white/60'}
      `}
    >
      <span className={`transition-all duration-500 ${active ? 'scale-110' : 'group-hover:scale-105'}`}>
        {icon}
      </span>
      <span className={`text-[9px] font-bold tracking-[0.2em] uppercase transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-40 group-hover:opacity-70'}`}>
        {label}
      </span>
      {active && (
        <motion.div 
          layoutId="nav-active"
          className="hidden md:block w-1 h-6 bg-[#2DD4BF] absolute right-0 rounded-l-full shadow-[0_0_15px_#2DD4BF55]"
        />
      )}
    </button>
  );
}

function Dashboard({ today, routine, nutritionItems, onNav }: { today: string, routine: any, nutritionItems: any[], onNav: (tab: any) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
      {/* Today's Focus Card */}
      <div className="md:col-span-8 flex flex-col gap-8">
        <div className="relative overflow-hidden group rounded-[3rem] bg-zinc-900 border border-white/5 p-10 md:p-16 min-h-[400px] flex flex-col justify-end">
          <img 
            src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80&w=1200" 
            alt="Minimalist Gym" 
            className="absolute inset-0 w-full h-full object-cover grayscale brightness-[0.2] transition-transform duration-[2000ms] group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="accent-teal text-xs font-mono font-bold tracking-[0.3em] uppercase">
                Active Protocol / {today.toUpperCase()}
              </span>
            </div>
            <h3 className="text-6xl md:text-8xl font-serif italic mb-8 tracking-tighter leading-none">
              {routine.title}
            </h3>
            <p className="text-white/40 max-w-lg text-lg font-medium leading-relaxed mb-10 italic">
              "Focusing on metabolic stress and mechanical tension. Maintain 60-second rest intervals for optimal response."
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => onNav('routine')}
                className="flex items-center gap-3 bg-[#2DD4BF] text-black px-8 py-4 rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-white transition-colors group/btn cursor-pointer"
              >
                Initiate Session <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="bg-[#2DD4BF] text-black p-10 rounded-[3rem] flex flex-col justify-between min-h-[280px]">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4 opacity-70">Dietary Instruction</h4>
              <p className="text-2xl font-serif italic leading-tight mb-6">
                Active Synthesis Target: <br/>{routine.nutritionalFocus}
              </p>
            </div>
            <div className="pt-6 border-t border-black/10 flex items-center justify-between text-[10px] font-black tracking-widest uppercase">
              <span>Status: Required</span>
              <Utensils size={16} />
            </div>
          </div>

          <div className="border border-white/10 p-10 rounded-[3rem] flex flex-col justify-between min-h-[280px] text-center">
            <div className="flex flex-col items-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 mb-2">Hydration Level</p>
              <span className="text-6xl font-serif italic tracking-tighter">88%</span>
            </div>
            <div className="space-y-6">
              <div className="w-full h-[2px] bg-white/10 relative overflow-hidden rounded-full">
                <div className="absolute top-0 left-0 h-full w-[88%] bg-[#2DD4BF] shadow-[0_0_10px_#2DD4BF]"></div>
              </div>
              <button className="w-full py-4 border border-white/20 rounded-full text-[9px] font-bold uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all">
                Log Fluid Intake +500ml
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Foods Sidebar */}
      <div className="md:col-span-4 flex flex-col gap-8">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 px-2 flex items-center justify-between">
          <span>Staple Sources</span>
          <span>MMXXVI</span>
        </h4>
        <div className="flex flex-col gap-4">
          {nutritionItems.slice(0, 5).map((item, idx) => (
            <div key={idx} className="bg-white/[0.03] border border-white/5 p-6 rounded-[2.5rem] flex items-center gap-6 hover:bg-white/[0.06] transition-all group cursor-pointer" onClick={() => onNav('nutrition')}>
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center group-hover:border-[#2DD4BF]/40 transition-colors shrink-0 font-serif text-2xl italic text-white/20 group-hover:text-[#2DD4BF]">
                {item.name.charAt(0)}
              </div>
              <div>
                <p className="text-lg font-serif italic tracking-tight">{item.name}</p>
                <p className="text-[9px] text-[#2DD4BF] uppercase font-bold tracking-[0.2em] mt-1">{item.category}</p>
              </div>
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity accent-teal">
                <ArrowRight size={18} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RoutineSection({ routine, exercises }: { routine: any[], exercises: Record<string, Exercise> }) {
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  
  return (
    <div className="space-y-6 pb-20">
      {routine.map((day, idx) => (
        <div 
          key={idx} 
          className={`relative overflow-hidden border border-white/10 rounded-[3rem] p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 transition-all duration-500 group 
            ${day.day === currentDay ? 'bg-white/[0.04] border-[#2DD4BF]/30' : 'bg-[#050505] hover:bg-white/[0.02]'}`}
        >
          {day.day === currentDay && (
            <div className="absolute top-0 left-0 w-1 h-full bg-[#2DD4BF]"></div>
          )}
          
          <div className="flex items-center gap-10">
            <div className="text-center min-w-[70px]">
              <p className="text-[9px] font-bold uppercase text-white/30 tracking-[0.4em] mb-2">{day.day.substring(0, 3)}</p>
              <p className="text-3xl font-serif italic group-hover:text-[#2DD4BF] transition-colors tracking-tighter">0{idx + 1}</p>
            </div>
            <div className="hidden lg:block w-[1px] h-12 bg-white/10"></div>
            <div>
              <h4 className="text-3xl font-serif italic tracking-tight mb-2 flex items-center gap-4">
                {day.title}
                {day.day === currentDay && <span className="text-[10px] font-sans not-italic uppercase tracking-[0.3em] font-bold accent-teal bg-[#2DD4BF]/10 px-3 py-1 rounded-full animate-pulse">Running</span>}
              </h4>
              <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em]">
                {day.exercises.length > 0 ? `Target Volume / ${day.exercises.length} Movements` : 'System Architecture / Rest'}
              </p>
            </div>
          </div>

          <div className="flex gap-4 flex-wrap select-none">
            {day.exercises.map((id: string) => {
              const exName = exercises[id]?.name || id.replace(/-/g, ' ');
              return (
                <span key={id} className="px-5 py-3 border border-white/5 bg-zinc-900 rounded-2xl text-[10px] font-bold text-white/50 uppercase tracking-widest">
                  {exName}
                </span>
              );
            })}
            {day.exercises.length === 0 && (
              <span className="px-5 py-3 border border-[#2DD4BF]/20 bg-[#2DD4BF]/5 rounded-2xl text-[10px] font-bold text-[#2DD4BF] uppercase tracking-widest italic">
                Active Rest & Recovery
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ExerciseSection({ exercises, onSelect }: { exercises: Exercise[], onSelect: (e: Exercise) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
      {exercises.map((exercise) => (
        <motion.div
          key={exercise.id}
          layoutId={`exercise-${exercise.id}`}
          onClick={() => onSelect(exercise)}
          className="group relative overflow-hidden bg-white/[0.02] border border-white/5 rounded-[3rem] cursor-pointer hover:border-[#2DD4BF]/40 transition-all p-3"
        >
          <div className="h-64 bg-zinc-900 rounded-[2.5rem] overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent flex items-end p-8">
              <span className="px-4 py-2 bg-black/40 backdrop-blur-md rounded-full text-[9px] font-bold uppercase text-white tracking-[0.3em] border border-white/10">
                {exercise.target.split(',')[0]}
              </span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-5 group-hover:opacity-20 transition-all duration-700 group-hover:scale-125">
              <Dumbbell size={100} />
            </div>
          </div>
          <div className="p-8">
            <h4 className="text-2xl font-serif italic mb-3 tracking-tight group-hover:text-[#2DD4BF] transition-colors">{exercise.name}</h4>
            <div className="flex items-center justify-between text-white/30">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] shadow-[0_0_10px_#2DD4BF]"></div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{exercise.sets} Sets / {exercise.reps}</span>
              </div>
              <ArrowRight size={18} className="translate-x-[-10px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all accent-teal" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function NutritionSection({ items }: { items: any[] }) {
  return (
    <div className="space-y-16 pb-20">
      <div className="relative h-[450px] rounded-[4rem] overflow-hidden flex items-center px-8 md:px-20 border border-white/5">
        <img 
          src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=1200"
          className="absolute inset-0 w-full h-full object-cover grayscale brightness-[0.2]"
          alt="Artistic food"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/40 to-transparent" />
        <div className="relative z-10 max-w-xl">
          <h2 className="text-[10px] font-bold text-[#2DD4BF] uppercase tracking-[0.5em] mb-6 font-mono">Nutritional Philosophy</h2>
          <h3 className="text-6xl md:text-8xl font-serif italic leading-[0.9] mb-8 tracking-tighter">Fueling the <br/>Machine.</h3>
          <p className="text-white/40 text-xl font-medium leading-relaxed italic border-l-2 border-[#2DD4BF]/30 pl-8">
            "Hypertrophy is synthesized in the kitchen. Every micronutrient serves a mechanical purpose in the restoration of skeletal muscle tissue."
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item, idx) => (
          <div key={idx} className="bg-white/[0.02] border border-white/5 p-10 rounded-[3rem] flex flex-col gap-10 group hover:bg-white/[0.04] transition-all duration-500">
             <div className="w-16 h-16 border border-white/10 rounded-2xl flex items-center justify-center bg-zinc-900 group-hover:border-[#2DD4BF]/40 group-hover:shadow-[0_0_20px_#2DD4BF11] transition-all shrink-0">
                <Utensils size={28} className="text-white/20 group-hover:text-[#2DD4BF] transition-colors" />
             </div>
             <div>
               <h4 className="text-3xl font-serif italic mb-4 tracking-tight group-hover:text-[#2DD4BF] transition-colors">{item.name}</h4>
               <p className="text-white/40 text-base leading-relaxed mb-10 font-medium italic">
                 "{item.benefit}"
               </p>
               <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-white/20 group-hover:text-[#2DD4BF]/60 transition-colors">
                 Source Type: {item.category}
               </span>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
