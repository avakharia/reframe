import React, { useState, useEffect } from 'react';
import { View, Project, Task } from './types';
import { WisdomGenerator } from './components/WisdomGenerator';
import { ProjectCard } from './components/ProjectCard';
import { suggestProjectTasks } from './services/geminiService';
import { 
  LayoutDashboard, 
  ListTodo, 
  Lightbulb, 
  UserCircle, 
  Plus, 
  X,
  Loader2,
  Menu,
  Sprout,
  GitFork,
  Wrench,
  Search,
  ArrowRight,
  LogOut,
  Zap,
  Moon,
  Sun
} from 'lucide-react';

// --- Sub-components defined outside App to prevent re-renders ---

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (project: Project) => void;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState<Project['category']>('Personal');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDesc('');
      setCat('Personal');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const suggestedTasks = await suggestProjectTasks(title, desc);
    
    const newProject: Project = {
      id: Date.now().toString(),
      title,
      description: desc,
      category: cat,
      progress: 0,
      tasks: suggestedTasks.map((t, i) => ({
        id: `new-${i}`,
        title: t,
        isCompleted: false
      })),
      createdAt: Date.now()
    };

    onAdd(newProject);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-100 dark:border-slate-700 transition-colors">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">New Project</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project Title</label>
            <input 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none bg-white dark:bg-slate-700 dark:text-white"
              placeholder="e.g., Become a Morning Person"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Purpose/Goal</label>
            <textarea 
              required
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none h-24 resize-none bg-white dark:bg-slate-700 dark:text-white"
              placeholder="Why do you want to do this?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
            <select 
              value={cat}
              onChange={(e) => setCat(e.target.value as any)}
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2 bg-white dark:bg-slate-700 dark:text-white"
            >
              <option value="Personal">Personal</option>
              <option value="Career">Career</option>
              <option value="Health">Health</option>
              <option value="Spiritual">Spiritual</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-lg mt-4 flex justify-center items-center gap-2 transition-colors"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Plus size={20} />
                Create Project
              </>
            )}
          </button>
          {loading && <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2">AI is generating a starting plan...</p>}
        </form>
      </div>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200
      ${active ? 'bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}
    `}
  >
    <span className={active ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}>{icon}</span>
    {label}
  </button>
);

const SparkleIcon = () => (
  <svg className="w-6 h-6 text-yellow-300 mb-3" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 2l2.5 5.5L18 10l-5.5 2.5L10 18l-2.5-5.5L2 10l5.5-2.5L10 2z" />
  </svg>
);

const ThemeToggle = ({ darkMode, toggleTheme }: { darkMode: boolean; toggleTheme: () => void }) => (
  <button 
    onClick={toggleTheme}
    className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
    aria-label="Toggle Dark Mode"
  >
    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
  </button>
);

// --- Landing Page Component ---

const LandingPage: React.FC<{ onLogin: () => void; darkMode: boolean; toggleTheme: () => void }> = ({ onLogin, darkMode, toggleTheme }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="text-brand-600 dark:text-brand-500" size={24} fill="currentColor" />
            <span className="text-xl font-bold text-slate-900 dark:text-white">Reframe</span>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
              <a href="#roots" className="hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1"><Sprout size={16}/> Roots</a>
              <a href="#branches" className="hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1"><GitFork size={16}/> Branches</a>
              <a href="#toolbox" className="hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1"><Wrench size={16}/> Toolbox</a>
            </nav>
            <div className="flex items-center gap-4">
              <ThemeToggle darkMode={darkMode} toggleTheme={toggleTheme} />
              <button 
                onClick={onLogin}
                className="bg-brand-600 text-white px-5 py-2 rounded-full font-medium hover:bg-brand-700 transition shadow-sm flex items-center gap-2"
              >
                <UserCircle size={18} />
                Sign In
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-black text-brand-600 dark:text-brand-500 mb-6 tracking-tight">
          Reframe
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-2 font-light">
          Edit Your Perspective. Change Your Life.
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mb-10 uppercase tracking-widest font-semibold">
          Your Field Guide to Being Human.
        </p>

        <div className="max-w-2xl mx-auto relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="I am feeling angry... or Why is life unfair?" 
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm text-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>

        <div className="mt-12">
          <button 
             onClick={onLogin}
             className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-bold text-sm tracking-wide shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            START HERE
          </button>
        </div>
      </section>

      {/* Framework Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* The Roots */}
            <div id="roots" className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-green-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <div className="w-14 h-14 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-6 text-slate-700 dark:text-slate-200 group-hover:bg-green-50 dark:group-hover:bg-green-900/30 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                <Sprout size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">The Roots</h3>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Go Deep</p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                For when you ask: "Why is life like this?" Deep philosophical truths about the nature of reality.
              </p>
              <div className="space-y-2">
                <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium mr-2">Truth</span>
                <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium mr-2">Control</span>
                <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium">Fairness</span>
              </div>
              <div className="mt-8 flex items-center text-slate-400 dark:text-slate-500 text-sm font-medium group-hover:text-green-600 dark:group-hover:text-green-400 cursor-pointer">
                Explore Roots <ArrowRight size={16} className="ml-2" />
              </div>
            </div>

            {/* The Toolbox (Center Highlight) */}
            <div id="toolbox" className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border-t-4 border-orange-400 transform md:-translate-y-4 relative z-10 transition-colors">
               <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-400 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm">
                 Action
               </span>
              <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center mb-6 text-orange-500">
                <Wrench size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">The Toolbox</h3>
              <p className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-4">Get Strong</p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                For when you ask: "How do I stop freaking out?" Concrete techniques and habits to build resilience.
              </p>
              <div className="space-y-2">
                <span className="inline-block px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium mr-2">Brain Hacks</span>
                <span className="inline-block px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium mr-2">Emotional Drills</span>
              </div>
              <div onClick={onLogin} className="mt-8 flex items-center text-orange-500 text-sm font-bold cursor-pointer hover:gap-2 transition-all">
                Open Kit <ArrowRight size={16} className="ml-2" />
              </div>
            </div>

            {/* The Branches */}
            <div id="branches" className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 group relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-teal-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              <div className="w-14 h-14 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-6 text-slate-700 dark:text-slate-200 group-hover:bg-teal-50 dark:group-hover:bg-teal-900/30 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                <GitFork size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">The Branches</h3>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Go Wide</p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                For when you ask: "What do I do about this problem?" Applying wisdom to friends, school, and money.
              </p>
              <div className="space-y-2">
                <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium mr-2">Friends</span>
                <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium mr-2">School</span>
                <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium">Money</span>
              </div>
              <div className="mt-8 flex items-center text-slate-400 dark:text-slate-500 text-sm font-medium group-hover:text-teal-600 dark:group-hover:text-teal-400 cursor-pointer">
                Climb Branches <ArrowRight size={16} className="ml-2" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Wisdom Teaser */}
      <section className="py-20 px-4 bg-slate-900 dark:bg-black text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-800/50 rounded-l-full blur-3xl -mr-20"></div>
         <div className="max-w-4xl mx-auto relative z-10">
           <div className="flex flex-col md:flex-row items-center gap-12">
             <div className="flex-1">
               <div className="flex items-center gap-2 mb-4 text-brand-400 font-bold tracking-wider text-xs uppercase">
                 <Zap size={14} fill="currentColor" /> Wisdom of the Day
               </div>
               <h2 className="text-4xl font-bold mb-6">The Compliment Ninja</h2>
               <p className="text-xl text-slate-300 italic mb-8">
                 "We suffer more in imagination than in reality." — Seneca
               </p>
               <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl mb-8">
                 <h4 className="text-brand-300 font-bold mb-2">Your Mission:</h4>
                 <p className="text-slate-300">Give 3 genuine compliments to people you usually ignore today.</p>
               </div>
               <button onClick={onLogin} className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-3 rounded-lg font-bold transition flex items-center gap-2">
                 Accept Challenge <ArrowRight size={18} />
               </button>
             </div>
             <div className="hidden md:block text-right">
               <span className="text-slate-500 font-mono text-sm">Reward: +50 XP</span>
             </div>
           </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 py-12 border-t border-slate-100 dark:border-slate-800 mt-auto transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
             <Zap className="text-slate-400 dark:text-slate-500" size={20} />
             <span className="font-bold text-slate-700 dark:text-slate-200">Reframe</span>
          </div>
          <p className="text-slate-400 dark:text-slate-500 text-sm italic">"Between stimulus and response there is a space..."</p>
          <div className="mt-8 flex justify-center gap-6 text-sm text-brand-600 dark:text-brand-400 font-medium">
            <a href="#">About</a>
            <a href="#">For Parents</a>
            <a href="#">Submit Topic</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- Portal (Authenticated App) Component ---

const Portal: React.FC<{ onLogout: () => void; darkMode: boolean; toggleTheme: () => void }> = ({ onLogout, darkMode, toggleTheme }) => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setProjects([
      {
        id: '1',
        title: 'Learn Spanish',
        description: 'Achieve conversational fluency before the summer trip to Barcelona.',
        category: 'Personal',
        progress: 15,
        tasks: [
          { id: 't1', title: 'Download Duolingo', isCompleted: true },
          { id: 't2', title: 'Practice 15 mins daily', isCompleted: false },
          { id: 't3', title: 'Watch a Spanish movie', isCompleted: false },
        ],
        createdAt: Date.now()
      },
      {
        id: '2',
        title: 'Run a Marathon',
        description: 'Train for the city marathon happening in 6 months.',
        category: 'Health',
        progress: 45,
        tasks: [
          { id: 't1', title: 'Buy running shoes', isCompleted: true },
          { id: 't2', title: 'Run 5k', isCompleted: true },
          { id: 't3', title: 'Register for race', isCompleted: false },
        ],
        createdAt: Date.now()
      }
    ]);
  }, []);

  const toggleTask = (projectId: string, taskId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const updatedTasks = p.tasks.map(t => 
        t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
      );
      return { ...p, tasks: updatedTasks };
    }));
  };

  const handleAddProject = (newProject: Project) => {
    setProjects(prev => [newProject, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-300">
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-slate-900 p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <h1 className="text-xl font-bold bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">Reframe Portal</h1>
        <div className="flex items-center gap-3">
          <ThemeToggle darkMode={darkMode} toggleTheme={toggleTheme} />
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-600 dark:text-slate-300">
            <Menu />
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <div className={`
        fixed md:sticky md:top-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 z-40 transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="hidden md:block mb-8">
          <div className="flex items-center gap-2 mb-1">
             <Zap className="text-brand-600 dark:text-brand-500" size={20} fill="currentColor" />
             <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Reframe</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 pl-1">Student Portal</p>
        </div>

        <nav className="space-y-2">
          <NavButton 
            active={currentView === View.DASHBOARD} 
            onClick={() => { setCurrentView(View.DASHBOARD); setIsSidebarOpen(false); }}
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
          />
          <NavButton 
            active={currentView === View.PROJECTS} 
            onClick={() => { setCurrentView(View.PROJECTS); setIsSidebarOpen(false); }}
            icon={<ListTodo size={20} />} 
            label="Projects & Tasks" 
          />
          <NavButton 
            active={currentView === View.WISDOM} 
            onClick={() => { setCurrentView(View.WISDOM); setIsSidebarOpen(false); }}
            icon={<Lightbulb size={20} />} 
            label="Daily Wisdom" 
          />
          <NavButton 
            active={currentView === View.PROFILE} 
            onClick={() => { setCurrentView(View.PROFILE); setIsSidebarOpen(false); }}
            icon={<UserCircle size={20} />} 
            label="Profile" 
          />
        </nav>

        <div className="absolute bottom-6 left-6 right-6 space-y-4">
           {/* Desktop Theme Toggle inside sidebar */}
           <div className="hidden md:flex justify-start">
             <ThemeToggle darkMode={darkMode} toggleTheme={toggleTheme} />
           </div>

           <button onClick={onLogout} className="flex items-center gap-2 text-slate-400 hover:text-red-500 text-sm font-medium px-4 transition-colors">
             <LogOut size={16} /> Sign Out
           </button>
          <div className="bg-gradient-to-br from-indigo-50 to-brand-50 dark:from-slate-800 dark:to-slate-800 p-4 rounded-xl border border-brand-100 dark:border-slate-700">
            <p className="text-xs font-semibold text-brand-800 dark:text-brand-300 mb-1">Daily Streak</p>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">12</span>
              <span className="text-sm text-brand-500 dark:text-brand-400 mb-1">days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-60px)] md:h-screen">
        <div className="max-w-5xl mx-auto">
          
          {/* Dashboard View */}
          {currentView === View.DASHBOARD && (
            <div className="space-y-8 animate-fade-in">
              <header className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Good Morning, Alex</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">Ready to reframe your day?</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 transition shadow-sm hidden md:flex items-center gap-2"
                >
                  <Plus size={18} /> New Project
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 col-span-2 transition-colors">
                  <h3 className="font-bold text-slate-800 dark:text-white mb-4">Active Projects</h3>
                  <div className="space-y-4">
                    {projects.slice(0, 2).map(p => (
                       <div key={p.id} className="flex justify-between items-center border-b border-slate-50 dark:border-slate-700 pb-4 last:border-0 last:pb-0">
                         <div>
                           <h4 className="font-medium text-slate-700 dark:text-slate-200">{p.title}</h4>
                           <span className="text-xs text-slate-400 dark:text-slate-500">{p.tasks.filter(t => t.isCompleted).length} / {p.tasks.length} tasks</span>
                         </div>
                         <div className="w-24 bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full">
                           <div className="bg-brand-500 h-1.5 rounded-full" style={{width: '40%'}}></div>
                         </div>
                       </div>
                    ))}
                  </div>
                  <button onClick={() => setCurrentView(View.PROJECTS)} className="w-full mt-4 text-center text-sm text-brand-600 dark:text-brand-400 font-medium hover:text-brand-700 dark:hover:text-brand-300">View All Projects</button>
                </div>

                <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-6 rounded-xl shadow-md flex flex-col justify-between">
                  <div>
                    <SparkleIcon />
                    <h3 className="font-bold text-lg mb-2">Wisdom of the Day</h3>
                    <p className="text-indigo-100 text-sm italic">"The only way to do great work is to love what you do."</p>
                  </div>
                  <button onClick={() => setCurrentView(View.WISDOM)} className="mt-4 bg-white/20 hover:bg-white/30 transition text-sm py-2 rounded-lg">
                    Get New Insight
                  </button>
                </div>
              </div>

              <section>
                <h3 className="font-bold text-slate-800 dark:text-white mb-4 text-lg">Quick Tasks</h3>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 divide-y divide-slate-50 dark:divide-slate-700 transition-colors">
                   {projects.flatMap(p => p.tasks.map(t => ({...t, projectId: p.id, projectTitle: p.title})))
                     .filter(t => !t.isCompleted).slice(0, 5).map((task) => (
                     <div key={`${task.projectId}-${task.id}`} className="p-4 flex items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition cursor-pointer" onClick={() => toggleTask(task.projectId, task.id)}>
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-500 mr-4 hover:border-brand-500"></div>
                        <div>
                          <p className="text-slate-700 dark:text-slate-200 text-sm font-medium">{task.title}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">{task.projectTitle}</p>
                        </div>
                     </div>
                   ))}
                </div>
              </section>
            </div>
          )}

          {/* Projects View */}
          {currentView === View.PROJECTS && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Projects</h2>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 transition shadow-sm flex items-center gap-2"
                >
                  <Plus size={18} /> Add Project
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    onSelect={(id) => console.log('Selected', id)}
                    onToggleTask={toggleTask}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Wisdom View */}
          {currentView === View.WISDOM && (
            <div className="animate-fade-in">
               <WisdomGenerator />
            </div>
          )}

          {/* Profile View (Placeholder) */}
          {currentView === View.PROFILE && (
            <div className="animate-fade-in text-center py-20">
              <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                <UserCircle size={48} className="text-slate-400 dark:text-slate-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Alex User</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8">alex@example.com</p>
              
              <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden text-left">
                <div className="p-4 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                  <span className="text-slate-700 dark:text-slate-200">Account Settings</span>
                  <span className="text-slate-400">→</span>
                </div>
                <div className="p-4 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                  <span className="text-slate-700 dark:text-slate-200">Notifications</span>
                  <span className="text-slate-400">→</span>
                </div>
                <div className="p-4 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-red-500" onClick={onLogout}>
                  <span>Sign Out</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Floating Action Button for Mobile */}
      <div className="md:hidden fixed bottom-6 right-6">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 text-white p-4 rounded-full shadow-lg hover:bg-brand-700 transition"
        >
          <Plus size={24} />
        </button>
      </div>

      <NewProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddProject}
      />
    </div>
  );
};

// --- Main App Component (State Manager) ---

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  return isAuthenticated ? (
    <Portal 
      onLogout={() => setIsAuthenticated(false)} 
      darkMode={darkMode} 
      toggleTheme={toggleTheme} 
    />
  ) : (
    <LandingPage 
      onLogin={() => setIsAuthenticated(true)} 
      darkMode={darkMode} 
      toggleTheme={toggleTheme} 
    />
  );
};

export default App;