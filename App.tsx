
import React, { useState, useEffect, useRef } from 'react';
import { View, Project, Task, SearchResult, ReframeVariation, ReframeType, FollowUpResult, Priority, TaskNote, WisdomNugget } from './types';
import { WisdomGenerator } from './components/WisdomGenerator';
import { ProjectCard } from './components/ProjectCard';
import { suggestProjectTasks, analyzeSituation, getFollowUpAdvice, getProjectCoaching } from './services/geminiService';
import { signInWithSocial, signUpWithEmail, loginWithEmail, logout, subscribeToAuth, User } from './services/firebase';
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
  Sun,
  Settings,
  ChevronDown,
  Upload,
  Mail,
  Lock,
  User as UserIcon,
  Globe,
  ArrowLeft,
  BookOpen,
  Briefcase,
  Heart,
  DollarSign,
  CheckSquare,
  Square,
  MessageCircle,
  Send,
  Filter,
  Calendar,
  Trash2,
  Save,
  CheckCircle,
  Clock,
  Edit3,
  Sparkles,
  PieChart,
  Target
} from 'lucide-react';

// --- Translations ---

const translations = {
  en: {
    roots: "Roots",
    branches: "Branches",
    toolbox: "Toolbox",
    dashboard: "Dashboard",
    projects: "Projects",
    tasks: "Tasks",
    wisdom: "Surprise Me",
    profile: "Profile",
    signIn: "Sign In",
    signOut: "Sign Out",
    settings: "Settings",
    startHere: "START HERE",
    searchPlaceholder: "What's on your mind...",
    subtitle: "Edit Your Perspective. Change Your Life.",
    subsubtitle: "Your Field Guide to Being Human.",
    footerQuote: "\"Between stimulus and response there is a space...\"",
    about: "About",
    terms: "Terms of Use",
    privacy: "Privacy Policy",
    submitTopic: "Submit Topic",
    rootsDesc: "Deep philosophical truths.",
    branchesDesc: "Practical application.",
    toolboxDesc: "Actionable techniques.",
    wisdomDay: "Wisdom of the Day",
    acceptChallenge: "Accept Challenge",
    yourMission: "Your Mission",
    reward: "Reward",
    goDeep: "Go Deep",
    goWide: "Go Wide",
    getStrong: "Get Strong",
    backHome: "Back to Home",
    readMore: "Read More",
    tryTool: "Try This Tool",
    analyzing: "Reframing your situation...",
    saveToPortal: "Save to Portal",
    selectTasks: "Select tasks to add:",
    searchResultTitle: "Choose Your Path",
    createProject: "Create Project",
    askFollowUp: "Ask a follow-up question...",
    followUpTitle: "Diving Deeper",
    editTask: "Edit Task",
    newTask: "New Task",
    deleteTask: "Delete Task",
    addNote: "Add Note",
    saveTask: "Save Task"
  },
  es: {
    roots: "Raíces",
    branches: "Ramas",
    toolbox: "Herramientas",
    dashboard: "Tablero",
    projects: "Proyectos",
    tasks: "Tareas",
    wisdom: "Sorpréndeme",
    profile: "Perfil",
    signIn: "Entrar",
    signOut: "Salir",
    settings: "Ajustes",
    startHere: "EMPEZAR AQUÍ",
    searchPlaceholder: "Qué tienes en mente...",
    subtitle: "Edita tu Perspectiva. Cambia tu Vida.",
    subsubtitle: "Tu Guía de Campo para Ser Humano.",
    footerQuote: "\"Entre el estímulo y la respuesta hay un espacio...\"",
    about: "Acerca de",
    terms: "Términos de Uso",
    privacy: "Privacidad",
    submitTopic: "Enviar Tema",
    rootsDesc: "Verdades filosóficas profundas.",
    branchesDesc: "Aplicación práctica.",
    toolboxDesc: "Técnicas accionables.",
    wisdomDay: "Sabiduría del Día",
    acceptChallenge: "Aceptar Reto",
    yourMission: "Tu Misión",
    reward: "Recompensa",
    goDeep: "Profundizar",
    goWide: "Expandir",
    getStrong: "Fortalecer",
    backHome: "Volver al Inicio",
    readMore: "Leer Más",
    tryTool: "Probar Herramienta",
    analyzing: "Reenmarcando tu situación...",
    saveToPortal: "Guardar en Portal",
    selectTasks: "Selecciona tareas para añadir:",
    searchResultTitle: "Elige Tu Camino",
    createProject: "Crear Proyecto",
    askFollowUp: "Haz una pregunta de seguimiento...",
    followUpTitle: "Profundizando",
    editTask: "Editar Tarea",
    newTask: "Nueva Tarea",
    deleteTask: "Eliminar Tarea",
    addNote: "Añadir Nota",
    saveTask: "Guardar Tarea"
  }
};

type Language = 'en' | 'es';

// --- Sub-components defined outside App to prevent re-renders ---

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  projects: Project[];
  onSave: (task: Task) => void;
  onDelete: (taskId: string) => void;
  lang: Language;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ isOpen, onClose, task, projects, onSave, onDelete, lang }) => {
  const t = translations[lang];
  const [formData, setFormData] = useState<Partial<Task>>({});
  const [noteInput, setNoteInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setFormData({ ...task });
      } else {
        // Default new task
        setFormData({
          title: '',
          description: '',
          priority: 'Medium',
          isCompleted: false,
          notes: [],
          projectId: projects.length > 0 ? projects[0].id : ''
        });
      }
      setNoteInput('');
    }
  }, [isOpen, task, projects]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.projectId) return;
    
    // Construct full task object
    const savedTask: Task = {
      id: formData.id || Date.now().toString(),
      title: formData.title,
      description: formData.description || '',
      priority: formData.priority || 'Medium',
      isCompleted: formData.isCompleted || false,
      projectId: formData.projectId,
      notes: formData.notes || [],
      dueDate: formData.dueDate
    };
    
    onSave(savedTask);
    onClose();
  };

  const handleAddNote = () => {
    if (!noteInput.trim()) return;
    const newNote: TaskNote = {
      id: Date.now().toString(),
      content: noteInput,
      createdAt: Date.now()
    };
    setFormData(prev => ({
      ...prev,
      notes: [newNote, ...(prev.notes || [])]
    }));
    setNoteInput('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {task ? t.editTask : t.newTask}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Task Title</label>
            <input 
              required
              value={formData.title || ''}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="What needs to be done?"
            />
          </div>

          {/* Project & Priority Row */}
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Project</label>
               <select 
                 required
                 value={formData.projectId || ''}
                 onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                 className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
               >
                 <option value="" disabled>Select Project</option>
                 {projects.map(p => (
                   <option key={p.id} value={p.id}>{p.title}</option>
                 ))}
               </select>
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
               <select 
                 value={formData.priority || 'Medium'}
                 onChange={(e) => setFormData({...formData, priority: e.target.value as Priority})}
                 className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
               >
                 <option value="High">High</option>
                 <option value="Medium">Medium</option>
                 <option value="Low">Low</option>
               </select>
             </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea 
              value={formData.description || ''}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none h-24 resize-none"
              placeholder="Add details..."
            />
          </div>

          {/* Due Date */}
           <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
            <input 
              type="date"
              value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''}
              onChange={(e) => setFormData({...formData, dueDate: e.target.valueAsNumber})}
              className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 bg-white dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          {/* Notes Section */}
          <div className="border-t border-slate-100 dark:border-slate-700 pt-4 mt-4">
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Notes & Updates</label>
             <div className="flex gap-2 mb-3">
               <input 
                 value={noteInput}
                 onChange={(e) => setNoteInput(e.target.value)}
                 className="flex-1 border border-slate-300 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                 placeholder="Add a progress note..."
               />
               <button 
                 type="button" 
                 onClick={handleAddNote}
                 className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 p-2 rounded-lg"
               >
                 <Plus size={18} />
               </button>
             </div>
             
             <div className="space-y-2 max-h-32 overflow-y-auto">
               {formData.notes && formData.notes.length > 0 ? (
                 formData.notes.map(note => (
                   <div key={note.id} className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg text-sm border border-slate-100 dark:border-slate-800/50">
                     <p className="text-slate-700 dark:text-slate-300">{note.content}</p>
                     <p className="text-[10px] text-slate-400 mt-1">{new Date(note.createdAt).toLocaleString()}</p>
                   </div>
                 ))
               ) : (
                 <p className="text-xs text-slate-400 italic">No notes yet.</p>
               )}
             </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 pt-4">
            {task && (
              <button 
                type="button"
                onClick={() => {
                    if(confirm("Are you sure you want to delete this task?")) {
                        onDelete(task.id);
                        onClose();
                    }
                }}
                className="px-4 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-colors"
              >
                <Trash2 size={20} />
              </button>
            )}
            <div className="flex-1"></div>
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              <Save size={18} /> {t.saveTask}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Project Detail Page ---

interface ProjectDetailPageProps {
  project: Project;
  projects: Project[]; // All projects for switching
  onSelectProject: (id: string) => void;
  onBack: () => void;
  onToggleTask: (pid: string, tid: string) => void;
  onUpdatePriority: (pid: string, tid: string, priority: Priority) => void;
  onEditTask: (pid: string, task: Task) => void;
  onAddTask: (pid: string) => void;
  onUpdateProject: (p: Project) => void;
  onNavigateToToolbox: () => void;
  lang: Language;
}

const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ 
  project, projects, onSelectProject, onBack, onToggleTask, onUpdatePriority, onEditTask, onAddTask, onUpdateProject, onNavigateToToolbox, lang 
}) => {
  const [activeTab, setActiveTab] = useState<'Action' | 'Coach'>('Action');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descInput, setDescInput] = useState(project.description);
  const [coachWisdom, setCoachWisdom] = useState<WisdomNugget | null>(null);
  const [loadingWisdom, setLoadingWisdom] = useState(false);

  // Update descInput when project changes (via switcher)
  useEffect(() => {
    setDescInput(project.description);
  }, [project.id, project.description]);

  // Re-calculate stats
  const totalTasks = project.tasks.length;
  const completedTasks = project.tasks.filter(t => t.isCompleted).length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleSaveDesc = () => {
    onUpdateProject({ ...project, description: descInput });
    setIsEditingDesc(false);
  };

  const handleGetCoaching = async () => {
    setLoadingWisdom(true);
    try {
      const wisdom = await getProjectCoaching(project.title, project.description, project.category);
      setCoachWisdom(wisdom);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingWisdom(false);
    }
  };

  const getPriorityColor = (p?: Priority) => {
    switch (p) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-blue-400';
      default: return 'bg-slate-300';
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-fade-in">
       <div className="flex justify-between items-center mb-6">
         {/* Project Switcher Dropdown */}
         <div className="relative group">
           <div className="flex items-center gap-2 text-slate-500 mb-1 text-xs font-medium uppercase tracking-wider">
             Switch Project
           </div>
           <select 
             value={project.id}
             onChange={(e) => onSelectProject(e.target.value)}
             className="appearance-none bg-white dark:bg-slate-800 border-none text-xl md:text-2xl font-bold text-slate-900 dark:text-white pr-8 py-1 focus:ring-0 cursor-pointer hover:text-brand-600 transition-colors w-full max-w-md truncate"
           >
             {projects.map(p => (
               <option key={p.id} value={p.id}>{p.title}</option>
             ))}
           </select>
           <ChevronDown className="absolute right-0 bottom-2 text-slate-400 pointer-events-none" size={20} />
         </div>
         
         <button onClick={onBack} className="text-sm font-medium text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 transition-colors">
           Back to Overview
         </button>
       </div>

       {/* Header Section */}
       <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100 dark:border-slate-700 mb-8 relative overflow-hidden group">
          <div className={`absolute top-0 left-0 w-full h-2 ${
             project.category === 'Career' ? 'bg-blue-500' : 
             project.category === 'Health' ? 'bg-green-500' :
             project.category === 'Spiritual' ? 'bg-purple-500' : 'bg-orange-500'
          }`}></div>
          
          <div className="flex flex-col md:flex-row justify-between gap-8 relative z-10">
             <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                   <span className="text-slate-400 dark:text-slate-500 text-sm flex items-center gap-1">
                     <Calendar size={14} /> Created {new Date(project.createdAt).toLocaleDateString()}
                   </span>
                </div>
                
                <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">{project.title}</h1>
                
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700 max-w-3xl">
                   <div className="flex justify-between items-start mb-2">
                     <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                       <Target size={14} /> The Mission (Your "Why")
                     </h4>
                     {!isEditingDesc && (
                       <button onClick={() => setIsEditingDesc(true)} className="text-slate-400 hover:text-brand-500 p-1">
                         <Edit3 size={14} />
                       </button>
                     )}
                   </div>
                   {isEditingDesc ? (
                     <div className="space-y-3">
                        <textarea 
                           value={descInput}
                           onChange={(e) => setDescInput(e.target.value)}
                           className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                           rows={3}
                        />
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setIsEditingDesc(false)} className="text-xs px-3 py-1 text-slate-500 hover:bg-slate-200 rounded">Cancel</button>
                          <button onClick={handleSaveDesc} className="text-xs px-3 py-1 bg-brand-600 text-white rounded hover:bg-brand-700">Save</button>
                        </div>
                     </div>
                   ) : (
                     <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed">
                       "{project.description}"
                     </p>
                   )}
                </div>
             </div>

             {/* Right Column: Category + Progress Ring */}
             <div className="flex flex-col items-center gap-4">
                 {/* Category Badge - Aligned above progress */}
                 <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide
                     ${project.category === 'Career' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 
                       project.category === 'Health' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                       project.category === 'Spiritual' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                       'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'}`}>
                     {project.category}
                 </span>

                 <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 min-w-[150px]">
                     <div className="relative w-20 h-20 flex items-center justify-center mb-2">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200 dark:text-slate-700" />
                          <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={226} strokeDashoffset={226 - (226 * progress) / 100} className="text-brand-500 transition-all duration-1000 ease-out" />
                        </svg>
                        <span className="absolute text-xl font-bold text-slate-800 dark:text-white">{progress}%</span>
                     </div>
                     <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Completed</p>
                 </div>
             </div>
          </div>
       </div>

       {/* Tabs */}
       <div className="flex gap-8 border-b border-slate-200 dark:border-slate-800 mb-8 px-2">
         <button 
           onClick={() => setActiveTab('Action')}
           className={`pb-4 px-2 text-sm font-bold flex items-center gap-2 transition-all relative ${activeTab === 'Action' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
         >
           <ListTodo size={18} /> Action Plan
           {activeTab === 'Action' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 rounded-t-full"></div>}
         </button>
         <button 
           onClick={() => setActiveTab('Coach')}
           className={`pb-4 px-2 text-sm font-bold flex items-center gap-2 transition-all relative ${activeTab === 'Coach' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
         >
           <Sparkles size={18} /> AI Coach & Wisdom
           {activeTab === 'Coach' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-500 rounded-t-full"></div>}
         </button>
       </div>

       <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="md:col-span-2 space-y-6">
            
            {activeTab === 'Action' && (
              <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Tasks</h3>
                  <button 
                    onClick={() => onAddTask(project.id)}
                    className="flex items-center gap-2 text-sm font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 dark:bg-brand-900/20 dark:text-brand-400 dark:hover:bg-brand-900/40 px-4 py-2 rounded-xl transition-colors"
                  >
                    <Plus size={16} /> Add Task
                  </button>
                </div>
                
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
                  {project.tasks.length === 0 ? (
                    <div className="p-12 text-center">
                       <p className="text-slate-500 mb-4">No tasks yet. Break it down!</p>
                       <button onClick={() => onAddTask(project.id)} className="text-brand-600 font-medium hover:underline">Create first task</button>
                    </div>
                  ) : (
                    project.tasks.map(task => (
                      <div key={task.id} className="p-4 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                         <div 
                           className="mt-1 cursor-pointer"
                           onClick={() => onToggleTask(project.id, task.id)}
                         >
                           {task.isCompleted ? (
                             <CheckCircle className="text-green-500" size={20} />
                           ) : (
                             <div className={`w-5 h-5 rounded-full border-2 hover:border-brand-500 transition-colors ${
                               task.priority === 'High' ? 'border-red-400' : 
                               task.priority === 'Low' ? 'border-blue-300' : 'border-slate-300 dark:border-slate-500'
                             }`}></div>
                           )}
                         </div>
                         <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <span 
                                className={`font-medium text-slate-800 dark:text-slate-200 cursor-pointer hover:text-brand-600 ${task.isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}
                                onClick={() => onEditTask(project.id, task)}
                              >
                                {task.title}
                              </span>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => onEditTask(project.id, task)} className="text-slate-400 hover:text-brand-500">
                                  <Edit3 size={16} />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                               <span className={`flex items-center gap-1 ${task.priority === 'High' ? 'text-red-500' : task.priority === 'Low' ? 'text-blue-500' : 'text-yellow-600'}`}>
                                 <span className={`w-1.5 h-1.5 rounded-full ${getPriorityColor(task.priority)}`}></span>
                                 {task.priority || 'Medium'}
                               </span>
                               {task.dueDate && (
                                 <span className="flex items-center gap-1">
                                   <Calendar size={12} /> {new Date(task.dueDate).toLocaleDateString()}
                                 </span>
                               )}
                               {task.notes && task.notes.length > 0 && (
                                 <span className="flex items-center gap-1">
                                   <MessageCircle size={12} /> {task.notes.length}
                                 </span>
                               )}
                            </div>
                         </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'Coach' && (
              <div className="animate-fade-in space-y-6">
                 <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Sparkles className="text-yellow-300" /> Project Coach</h3>
                    <p className="text-purple-100 mb-6 text-sm leading-relaxed max-w-lg">
                      Need a perspective shift? Ask the AI Coach to analyze your project description and tasks to provide specific wisdom.
                    </p>
                    <button 
                      onClick={handleGetCoaching}
                      disabled={loadingWisdom}
                      className="bg-white text-purple-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-purple-50 transition-colors shadow-md flex items-center gap-2"
                    >
                      {loadingWisdom ? <Loader2 className="animate-spin w-4 h-4" /> : <Lightbulb size={16} />}
                      {coachWisdom ? 'Get New Perspective' : 'Get Insight'}
                    </button>
                 </div>

                 {coachWisdom && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 animate-fade-in-up">
                      <div className="mb-6">
                        <p className="text-xl font-serif italic text-slate-800 dark:text-slate-100 mb-2">"{coachWisdom.quote}"</p>
                        <p className="text-sm font-bold text-slate-500 uppercase">— {coachWisdom.author}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 mb-6">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Why this matters now</h4>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                          {coachWisdom.context}
                        </p>
                      </div>
                      <div className="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                         <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={20} />
                         <div>
                           <h4 className="text-sm font-bold text-green-800 dark:text-green-300 mb-1">Coach's Challenge</h4>
                           <p className="text-sm text-green-700 dark:text-green-400">{coachWisdom.actionableStep}</p>
                         </div>
                      </div>
                    </div>
                 )}
                 
                 {!coachWisdom && !loadingWisdom && (
                   <div className="text-center py-12 text-slate-400">
                     <p>Click "Get Insight" to unlock specific wisdom for this project.</p>
                   </div>
                 )}
              </div>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
             <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
               <h4 className="font-bold text-slate-800 dark:text-white mb-4 text-sm uppercase">Quick Stats</h4>
               <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500">Completed</span>
                   <span className="font-bold text-green-600">{completedTasks}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500">Remaining</span>
                   <span className="font-bold text-slate-800 dark:text-white">{totalTasks - completedTasks}</span>
                 </div>
               </div>
             </div>

             <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-6 border border-orange-100 dark:border-orange-800/30">
                <h4 className="font-bold text-orange-800 dark:text-orange-300 mb-2 text-sm uppercase flex items-center gap-2">
                  <Wrench size={16} /> Stuck?
                </h4>
                <p className="text-xs text-orange-700 dark:text-orange-400 mb-4 leading-relaxed">
                  If you're procrastinating on this project, try the <strong>"5-Minute Rule"</strong>. Commit to working on it for just 5 minutes. Usually, that's enough to break the inertia.
                </p>
                <button 
                  onClick={onNavigateToToolbox}
                  className="text-xs font-bold text-orange-600 hover:text-orange-800 dark:hover:text-orange-300 underline"
                >
                  Read more in Toolbox
                </button>
             </div>
          </div>
       </div>
    </div>
  );
};

interface AllTasksViewProps {
  projects: Project[];
  onToggleTask: (pid: string, tid: string) => void;
  onEditTask: (pid: string, task: Task) => void;
  lang: Language;
}

const AllTasksView: React.FC<AllTasksViewProps> = ({ projects, onToggleTask, onEditTask, lang }) => {
  const [filter, setFilter] = useState<'All' | 'Active' | 'Completed'>('All');
  const t = translations[lang];

  const allTasks = projects.flatMap(p => p.tasks.map(t => ({ ...t, projectId: p.id, projectTitle: p.title })));
  
  const filteredTasks = allTasks.filter(task => {
    if (filter === 'Active') return !task.isCompleted;
    if (filter === 'Completed') return task.isCompleted;
    return true;
  });

  // Sort by due date (if any) then priority
  filteredTasks.sort((a, b) => {
    // High priority first
    const pWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
    const wa = pWeight[a.priority || 'Medium'];
    const wb = pWeight[b.priority || 'Medium'];
    return wb - wa;
  });

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t.tasks}</h2>
        <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
           {['All', 'Active', 'Completed'].map(f => (
             <button
               key={f}
               onClick={() => setFilter(f as any)}
               className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                 filter === f 
                 ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300' 
                 : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
               }`}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700 overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 italic">
            No tasks found.
          </div>
        ) : (
          filteredTasks.map(task => (
            <div 
              key={`${task.projectId}-${task.id}`} 
              className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group flex items-start gap-4"
            >
               {/* Radio Button Area - Toggle */}
               <div 
                 className="pt-1 cursor-pointer"
                 onClick={(e) => { e.stopPropagation(); onToggleTask(task.projectId, task.id); }}
               >
                 {task.isCompleted ? (
                   <CheckCircle className="text-green-500" size={20} />
                 ) : (
                   <div className={`w-5 h-5 rounded-full border-2 ${
                     task.priority === 'High' ? 'border-red-400' : 
                     task.priority === 'Low' ? 'border-blue-300' : 'border-slate-300 dark:border-slate-500'
                   } hover:border-brand-500 transition-colors`}></div>
                 )}
               </div>
               
               <div className="flex-1 min-w-0">
                 <div className="flex justify-between items-start">
                    {/* Title Area - Edit */}
                    <p 
                      className={`font-medium truncate cursor-pointer hover:text-brand-600 dark:hover:text-brand-400 transition-colors ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-200'}`}
                      onClick={(e) => { e.stopPropagation(); onEditTask(task.projectId, task); }}
                    >
                      {task.title}
                    </p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onEditTask(task.projectId, task); }}
                      className="text-slate-300 hover:text-brand-600 dark:text-slate-600 dark:hover:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    >
                      <Edit3 size={16} />
                    </button>
                 </div>
                 <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">
                       {task.projectTitle}
                    </span>
                    {task.priority && (
                      <span className={`${
                        task.priority === 'High' ? 'text-red-500' : 
                        task.priority === 'Low' ? 'text-blue-500' : 'text-yellow-600'
                      }`}>
                        {task.priority}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    {task.notes && task.notes.length > 0 && (
                      <span className="flex items-center gap-1">
                        <MessageCircle size={12} /> {task.notes.length}
                      </span>
                    )}
                 </div>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};


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
        isCompleted: false,
        priority: 'Medium' // Default priority
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

// --- Login Modal ---

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [photoName, setPhotoName] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFullName('');
      setPhotoName(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      const result = await signInWithSocial('google');
      if (result.user) {
          // Type assertion to fix type mismatch if partial user returned
          onLoginSuccess(result.user as User);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        if (password.length < 6) {
           throw new Error("Password must be at least 6 characters.");
        }
        
        const result = await signUpWithEmail(email, password, fullName);
        if (result.user) onLoginSuccess(result.user as User);
      } else {
        const result = await loginWithEmail(email, password);
        if (result.user) onLoginSuccess(result.user as User);
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoName(e.target.files[0].name);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-8 shadow-2xl border border-slate-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleEmailAuth} className="space-y-4">
          
          {isSignUp && (
            <>
              <div className="flex justify-center mb-4">
                <label className="cursor-pointer group relative">
                  <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600 group-hover:border-brand-500 transition-colors">
                     {photoName ? (
                       <span className="text-xs text-center text-brand-600 px-2 truncate w-full">{photoName}</span>
                     ) : (
                       <Upload size={24} className="text-slate-400 group-hover:text-brand-500" />
                     )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  <span className="text-[10px] text-center block mt-1 text-slate-400">Add Photo</span>
                </label>
              </div>

              <div className="relative">
                <UserIcon className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 dark:text-white text-sm"
                />
              </div>
            </>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              type="email"
              placeholder="Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 dark:text-white text-sm"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 dark:text-white text-sm"
            />
          </div>

          {isSignUp && (
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="password"
                placeholder="Repeat Password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 dark:text-white text-sm"
              />
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 text-xs rounded-lg text-center">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm disabled:opacity-70 flex justify-center"
          >
            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
          <span className="text-xs text-slate-400">OR</span>
          <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white py-3 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm text-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26c.46-1.4 1.83-2.43 3.41-2.43z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>

        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-medium"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};


const NavButton = ({ active, onClick, icon, label, onAdd }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, onAdd?: () => void }) => (
  <div 
    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors duration-200 group
      ${active ? 'bg-brand-50 dark:bg-slate-800 text-brand-700 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}
    `}
  >
    <button onClick={onClick} className="flex items-center gap-3 flex-1 text-sm font-medium text-left">
      <span className={active ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}>{icon}</span>
      {label}
    </button>
    
    {onAdd && (
      <button 
        onClick={(e) => { e.stopPropagation(); onAdd(); }}
        className={`p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity
           ${active ? 'hover:bg-brand-100 dark:hover:bg-slate-700 text-brand-600' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-brand-500'}
        `}
      >
        <Plus size={16} />
      </button>
    )}
  </div>
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

const LanguageToggle = ({ lang, toggleLang }: { lang: Language; toggleLang: () => void }) => (
  <button 
    onClick={toggleLang}
    className="flex items-center gap-1 px-2 py-1 rounded-md text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors text-xs font-bold"
    aria-label="Toggle Language"
  >
    {lang === 'en' ? 'ES' : 'EN'}
  </button>
);

// --- Dedicated Product Pages ---

const RootsPage: React.FC<{ onBack: () => void, lang: Language }> = ({ onBack, lang }) => {
  const t = translations[lang];
  return (
    <div className="animate-fade-in pt-10 pb-20 px-4 max-w-4xl mx-auto">
      <button onClick={onBack} className="flex items-center text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 mb-8 transition-colors">
        <ArrowLeft size={20} className="mr-2" /> {t.backHome}
      </button>
      
      <div className="text-center mb-16">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Sprout size={40} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">{t.roots}</h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          {t.rootsDesc} {lang === 'en' ? 'Understanding the fundamental truths that govern our reality.' : 'Entendiendo las verdades fundamentales que gobiernan nuestra realidad.'}
        </p>
      </div>

      <div className="grid gap-12">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">{lang === 'en' ? 'Control vs. Chaos' : 'Control vs. Caos'}</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              {lang === 'en' 
                ? 'Discover what you can control and what you cannot. The root of suffering often lies in trying to control the uncontrollable.' 
                : 'Descubre qué puedes controlar y qué no. La raíz del sufrimiento a menudo reside en tratar de controlar lo incontrolable.'}
            </p>
            <div className="flex flex-wrap gap-2">
               {['Stoicism', 'Acceptance', 'Power'].map(tag => (
                 <span key={tag} className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">#{tag}</span>
               ))}
            </div>
          </div>
          <div className="w-full md:w-1/3 h-48 bg-green-50 dark:bg-green-900/10 rounded-2xl flex items-center justify-center">
             <BookOpen size={48} className="text-green-300 dark:text-green-700" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row-reverse gap-8 items-center">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">{lang === 'en' ? 'Impermanence' : 'Impermanencia'}</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
               {lang === 'en' 
                ? 'Everything changes. Embracing this truth allows us to let go of fear and cherish the present moment.'
                : 'Todo cambia. Abrazar esta verdad nos permite soltar el miedo y apreciar el momento presente.'}
            </p>
             <div className="flex flex-wrap gap-2">
               {['Time', 'Change', 'Present'].map(tag => (
                 <span key={tag} className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">#{tag}</span>
               ))}
            </div>
          </div>
          <div className="w-full md:w-1/3 h-48 bg-green-50 dark:bg-green-900/10 rounded-2xl flex items-center justify-center">
             <Clock size={48} className="text-green-300 dark:text-green-700" />
          </div>
        </div>
      </div>
    </div>
  );
};

const BranchesPage: React.FC<{ onBack: () => void, lang: Language }> = ({ onBack, lang }) => {
  const t = translations[lang];
  return (
     <div className="animate-fade-in pt-10 pb-20 px-4 max-w-4xl mx-auto">
      <button onClick={onBack} className="flex items-center text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 mb-8 transition-colors">
        <ArrowLeft size={20} className="mr-2" /> {t.backHome}
      </button>
      
      <div className="text-center mb-16">
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <GitFork size={40} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">{t.branches}</h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          {t.branchesDesc} {lang === 'en' ? 'Applying wisdom to the various aspects of our daily lives.' : 'Aplicando sabiduría a los varios aspectos de nuestra vida diaria.'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
         {[
           { icon: <Briefcase />, title: lang === 'en' ? 'Career' : 'Carrera', desc: lang === 'en' ? 'Navigating ambition, burnout, and purpose.' : 'Navegando ambición, agotamiento y propósito.' },
           { icon: <Heart />, title: lang === 'en' ? 'Relationships' : 'Relaciones', desc: lang === 'en' ? 'Communication, boundaries, and empathy.' : 'Comunicación, límites y empatía.' },
           { icon: <DollarSign />, title: lang === 'en' ? 'Finance' : 'Finanzas', desc: lang === 'en' ? 'Money as a tool, not a master.' : 'El dinero como herramienta, no como amo.' },
           { icon: <Globe />, title: lang === 'en' ? 'Community' : 'Comunidad', desc: lang === 'en' ? 'Finding your place and contributing.' : 'Encontrando tu lugar y contribuyendo.' }
         ].map((item, i) => (
           <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{item.title}</h3>
              <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
           </div>
         ))}
      </div>
    </div>
  );
};

const ToolboxPage: React.FC<{ onBack: () => void, lang: Language }> = ({ onBack, lang }) => {
  const t = translations[lang];
  return (
    <div className="animate-fade-in pt-10 pb-20 px-4 max-w-4xl mx-auto">
      <button onClick={onBack} className="flex items-center text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 mb-8 transition-colors">
        <ArrowLeft size={20} className="mr-2" /> {t.backHome}
      </button>
      
      <div className="text-center mb-16">
        <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Wrench size={40} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">{t.toolbox}</h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          {t.toolboxDesc} {lang === 'en' ? 'Specific mental models and techniques to use in the moment.' : 'Modelos mentales específicos y técnicas para usar en el momento.'}
        </p>
      </div>

       <div className="space-y-6">
         {[
           { title: lang === 'en' ? 'The "Pause" Button' : 'El Botón de "Pausa"', desc: lang === 'en' ? 'Stop. Take a breath. Observe. Proceed. A simple heuristic to break reactivity.' : 'Para. Respira. Observa. Procede. Una heurística simple para romper la reactividad.' },
           { title: lang === 'en' ? 'The "I" Statement' : 'La Declaración "Yo"', desc: lang === 'en' ? 'Shift conflict by owning your feelings instead of accusing others.' : 'Cambia el conflicto adueñándote de tus sentimientos en lugar de acusar a otros.' },
           { title: lang === 'en' ? 'Journaling' : 'Diario', desc: lang === 'en' ? 'Getting thoughts out of your head and onto paper to gain objectivity.' : 'Sacar pensamientos de tu cabeza al papel para ganar objetividad.' }
         ].map((tool, i) => (
           <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex gap-4 items-start">
              <div className="mt-1 text-orange-500 bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg">
                <Wrench size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">{tool.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{tool.desc}</p>
                <button className="mt-3 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline">{t.tryTool} &rarr;</button>
              </div>
           </div>
         ))}
       </div>
    </div>
  );
};

// --- Portal Search Helper Component ---

interface PortalHeaderProps {
  title: string;
  onSearch: (query: string) => void;
  lang: Language;
  rightAction?: React.ReactNode;
}

const PortalHeader: React.FC<PortalHeaderProps> = ({ title, onSearch, lang, rightAction }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const t = translations[lang];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex-shrink-0">{title}</h2>
      
      <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto md:ml-auto">
        {/* Search Bar - Expanded */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80 lg:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-all shadow-sm"
            placeholder={t.searchPlaceholder}
          />
        </form>
        
        {/* Action Button (New Project, etc) */}
        {rightAction && (
          <div className="flex-shrink-0">
            {rightAction}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Missing Components Implementation ---

interface SearchResultsPageProps {
  results: SearchResult | null;
  loading: boolean;
  onSave: (variation: ReframeVariation) => void;
  t: any;
  lang: Language;
}

const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ results, loading, onSave, t, lang }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
        <p className="text-slate-500 animate-pulse">{t.analyzing}</p>
      </div>
    );
  }

  if (!results) return null;

  return (
    <div className="space-y-8 animate-fade-in">
       <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-2">Original Thought</p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-6">"{results.query}"</h2>
          <div className="h-1 w-20 bg-brand-500 rounded-full mx-auto"></div>
       </div>

       <div className="grid md:grid-cols-3 gap-6">
         {results.variations.map((variation, idx) => (
           <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className={`absolute top-0 left-0 w-full h-1.5 ${
                variation.type === 'ROOTS' ? 'bg-green-500' :
                variation.type === 'BRANCHES' ? 'bg-blue-500' : 'bg-orange-500'
              }`}></div>
              
              <div className="flex justify-between items-start mb-4">
                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    variation.type === 'ROOTS' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                    variation.type === 'BRANCHES' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                 }`}>
                   {variation.type}
                 </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{variation.title}</h3>
              
              <div className="mb-4 flex-1">
                 <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
                   {variation.context}
                 </p>
                 <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl mb-4">
                   <p className="text-xs text-slate-500 dark:text-slate-400 italic">"{variation.quote}"</p>
                   <p className="text-xs text-slate-400 text-right mt-1">— {variation.author}</p>
                 </div>
                 
                 <div className="space-y-2">
                   <p className="text-xs font-bold text-slate-500 uppercase">Action Plan:</p>
                   {variation.suggestedTasks.map((task, i) => (
                     <div key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                       <CheckCircle size={14} className="text-brand-500" />
                       {task}
                     </div>
                   ))}
                 </div>
              </div>

              <button 
                onClick={() => onSave(variation)}
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
              >
                {t.saveToPortal} <ArrowRight size={16} />
              </button>
           </div>
         ))}
       </div>
    </div>
  );
};

interface LandingPageContentProps {
  onSearch: (query: string) => void;
  t: any;
  setLandingView: (view: View | null) => void;
  lang: Language;
}

const LandingPageContent: React.FC<LandingPageContentProps> = ({ onSearch, t, setLandingView, lang }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(query.trim()) onSearch(query);
  }

  return (
    <div className="animate-fade-in">
       {/* Hero Section */}
       <div className="relative pt-20 pb-32 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-brand-500/20 rounded-full blur-[100px] -z-10 opacity-50 dark:opacity-20"></div>
          
          <div className="max-w-4xl mx-auto px-4 text-center">
             <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-1.5 mb-8 shadow-sm animate-fade-in-up">
               <Sparkles size={14} className="text-brand-500" />
               <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">{t.subsubtitle}</span>
             </div>
             
             <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 leading-tight">
               {t.subtitle.split('.')[0]}.<br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600 dark:from-brand-400 dark:to-purple-400">
                 {t.subtitle.split('.')[1]}.
               </span>
             </h1>
             
             <p className="text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
               Reframe uses AI to help you shift your perspective using ancient wisdom and practical mental models.
             </p>

             <form onSubmit={handleSubmit} className="max-w-xl mx-auto relative group">
                <div className="absolute inset-0 bg-brand-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-white dark:bg-slate-800 rounded-2xl p-2 shadow-xl border border-slate-100 dark:border-slate-700 flex items-center">
                   <div className="pl-4 text-slate-400">
                     <Search size={20} />
                   </div>
                   <input 
                     value={query}
                     onChange={(e) => setQuery(e.target.value)}
                     className="flex-1 bg-transparent border-none focus:ring-0 text-lg px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400"
                     placeholder={t.searchPlaceholder}
                   />
                   <button 
                     type="submit"
                     className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-6 py-3 font-bold transition-colors"
                   >
                     Reframe
                   </button>
                </div>
             </form>
          </div>
       </div>

       {/* Features Grid */}
       <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="grid md:grid-cols-3 gap-8">
             <div 
               onClick={() => setLandingView(View.ROOTS)}
               className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
             >
                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Sprout size={28} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{t.roots}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  {t.rootsDesc} {lang === 'en' ? 'Philosophy, Stoicism, and First Principles.' : 'Filosofía, Estoicismo y Primeros Principios.'}
                </p>
                <span className="text-brand-600 dark:text-brand-400 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                  Explore Roots <ArrowRight size={16} />
                </span>
             </div>

             <div 
               onClick={() => setLandingView(View.BRANCHES)}
               className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
             >
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <GitFork size={28} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{t.branches}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  {t.branchesDesc} {lang === 'en' ? 'Applied wisdom for Career, Relationships, and Life.' : 'Sabiduría aplicada para Carrera, Relaciones y Vida.'}
                </p>
                <span className="text-brand-600 dark:text-brand-400 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                  Explore Branches <ArrowRight size={16} />
                </span>
             </div>

             <div 
               onClick={() => setLandingView(View.TOOLBOX)}
               className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
             >
                <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Wrench size={28} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{t.toolbox}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  {t.toolboxDesc} {lang === 'en' ? 'Mental models, frameworks, and immediate fixes.' : 'Modelos mentales, marcos y arreglos inmediatos.'}
                </p>
                <span className="text-brand-600 dark:text-brand-400 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
                  Open Toolbox <ArrowRight size={16} />
                </span>
             </div>
          </div>
       </div>

       {/* Wisdom Section */}
       <div className="bg-slate-900 text-white py-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px]"></div>
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
             <Sparkles className="w-8 h-8 text-yellow-400 mx-auto mb-6" />
             <h2 className="text-3xl md:text-4xl font-bold mb-8">"{t.footerQuote}"</h2>
             <p className="text-xl text-slate-300 mb-8">— Viktor Frankl</p>
             <button onClick={() => setLandingView(View.ROOTS)} className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold hover:bg-slate-100 transition-colors">
               Start Reframing
             </button>
          </div>
       </div>
    </div>
  );
};


// --- Portal Main Component ---
// (Defined before App to be used in App)

interface PortalProps { 
  user: User; 
  view: View; 
  setView: (v: View) => void;
  projects: Project[];
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  onAddProject: () => void;
  onToggleTask: (pid: string, tid: string) => void;
  onDeleteProject: (pid: string) => void;
  onUpdatePriority: (pid: string, tid: string, priority: Priority) => void;
  onEditTask: (pid: string, task: Task) => void;
  onNewTask: () => void;
  onAddTask: (pid: string) => void;
  onUpdateProject: (p: Project) => void;
  searchResults: SearchResult | null;
  onSearch: (q: string) => void;
  loadingSearch: boolean;
  onSaveSearchResult: (v: ReframeVariation) => void;
  t: any;
  lang: Language;
  onLogout: () => void;
}

const Portal: React.FC<PortalProps> = ({ 
  user, view, setView, projects, activeProjectId, setActiveProjectId, onAddProject, onToggleTask, onDeleteProject, onUpdatePriority, onEditTask, onNewTask, onAddTask, onUpdateProject,
  searchResults, onSearch, loadingSearch, onSaveSearchResult, t, lang, onLogout
}) => {
  const [filter, setFilter] = useState<'All' | 'Personal' | 'Career' | 'Health' | 'Spiritual'>('All');

  const filteredProjects = filter === 'All' ? projects : projects.filter(p => p.category === filter);

  const activeProject = projects.find(p => p.id === activeProjectId);

  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
    setView(View.PROJECT_DETAIL);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full">
        <div className="p-6">
           <div className="flex items-center gap-3 mb-8">
             <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-900/50 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-lg border border-brand-100 dark:border-brand-800">
                {user.photoURL ? <img src={user.photoURL} alt="User" className="w-full h-full rounded-full" /> : user.displayName?.[0] || 'U'}
             </div>
             <div>
               <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{user.displayName}</p>
               <p className="text-xs text-slate-500 dark:text-slate-400">Level 3 Explorer</p>
             </div>
           </div>

           <nav className="space-y-1">
             <NavButton active={view === View.DASHBOARD} onClick={() => setView(View.DASHBOARD)} icon={<LayoutDashboard size={20} />} label={t.dashboard} />
             <NavButton 
               active={view === View.PROJECTS || view === View.PROJECT_DETAIL} 
               onClick={() => setView(View.PROJECTS)} 
               icon={<Briefcase size={20} />} 
               label={t.projects} 
               onAdd={onAddProject}
             />
             <NavButton 
               active={view === View.TASKS} 
               onClick={() => setView(View.TASKS)} 
               icon={<CheckSquare size={20} />} 
               label={t.tasks} 
               onAdd={onNewTask}
             />
             <NavButton active={view === View.WISDOM} onClick={() => setView(View.WISDOM)} icon={<Lightbulb size={20} />} label={t.wisdom} />
             {/* Profile Removed from here as requested */}
           </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-slate-100 dark:border-slate-800">
           <div className="bg-brand-50 dark:bg-brand-900/20 rounded-xl p-4 mb-4">
             <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300 font-bold text-sm mb-2">
               <Zap size={16} /> Daily Streak
             </div>
             <p className="text-xs text-brand-600 dark:text-brand-400">You've logged in 3 days in a row! Keep it up!</p>
           </div>
           
           <div className="flex items-center justify-between pt-2">
              <button 
                onClick={() => setView(View.PROFILE)} 
                className="p-2 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                title={t.settings}
              >
                <Settings size={20} />
              </button>
              <button 
                onClick={() => setView(View.PROFILE)} 
                className="p-2 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                title={t.profile}
              >
                <UserCircle size={20} />
              </button>
              <button 
                onClick={onLogout} 
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title={t.signOut}
              >
                <LogOut size={20} />
              </button>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950">
         {/* Mobile Header for Portal (can be added if sidebar is strictly hidden, but we have global hamburger) */}
         
         <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
           {view === View.DASHBOARD && (
             <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
               <PortalHeader 
                  title={t.dashboard} 
                  onSearch={onSearch} 
                  lang={lang} 
                  // New Task button removed as requested
               />
               
               {/* Quick Stats */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-1">Active Projects</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{projects.length}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-1">Pending Tasks</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{projects.reduce((acc, p) => acc + p.tasks.filter(t => !t.isCompleted).length, 0)}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-1">Wisdom XP</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">1,250</p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-1">Focus</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">85%</p>
                  </div>
               </div>

               {/* Recent Projects */}
               <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Projects</h3>
                    <button onClick={() => setView(View.PROJECTS)} className="text-sm text-brand-600 dark:text-brand-400 hover:underline">View All</button>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {projects.slice(0, 3).map(project => (
                      <ProjectCard 
                        key={project.id} 
                        project={project} 
                        onSelect={handleSelectProject} 
                        onToggleTask={onToggleTask}
                        onDelete={onDeleteProject}
                        onUpdatePriority={onUpdatePriority}
                        onEditTask={onEditTask}
                      />
                    ))}
                    {projects.length === 0 && (
                      <div className="col-span-full py-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                         <p className="text-slate-500 dark:text-slate-400 mb-4">No projects yet.</p>
                         <button onClick={onAddProject} className="text-brand-600 font-medium hover:underline">Create your first project</button>
                      </div>
                    )}
                  </div>
               </div>
             </div>
           )}

           {view === View.PROJECTS && (
             <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
               <PortalHeader 
                  title={t.projects} 
                  onSearch={onSearch} 
                  lang={lang} 
                  rightAction={
                    <button 
                      onClick={onAddProject}
                      className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg shadow-brand-500/20 w-full justify-center md:w-auto"
                    >
                      <Plus size={18} /> {t.createProject}
                    </button>
                  }
               />
               
               {/* Filters */}
               <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {['All', 'Personal', 'Career', 'Health', 'Spiritual'].map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setFilter(cat as any)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${filter === cat ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                    >
                      {cat}
                    </button>
                  ))}
               </div>

               <div className="grid md:grid-cols-2 gap-6">
                 {filteredProjects.map(project => (
                    <ProjectCard 
                      key={project.id} 
                      project={project} 
                      onSelect={handleSelectProject} 
                      onToggleTask={onToggleTask}
                      onDelete={onDeleteProject}
                      onUpdatePriority={onUpdatePriority}
                      onEditTask={onEditTask}
                    />
                 ))}
               </div>
             </div>
           )}

           {view === View.PROJECT_DETAIL && activeProject && (
              <ProjectDetailPage 
                project={activeProject}
                projects={projects}
                onSelectProject={handleSelectProject}
                onBack={() => setView(View.PROJECTS)}
                onToggleTask={onToggleTask}
                onUpdatePriority={onUpdatePriority}
                onEditTask={onEditTask}
                onAddTask={onAddTask}
                onUpdateProject={onUpdateProject}
                onNavigateToToolbox={() => setView(View.TOOLBOX)}
                lang={lang}
              />
           )}

           {view === View.TASKS && (
             <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                <PortalHeader 
                  title={t.tasks} 
                  onSearch={onSearch} // Can filter tasks locally or globally
                  lang={lang} 
                  rightAction={
                    <button 
                      onClick={onNewTask}
                      className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-lg w-full justify-center md:w-auto"
                    >
                      <Plus size={18} /> {t.newTask}
                    </button>
                  }
               />
               <AllTasksView 
                 projects={projects} 
                 onToggleTask={onToggleTask}
                 onEditTask={onEditTask}
                 lang={lang}
               />
             </div>
           )}

           {view === View.SEARCH_RESULTS && (
              <div className="max-w-7xl mx-auto animate-fade-in pb-20">
                 <button onClick={() => setView(View.DASHBOARD)} className="flex items-center text-slate-500 hover:text-brand-600 mb-6">
                   <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
                 </button>
                 <SearchResultsPage 
                   results={searchResults} 
                   loading={loadingSearch} 
                   onSave={onSaveSearchResult}
                   t={t}
                   lang={lang}
                 />
              </div>
           )}

           {(view === View.WISDOM || view === View.ROOTS || view === View.BRANCHES || view === View.TOOLBOX) && (
              <div className="max-w-3xl mx-auto py-8 animate-fade-in">
                 <WisdomGenerator />
                 <div className="mt-12 text-center text-slate-400 text-sm">
                   More modules coming soon...
                 </div>
              </div>
           )}
         </div>
      </div>
    </div>
  );
};


// --- App Component ---

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];

  // Views
  const [landingView, setLandingView] = useState<View | null>(null); // Null = Home
  const [portalView, setPortalView] = useState<View>(View.DASHBOARD);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  
  // Data
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [pendingProject, setPendingProject] = useState<Project | null>(null);

  // Modals & Mobile Menu
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Theme Init
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }

    // Auth Init using modular subscription helper
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);
  const toggleLang = () => setLang(l => l === 'en' ? 'es' : 'en');

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setPortalView(View.DASHBOARD);
    setLandingView(null);
    window.scrollTo(0, 0);
  };

  const handleAddProject = (project: Project) => {
    setProjects([project, ...projects]);
    if (user) {
      setPortalView(View.PROJECTS);
    }
  };

  const handleSearch = async (query: string) => {
    // Navigate to results view
    if (user) {
      setPortalView(View.SEARCH_RESULTS);
    } else {
      setLandingView(View.SEARCH_RESULTS);
    }

    // Reset previous results while loading
    setSearchResults(null);

    try {
      const result = await analyzeSituation(query);
      setSearchResults(result);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSearchResult = (variation: ReframeVariation) => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: variation.title,
      description: variation.context,
      category: 'Personal',
      progress: 0,
      tasks: variation.suggestedTasks.map((t, i) => ({
        id: `task-${i}`,
        title: t,
        isCompleted: false,
        priority: 'Medium'
      })),
      createdAt: Date.now()
    };

    if (user) {
      handleAddProject(newProject);
      setPortalView(View.PROJECTS);
    } else {
      setPendingProject(newProject);
      setIsLoginOpen(true);
    }
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    if (pendingProject) {
      setProjects([pendingProject, ...projects]);
      setPendingProject(null);
      setPortalView(View.PROJECTS);
    }
  };

  // --- Task CRUD Handlers ---

  const handleToggleTask = (projectId: string, taskId: string) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: p.tasks.map(t => t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t)
        };
      }
      return p;
    }));
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
    if (activeProjectId === projectId) {
      setActiveProjectId(null);
      setPortalView(View.PROJECTS);
    }
  };

  const handleUpdatePriority = (projectId: string, taskId: string, priority: Priority) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: p.tasks.map(t => t.id === taskId ? { ...t, priority } : t)
        };
      }
      return p;
    }));
  };

  const handleOpenEditTask = (projectId: string, task: Task) => {
    setEditingTask({ ...task, projectId });
    setIsTaskModalOpen(true);
  };

  const handleOpenNewTask = () => {
    setEditingTask(null); // Clear for new task
    setIsTaskModalOpen(true);
  };

  const handleAddTaskToProject = (projectId: string) => {
    setEditingTask({ 
      id: '', // New task
      title: '', 
      isCompleted: false, 
      projectId: projectId, 
      priority: 'Medium' 
    });
    setIsTaskModalOpen(true);
  }

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
  }

  const handleSaveTask = (task: Task) => {
    if (editingTask && editingTask.id) {
        // Update Existing
        setProjects(projects.map(p => {
            if (p.id === task.projectId) {
                return {
                    ...p,
                    tasks: p.tasks.map(t => t.id === task.id ? task : t)
                };
            }
            return p;
        }));
    } else {
        // Create New
        setProjects(projects.map(p => {
            if (p.id === task.projectId) {
                return {
                    ...p,
                    tasks: [...p.tasks, task]
                };
            }
            return p;
        }));
    }
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
      // Find project first
      const project = projects.find(p => p.tasks.some(t => t.id === taskId));
      if(!project) return;

      setProjects(projects.map(p => {
          if (p.id === project.id) {
              return {
                  ...p,
                  tasks: p.tasks.filter(t => t.id !== taskId)
              };
          }
          return p;
      }));
      setIsTaskModalOpen(false);
      setEditingTask(null);
  };

  // --- Views ---

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-brand-500/20 ${darkMode ? 'dark' : ''}`}>
      
      {/* --- Global Persistent Header --- */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => {
               if (user) {
                   setPortalView(View.DASHBOARD);
               } else {
                   setLandingView(null);
               }
               window.scrollTo(0,0);
            }}
          >
            <div className="relative w-8 h-8">
               <div className="absolute inset-0 bg-brand-500 rounded-lg rotate-3 opacity-20 animate-pulse"></div>
               <div className="absolute inset-0 bg-brand-600 rounded-lg -rotate-3 flex items-center justify-center text-white">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5">
                   <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                   <path d="M3 3v5h5" />
                   <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                   <path d="M16 21h5v-5" />
                 </svg>
               </div>
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">Reframe</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => user ? setPortalView(View.ROOTS) : setLandingView(View.ROOTS)} 
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              {t.roots}
            </button>
            <button 
              onClick={() => user ? setPortalView(View.BRANCHES) : setLandingView(View.BRANCHES)} 
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              {t.branches}
            </button>
            <button 
              onClick={() => user ? setPortalView(View.TOOLBOX) : setLandingView(View.TOOLBOX)} 
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              {t.toolbox}
            </button>
          </nav>

          {/* Right Actions (Visible on Mobile & Desktop) */}
          <div className="flex items-center gap-3">
             {/* Language (Desktop Only) */}
             <div className="hidden md:flex items-center gap-2 border-r border-slate-200 dark:border-slate-700 pr-3 mr-1">
                <LanguageToggle lang={lang} toggleLang={toggleLang} />
             </div>

             {/* Theme Toggle (Always Visible) */}
             <ThemeToggle darkMode={darkMode} toggleTheme={toggleTheme} />

             {/* Auth Button */}
             {user ? (
               <div className="relative group z-50">
                 <button className="flex items-center gap-2 pl-2">
                    <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold border border-brand-200 dark:border-brand-800">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        user.displayName ? user.displayName[0].toUpperCase() : 'U'
                      )}
                    </div>
                 </button>
                 
                 {/* User Dropdown */}
                 <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 p-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all transform origin-top-right">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                      <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user.displayName || 'User'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    </div>
                    <button onClick={() => setPortalView(View.PROFILE)} className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2">
                      <UserCircle size={16} /> {t.profile}
                    </button>
                    <button onClick={() => setPortalView(View.PROFILE)} className="w-full text-left px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2">
                      <Settings size={16} /> {t.settings}
                    </button>
                    <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2">
                      <LogOut size={16} /> {t.signOut}
                    </button>
                 </div>
               </div>
             ) : (
               <button 
                 onClick={() => setIsLoginOpen(true)}
                 className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-full font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center gap-2"
               >
                 <UserCircle size={18} />
                 <span className="hidden sm:inline">{t.signIn}</span>
               </button>
             )}

             {/* Mobile Menu Button */}
             <button 
               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
               className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
             >
               {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
             </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
           <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-fade-in-down">
              <div className="px-4 py-4 space-y-2">
                <button 
                   onClick={() => { setMobileMenuOpen(false); user ? setPortalView(View.ROOTS) : setLandingView(View.ROOTS); }}
                   className="block w-full text-left px-4 py-3 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  {t.roots}
                </button>
                <button 
                   onClick={() => { setMobileMenuOpen(false); user ? setPortalView(View.BRANCHES) : setLandingView(View.BRANCHES); }}
                   className="block w-full text-left px-4 py-3 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  {t.branches}
                </button>
                <button 
                   onClick={() => { setMobileMenuOpen(false); user ? setPortalView(View.TOOLBOX) : setLandingView(View.TOOLBOX); }}
                   className="block w-full text-left px-4 py-3 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  {t.toolbox}
                </button>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-2 mt-2">
                   <button 
                     onClick={() => { toggleLang(); setMobileMenuOpen(false); }}
                     className="block w-full text-left px-4 py-3 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                   >
                     Language: <span className="font-bold">{lang === 'en' ? 'English' : 'Español'}</span>
                   </button>
                </div>
              </div>
           </div>
        )}
      </header>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col">
         {user ? (
            <Portal 
              user={user} 
              view={portalView} 
              setView={setPortalView} 
              projects={projects}
              activeProjectId={activeProjectId}
              setActiveProjectId={setActiveProjectId}
              onAddProject={() => setIsNewProjectOpen(true)}
              onToggleTask={handleToggleTask}
              onDeleteProject={handleDeleteProject}
              onUpdatePriority={handleUpdatePriority}
              onEditTask={handleOpenEditTask}
              onNewTask={handleOpenNewTask}
              onAddTask={handleAddTaskToProject}
              onUpdateProject={handleUpdateProject}
              searchResults={searchResults}
              onSearch={handleSearch}
              loadingSearch={loading && !searchResults} 
              onSaveSearchResult={handleSaveSearchResult}
              t={t}
              lang={lang}
              onLogout={handleLogout}
            />
         ) : (
           <div className="flex-1 overflow-y-auto">
             {landingView === View.ROOTS ? (
               <RootsPage onBack={() => setLandingView(null)} lang={lang} />
             ) : landingView === View.BRANCHES ? (
               <BranchesPage onBack={() => setLandingView(null)} lang={lang} />
             ) : landingView === View.TOOLBOX ? (
               <ToolboxPage onBack={() => setLandingView(null)} lang={lang} />
             ) : landingView === View.SEARCH_RESULTS ? (
                <div className="max-w-7xl mx-auto px-4 py-12">
                   <button onClick={() => setLandingView(null)} className="flex items-center text-slate-500 hover:text-brand-600 mb-6">
                     <ArrowLeft size={20} className="mr-2" /> Back to Home
                   </button>
                   <SearchResultsPage 
                     results={searchResults} 
                     loading={loading && !searchResults} 
                     onSave={handleSaveSearchResult} 
                     t={t}
                     lang={lang}
                   />
                </div>
             ) : (
               <LandingPageContent 
                 onSearch={handleSearch} 
                 t={t} 
                 setLandingView={setLandingView}
                 lang={lang}
               />
             )}
             
             {/* Footer */}
             <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12">
                <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
                   <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-brand-600 rounded-md flex items-center justify-center text-white text-xs font-bold">R</div>
                        <span className="font-bold text-lg text-slate-900 dark:text-white">Reframe</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                        Helping you build a better mind, one project at a time.
                      </p>
                   </div>
                   
                   <div>
                     <h4 className="font-bold text-slate-900 dark:text-white mb-4">{t.startHere}</h4>
                     <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                       <li><button onClick={() => user ? setPortalView(View.ROOTS) : setLandingView(View.ROOTS)} className="hover:text-brand-500">{t.roots}</button></li>
                       <li><button onClick={() => user ? setPortalView(View.BRANCHES) : setLandingView(View.BRANCHES)} className="hover:text-brand-500">{t.branches}</button></li>
                       <li><button onClick={() => user ? setPortalView(View.TOOLBOX) : setLandingView(View.TOOLBOX)} className="hover:text-brand-500">{t.toolbox}</button></li>
                     </ul>
                   </div>

                   <div>
                     <h4 className="font-bold text-slate-900 dark:text-white mb-4">{t.about}</h4>
                     <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                       <li><a href="#" className="hover:text-brand-500">Manifesto</a></li>
                       <li><a href="#" className="hover:text-brand-500">{t.submitTopic}</a></li>
                       <li><a href="#" className="hover:text-brand-500">Contact</a></li>
                     </ul>
                   </div>

                   <div>
                     <h4 className="font-bold text-slate-900 dark:text-white mb-4">Legal</h4>
                     <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                       <li><a href="#" className="hover:text-brand-500">{t.terms}</a></li>
                       <li><a href="#" className="hover:text-brand-500">{t.privacy}</a></li>
                     </ul>
                   </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400">
                   &copy; {new Date().getFullYear()} Reframe. All rights reserved.
                </div>
             </footer>
           </div>
         )}
      </main>

      {/* --- Global Modals --- */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onLoginSuccess={handleLoginSuccess}
      />
      
      <NewProjectModal 
        isOpen={isNewProjectOpen} 
        onClose={() => setIsNewProjectOpen(false)} 
        onAdd={handleAddProject} 
      />

      <TaskDetailModal 
        isOpen={isTaskModalOpen}
        onClose={() => { setIsTaskModalOpen(false); setEditingTask(null); }}
        task={editingTask}
        projects={projects}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        lang={lang}
      />

    </div>
  );
};

export default App;
