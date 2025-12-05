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
  Menu
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

  // Reset form when modal opens
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
    
    // AI Assistance to generate tasks
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
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">New Reframe Project</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Project Title</label>
            <input 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
              placeholder="e.g., Become a Morning Person"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Purpose/Goal</label>
            <textarea 
              required
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none h-24 resize-none"
              placeholder="Why do you want to do this?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select 
              value={cat}
              onChange={(e) => setCat(e.target.value as any)}
              className="w-full border border-slate-300 rounded-lg p-2 bg-white"
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
          {loading && <p className="text-center text-xs text-slate-500 mt-2">AI is generating a starting plan...</p>}
        </form>
      </div>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200
      ${active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
    `}
  >
    <span className={active ? 'text-brand-600' : 'text-slate-400'}>{icon}</span>
    {label}
  </button>
);

const SparkleIcon = () => (
  <svg className="w-6 h-6 text-yellow-300 mb-3" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 2l2.5 5.5L18 10l-5.5 2.5L10 18l-2.5-5.5L2 10l5.5-2.5L10 2z" />
  </svg>
);

// --- Main App Component ---

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Initial Mock Data
  useEffect(() => {
    // Simulate loading data
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
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 flex justify-between items-center border-b border-slate-200 sticky top-0 z-30">
        <h1 className="text-xl font-bold bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">Reframe</h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-600">
          <Menu />
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className={`
        fixed md:sticky md:top-0 h-screen w-64 bg-white border-r border-slate-200 p-6 z-40 transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="hidden md:block mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">Reframe</h1>
          <p className="text-xs text-slate-500 mt-1">Grow. Learn. Become.</p>
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

        <div className="absolute bottom-6 left-6 right-6">
          <div className="bg-gradient-to-br from-indigo-50 to-brand-50 p-4 rounded-xl border border-brand-100">
            <p className="text-xs font-semibold text-brand-800 mb-1">Daily Streak</p>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold text-brand-600">12</span>
              <span className="text-sm text-brand-500 mb-1">days</span>
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
                  <h2 className="text-3xl font-bold text-slate-900">Good Morning, Alex</h2>
                  <p className="text-slate-500 mt-1">Ready to reframe your day?</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 transition shadow-sm hidden md:flex items-center gap-2"
                >
                  <Plus size={18} /> New Project
                </button>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 col-span-2">
                  <h3 className="font-bold text-slate-800 mb-4">Active Projects</h3>
                  <div className="space-y-4">
                    {projects.slice(0, 2).map(p => (
                       <div key={p.id} className="flex justify-between items-center border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                         <div>
                           <h4 className="font-medium text-slate-700">{p.title}</h4>
                           <span className="text-xs text-slate-400">{p.tasks.filter(t => t.isCompleted).length} / {p.tasks.length} tasks</span>
                         </div>
                         <div className="w-24 bg-slate-100 h-1.5 rounded-full">
                           <div className="bg-brand-500 h-1.5 rounded-full" style={{width: '40%'}}></div>
                         </div>
                       </div>
                    ))}
                  </div>
                  <button onClick={() => setCurrentView(View.PROJECTS)} className="w-full mt-4 text-center text-sm text-brand-600 font-medium hover:text-brand-700">View All Projects</button>
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
                <h3 className="font-bold text-slate-800 mb-4 text-lg">Quick Tasks</h3>
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 divide-y divide-slate-50">
                   {projects.flatMap(p => p.tasks.map(t => ({...t, projectId: p.id, projectTitle: p.title})))
                     .filter(t => !t.isCompleted).slice(0, 5).map((task) => (
                     <div key={task.id} className="p-4 flex items-center hover:bg-slate-50 transition cursor-pointer" onClick={() => toggleTask(task.projectId, task.id)}>
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 mr-4 hover:border-brand-500"></div>
                        <div>
                          <p className="text-slate-700 text-sm font-medium">{task.title}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">{task.projectTitle}</p>
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
                <h2 className="text-2xl font-bold text-slate-900">Your Projects</h2>
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
              <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <UserCircle size={48} className="text-slate-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Alex User</h2>
              <p className="text-slate-500 mb-8">alex@example.com</p>
              
              <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-50 flex justify-between items-center hover:bg-slate-50 cursor-pointer">
                  <span>Account Settings</span>
                  <span className="text-slate-400">→</span>
                </div>
                <div className="p-4 border-b border-slate-50 flex justify-between items-center hover:bg-slate-50 cursor-pointer">
                  <span>Notifications</span>
                  <span className="text-slate-400">→</span>
                </div>
                <div className="p-4 flex justify-between items-center hover:bg-slate-50 cursor-pointer text-red-500">
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

export default App;