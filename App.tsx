
import React, { useState, useEffect, useRef } from 'react';
import { View, Project, Task, SearchResult, ReframeVariation, ReframeType, FollowUpResult, Priority, TaskNote, WisdomNugget, Mood, ProjectNote } from './types';
import { WisdomGenerator } from './components/WisdomGenerator';
import { ProjectCard } from './components/ProjectCard';
import { suggestProjectTasks, analyzeSituation, getFollowUpAdvice, getProjectCoaching, generateProjectQuestions, refineProjectPlan } from './services/geminiService';
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
  Target,
  Smile,
  Frown,
  Meh,
  CloudRain,
  Anchor,
  Trophy,
  Book,
  PenTool,
  ChevronUp,
  SlidersHorizontal,
  ArrowUpDown,
  Leaf,
  Mountain,
  Users,
  BrainCircuit,
  Shield,
  Compass,
  AlertCircle,
  Check,
  CheckCircle2,
  Circle,
  Edit2,
  Quote
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
    subtitle: "Blueprint for a Better You",
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
    subtitle: "El Diseño de tu Mejor Versión",
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
    <div className="fixed inset-0 bg-brand-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-sand-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 id="task-modal-title" className="text-xl font-serif font-bold text-slate-900 dark:text-white">
            {task ? t.editTask : t.newTask}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close Modal">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="task-title" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Task Title</label>
            <input 
              id="task-title"
              required
              autoFocus
              value={formData.title || ''}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-sand-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              placeholder="What needs to be done?"
            />
          </div>

          {/* Project & Priority Row */}
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label htmlFor="task-project" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Project</label>
               <select 
                 id="task-project"
                 required
                 value={formData.projectId || ''}
                 onChange={(e) => setFormData({...formData, projectId: e.target.value})}
                 className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-sand-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer"
               >
                 <option value="" disabled>Select Project</option>
                 {projects.map(p => (
                   <option key={p.id} value={p.id}>{p.title}</option>
                 ))}
               </select>
             </div>
             <div>
               <label htmlFor="task-priority" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
               <select 
                 id="task-priority"
                 value={formData.priority || 'Medium'}
                 onChange={(e) => setFormData({...formData, priority: e.target.value as Priority})}
                 className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-sand-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer"
               >
                 <option value="High">High</option>
                 <option value="Medium">Medium</option>
                 <option value="Low">Low</option>
               </select>
             </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-desc" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea 
              id="task-desc"
              value={formData.description || ''}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-sand-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none h-24 resize-none transition-all"
              placeholder="Add details..."
            />
          </div>

          {/* Due Date */}
           <div>
            <label htmlFor="task-date" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
            <input 
              id="task-date"
              type="date"
              value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''}
              onChange={(e) => setFormData({...formData, dueDate: e.target.valueAsNumber})}
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-sand-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer"
            />
          </div>

          {/* Notes Section */}
          <div className="border-t border-slate-100 dark:border-slate-700 pt-4 mt-4">
             <label htmlFor="task-note-input" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Notes & Updates</label>
             <div className="flex gap-2 mb-3">
               <input 
                 id="task-note-input"
                 value={noteInput}
                 onChange={(e) => setNoteInput(e.target.value)}
                 className="flex-1 border border-slate-300 dark:border-slate-700 rounded-xl p-2 bg-sand-50 dark:bg-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 outline-none placeholder:text-slate-500"
                 placeholder="Add a progress note..."
               />
               <button 
                 type="button" 
                 onClick={handleAddNote}
                 className="bg-brand-100 dark:bg-slate-700 hover:bg-brand-200 dark:hover:bg-slate-600 text-brand-700 dark:text-slate-300 p-2 rounded-xl transition-colors"
                 aria-label="Add Note"
               >
                 <Plus size={18} />
               </button>
             </div>
             
             <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
               {formData.notes && formData.notes.length > 0 ? (
                 formData.notes.map(note => (
                   <div key={note.id} className="bg-sand-50 dark:bg-slate-800/50 p-3 rounded-lg text-sm border border-sand-100 dark:border-slate-800/50">
                     <p className="text-slate-700 dark:text-slate-300">{note.content}</p>
                     <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{new Date(note.createdAt).toLocaleString()}</p>
                   </div>
                 ))
               ) : (
                 <p className="text-xs text-slate-500 dark:text-slate-400 italic">No notes yet.</p>
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
                className="px-4 py-2.5 text-danger hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-colors"
                aria-label="Delete Task"
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
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-brand-500/20"
            >
              <Save size={18} /> {t.saveTask}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Footer Pages ---

const AboutPage = () => (
  <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
    <div className="text-center mb-16">
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-6">A Field Guide to Being Human</h1>
      <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
        Reframe is a cross-generational platform designed to help you become a better version of yourself through project-based self-improvement and AI-driven wisdom.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-sand-200 dark:border-slate-700 shadow-sm">
        <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center text-brand-600 dark:text-brand-400 mb-6">
          <Sprout size={24} />
        </div>
        <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-4">Our Mission</h3>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          We believe that wisdom shouldn't be locked away in dusty books or reserved for the end of life. By combining ancient philosophy with modern AI, we provide actionable insights when you need them most. Whether you are 15 or 50, growth is a continuous journey.
        </p>
      </div>
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-sand-200 dark:border-slate-700 shadow-sm">
        <div className="w-12 h-12 bg-clay-100 dark:bg-clay-900/30 rounded-2xl flex items-center justify-center text-clay-600 dark:text-clay-400 mb-6">
          <BrainCircuit size={24} />
        </div>
        <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-4">The AI Advantage</h3>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          Our platform utilizes advanced Large Language Models (LLMs) to analyze your specific situation and offer "Reframes"—perspective shifts that help you move from stuck to action. It's like having a mentor in your pocket, 24/7.
        </p>
      </div>
    </div>

    <div className="bg-brand-900 rounded-3xl p-12 text-center text-white relative overflow-hidden">
      <div className="relative z-10">
        <h2 className="text-3xl font-serif font-bold mb-6">Ready to grow?</h2>
        <p className="text-brand-100 mb-8 max-w-xl mx-auto">Join thousands of others who are actively designing their lives, one project at a time.</p>
      </div>
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
         <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
         </svg>
      </div>
    </div>
  </div>
);

const TermsPage = () => (
  <div className="max-w-3xl mx-auto pb-20 animate-fade-in text-slate-700 dark:text-slate-300">
    <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white mb-8">Terms of Use</h1>
    <p className="mb-8 text-sm text-slate-500">Last Updated: {new Date().toLocaleDateString()}</p>

    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
        <p className="leading-relaxed">
          By accessing and using Reframe, you agree to comply with and be bound by these Terms of Use. If you do not agree to these terms, please do not use our services.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">2. AI Disclaimer</h2>
        <p className="leading-relaxed">
          Reframe utilizes Artificial Intelligence to generate advice, tasks, and wisdom. While we strive for helpfulness, <strong>AI can make mistakes (hallucinations).</strong> Information provided by Reframe should not be considered professional medical, legal, or financial advice. Always consult a qualified professional for serious matters.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">3. User Responsibility</h2>
        <p className="leading-relaxed">
          You are responsible for the content you input into the platform. Do not submit sensitive personal information (PII) or confidential data. You must be at least 13 years old to use this service.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">4. Intellectual Property</h2>
        <p className="leading-relaxed">
          The core platform design, branding, and code are owned by Reframe. However, the projects and specific data you create within your account belong to you.
        </p>
      </section>
    </div>
  </div>
);

const PrivacyPage = () => (
  <div className="max-w-3xl mx-auto pb-20 animate-fade-in text-slate-700 dark:text-slate-300">
    <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white mb-8">Privacy Policy</h1>
    <div className="bg-sand-50 dark:bg-slate-800 p-6 rounded-2xl border border-sand-200 dark:border-slate-700 mb-8">
      <p className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
        <Shield className="text-success" size={20} />
        Your privacy is our priority. We do not sell your data.
      </p>
    </div>

    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Data Collection</h2>
        <p className="leading-relaxed">
          We collect information you provide directly to us, such as when you create an account, create a project, or submit a journal entry. This includes your name, email address, and the text content of your interactions.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">AI Processing</h2>
        <p className="leading-relaxed">
          To provide our services, text you input into the "Wisdom Generator" or "Project Planner" is sent to our AI partners (Google Gemini API). This data is used solely to generate the response and is not used to train public models without your explicit consent.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Data Security</h2>
        <p className="leading-relaxed">
          We use industry-standard encryption (TLS/SSL) to protect your data in transit. Your personal journal entries and project details are stored securely via Firebase services.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Contact Us</h2>
        <p className="leading-relaxed">
          If you have questions about this policy, please contact us at privacy@reframe.app.
        </p>
      </section>
    </div>
  </div>
);

// --- Project Detail Page ---

interface ProjectDetailPageProps {
  project: Project;
  projects: Project[]; // All projects for switching
  onSelectProject: (id: string) => void;
  onToggleTask: (pid: string, tid: string) => void;
  onUpdatePriority: (pid: string, tid: string, priority: Priority) => void;
  onEditTask: (pid: string, task: Task) => void;
  onAddTask: (pid: string) => void;
  onUpdateProject: (p: Project) => void;
  onNavigateToToolbox: () => void;
  lang: Language;
}

const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({ 
  project, projects, onSelectProject, onToggleTask, onUpdatePriority, onEditTask, onAddTask, onUpdateProject, onNavigateToToolbox, lang 
}) => {
  const [activeTab, setActiveTab] = useState<'Action' | 'Coach' | 'Journal'>('Action');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descInput, setDescInput] = useState(project.description);
  const [coachWisdom, setCoachWisdom] = useState<WisdomNugget | null>(null);
  const [loadingWisdom, setLoadingWisdom] = useState(false);

  // Journal State
  const [noteInput, setNoteInput] = useState('');
  const [selectedMood, setSelectedMood] = useState<Mood>('Confident');

  // Intake / Discovery Mode State
  const [showIntake, setShowIntake] = useState(false);
  const [intakeQuestions, setIntakeQuestions] = useState<string[]>([]);
  const [intakeAnswers, setIntakeAnswers] = useState<string[]>(['', '', '']);
  const [loadingIntake, setLoadingIntake] = useState(false);
  const [processingRefinement, setProcessingRefinement] = useState(false);

  // Update descInput when project changes (via switcher)
  useEffect(() => {
    setDescInput(project.description);
  }, [project.id, project.description]);

  // Check if we need to show intake immediately
  useEffect(() => {
    if (!project.hasCompletedIntake && project.tasks.length === 0 && !showIntake) {
      // Opt-in for intake if it's a new empty project
      // For now, let's make it a manual click to start "Discovery Mode" to avoid being annoying
    }
  }, [project]);

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

  const startDiscovery = async () => {
      setLoadingIntake(true);
      setShowIntake(true);
      try {
          const qs = await generateProjectQuestions(project.title, project.description);
          setIntakeQuestions(qs);
      } catch (e) {
          console.error(e);
          setIntakeQuestions([
              "What is your biggest blocker right now?",
              "Why is this important to you?",
              "What does success look like in 30 days?"
          ]);
      } finally {
          setLoadingIntake(false);
      }
  };

  const submitDiscovery = async () => {
      setProcessingRefinement(true);
      try {
          // Combine Q&A
          const context = intakeQuestions.map((q, i) => `Q: ${q}\nA: ${intakeAnswers[i]}`).join('\n\n');
          const refined = await refineProjectPlan(project.title, project.description, context);
          
          const newTasks = refined.suggestedTasks.map((t, i) => ({
             id: `refined-${Date.now()}-${i}`,
             title: t,
             isCompleted: false,
             priority: 'Medium' as Priority
          }));

          onUpdateProject({
              ...project,
              description: refined.newDescription, // AI might improve the description
              tasks: [...project.tasks, ...newTasks],
              hasCompletedIntake: true,
              userContext: context
          });
          setShowIntake(false);
          setActiveTab('Action');
      } catch (e) {
          console.error(e);
      } finally {
          setProcessingRefinement(false);
      }
  };

  const handleAddProjectNote = () => {
      if(!noteInput.trim()) return;

      const newNote: ProjectNote = {
          id: Date.now().toString(),
          content: noteInput,
          mood: selectedMood,
          createdAt: Date.now()
      };

      onUpdateProject({
          ...project,
          notes: [newNote, ...(project.notes || [])] // Prepend
      });
      setNoteInput('');
      setSelectedMood('Confident');
  };

  const getPriorityColor = (p?: Priority) => {
    switch (p) {
      case 'High': return 'bg-clay-500';
      case 'Medium': return 'bg-warning';
      case 'Low': return 'bg-brand-400';
      default: return 'bg-slate-300';
    }
  };

  const moods: { type: Mood; icon: React.ReactNode; label: string, color: string }[] = [
    { type: 'Excited', icon: <Zap size={18} />, label: 'Excited', color: 'text-warning bg-yellow-50 dark:bg-yellow-900/20' },
    { type: 'Confident', icon: <Trophy size={18} />, label: 'Confident', color: 'text-success bg-green-50 dark:bg-green-900/20' },
    { type: 'Proud', icon: <Sparkles size={18} />, label: 'Proud', color: 'text-brand-600 bg-brand-50 dark:bg-brand-900/20' },
    { type: 'Neutral', icon: <Meh size={18} />, label: 'Neutral', color: 'text-slate-500 bg-slate-50 dark:bg-slate-700' },
    { type: 'Anxious', icon: <CloudRain size={18} />, label: 'Anxious', color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
    { type: 'Stuck', icon: <Anchor size={18} />, label: 'Stuck', color: 'text-danger bg-red-50 dark:bg-red-900/20' },
    { type: 'Overwhelmed', icon: <Frown size={18} />, label: 'Overwhelmed', color: 'text-clay-600 bg-clay-50 dark:bg-clay-900/20' },
  ];

  if (showIntake) {
      return (
          <div className="max-w-2xl mx-auto py-12 animate-fade-in px-4">
              <button onClick={() => setShowIntake(false)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-6 flex items-center gap-2">
                  <ArrowLeft size={18} /> Back to Project
              </button>
              
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-sand-100 dark:border-slate-700">
                  <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
                          <Sparkles size={24} />
                      </div>
                      <div>
                          <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Discovery Mode</h2>
                          <p className="text-slate-500 dark:text-slate-400 text-sm">Let's clarify your vision to build the perfect plan.</p>
                      </div>
                  </div>

                  {loadingIntake ? (
                      <div className="py-12 text-center">
                          <Loader2 className="animate-spin mx-auto text-brand-500 mb-4" size={32} />
                          <p className="text-slate-500">Consulting with the AI Coach...</p>
                      </div>
                  ) : (
                      <div className="space-y-6">
                          {intakeQuestions.map((q, i) => (
                              <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                                  <label htmlFor={`intake-q-${i}`} className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{q}</label>
                                  <textarea 
                                      id={`intake-q-${i}`}
                                      value={intakeAnswers[i]}
                                      onChange={(e) => {
                                          const newA = [...intakeAnswers];
                                          newA[i] = e.target.value;
                                          setIntakeAnswers(newA);
                                      }}
                                      className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-sand-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none placeholder:text-slate-500"
                                      placeholder="Your thoughts..."
                                  />
                              </div>
                          ))}
                          <button 
                              onClick={submitDiscovery}
                              disabled={processingRefinement}
                              className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg flex justify-center items-center gap-2"
                          >
                             {processingRefinement ? <Loader2 className="animate-spin" /> : <><RocketIcon /> Build My Plan</>}
                          </button>
                      </div>
                  )}
              </div>
          </div>
      )
  }

  return (
    <div className="animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                ${project.category === 'Career' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 
                  project.category === 'Health' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                  project.category === 'Spiritual' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                  'bg-clay-100 text-clay-700 dark:bg-clay-900/30 dark:text-clay-300'}`}>
                {project.category}
            </span>
             {!project.hasCompletedIntake && (
                 <button onClick={startDiscovery} className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline">
                     <Sparkles size={12} /> Start Discovery Mode
                 </button>
             )}
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-2">{project.title}</h1>
        </div>
        
        {/* Project Switcher */}
        <div className="relative group">
            <button 
                className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-sand-200 dark:border-slate-700 rounded-xl px-4 py-2 cursor-pointer hover:border-brand-300 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                aria-haspopup="true"
                aria-expanded="false"
            >
                 <Briefcase size={16} className="text-slate-400" />
                 <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{project.title}</span>
                 <ChevronDown size={16} className="text-slate-400" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-sand-100 dark:border-slate-700 overflow-hidden hidden group-hover:block z-20">
                {projects.map(p => (
                    <button 
                        key={p.id}
                        onClick={() => onSelectProject(p.id)}
                        className={`w-full text-left px-4 py-3 hover:bg-sand-50 dark:hover:bg-slate-700 cursor-pointer text-sm ${p.id === project.id ? 'bg-brand-50 dark:bg-brand-900/10 text-brand-700 dark:text-brand-300 font-medium' : 'text-slate-600 dark:text-slate-300'}`}
                    >
                        {p.title}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Context & Stats */}
        <div className="space-y-6">
           <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-sand-200 dark:border-slate-700">
               <div className="flex justify-between items-center mb-4">
                   <h3 className="font-serif font-bold text-lg text-slate-800 dark:text-white">Why</h3>
                   <button onClick={() => setIsEditingDesc(!isEditingDesc)} className="text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-700 p-1 rounded" aria-label="Edit description">
                       {isEditingDesc ? <Check size={18} onClick={handleSaveDesc} /> : <Edit3 size={18} />}
                   </button>
               </div>
               {isEditingDesc ? (
                   <textarea 
                      value={descInput}
                      onChange={(e) => setDescInput(e.target.value)}
                      className="w-full text-sm border p-2 rounded-lg dark:bg-slate-900 dark:text-white"
                      rows={4}
                      aria-label="Project Description"
                   />
               ) : (
                   <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed italic">
                       "{project.description}"
                   </p>
               )}
           </div>

           {/* Progress Ring */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-sand-200 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                <div className="relative w-32 h-32 mb-4">
                    <svg className="w-full h-full" viewBox="0 0 36 36" role="img" aria-label={`Progress: ${progress}%`}>
                        <path className="text-sand-100 dark:text-slate-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                        <path className="text-brand-500 transition-all duration-1000 ease-out" strokeDasharray={`${progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-3xl font-bold text-slate-800 dark:text-white" aria-hidden="true">{progress}%</span>
                    </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {completedTasks} / {totalTasks} Tasks
                </p>
            </div>
            
             <button onClick={onNavigateToToolbox} className="w-full py-3 bg-white dark:bg-slate-800 border border-brand-200 dark:border-slate-700 text-brand-700 dark:text-brand-300 rounded-xl font-medium shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2">
                 <Wrench size={18} /> Need a Tool?
             </button>
        </div>

        {/* Right Column: Tabs */}
        <div className="lg:col-span-2">
           <div className="flex gap-4 mb-6 border-b border-sand-200 dark:border-slate-700 pb-1" role="tablist">
               {(['Action', 'Coach', 'Journal'] as const).map(tab => (
                   <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      role="tab"
                      aria-selected={activeTab === tab}
                      className={`pb-3 px-2 font-serif font-bold text-lg transition-colors relative
                          ${activeTab === tab ? 'text-brand-700 dark:text-brand-400' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                       {tab === 'Action' && 'Action Plan'}
                       {tab === 'Coach' && 'AI Coach'}
                       {tab === 'Journal' && 'Journal'}
                       {activeTab === tab && (
                           <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-600 dark:bg-brand-400 rounded-t-full"></div>
                       )}
                   </button>
               ))}
           </div>

           <div className="min-h-[400px]">
               {activeTab === 'Action' && (
                   <div className="space-y-3 animate-fade-in" role="tabpanel">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Tasks</h4>
                            <button 
                              onClick={() => onAddTask(project.id)}
                              className="text-xs bg-brand-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-brand-700 transition-colors"
                            >
                                <Plus size={14} /> New Task
                            </button>
                        </div>
                       {project.tasks.length === 0 ? (
                           <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                               <p className="text-slate-400 mb-2">No tasks yet.</p>
                               <button onClick={() => onAddTask(project.id)} className="text-brand-600 font-medium hover:underline">Create your first task</button>
                           </div>
                       ) : (
                           project.tasks.map(task => (
                               <div 
                                 key={task.id} 
                                 className="group bg-white dark:bg-slate-800 p-4 rounded-xl border border-sand-100 dark:border-slate-700 hover:border-brand-200 dark:hover:border-slate-600 shadow-sm transition-all flex items-start gap-3"
                               >
                                    <button 
                                      onClick={() => onToggleTask(project.id, task.id)}
                                      aria-label={task.isCompleted ? "Mark incomplete" : "Mark complete"}
                                      className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                                          ${task.isCompleted ? 'bg-success border-success' : 'border-slate-300 dark:border-slate-600 hover:border-brand-500'}`}
                                    >
                                        {task.isCompleted && <Check size={12} className="text-white" />}
                                    </button>
                                    <div className="flex-1">
                                         <div className="flex justify-between items-start">
                                            <button 
                                              onClick={() => onEditTask(project.id, task)}
                                              className={`font-medium cursor-pointer text-left hover:text-brand-600 transition-colors ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-slate-200'}`}
                                            >
                                                {task.title}
                                            </button>
                                            <div className="flex items-center gap-2">
                                                 <button 
                                                    onClick={() => onUpdatePriority(project.id, task.id, task.priority === 'High' ? 'Low' : task.priority === 'Low' ? 'Medium' : 'High')}
                                                    className={`w-2.5 h-2.5 rounded-full cursor-pointer ${getPriorityColor(task.priority)}`} 
                                                    title={`Priority: ${task.priority}`}
                                                    aria-label={`Change priority from ${task.priority}`}
                                                 />
                                                 <button onClick={() => onEditTask(project.id, task)} aria-label="Edit task" className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-brand-500 transition-opacity">
                                                     <Edit2 size={14} />
                                                 </button>
                                            </div>
                                         </div>
                                         {task.description && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{task.description}</p>}
                                         {task.dueDate && (
                                             <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-2">
                                                 <Calendar size={10} /> {new Date(task.dueDate).toLocaleDateString()}
                                             </div>
                                         )}
                                    </div>
                               </div>
                           ))
                       )}
                   </div>
               )}

               {activeTab === 'Coach' && (
                   <div className="animate-fade-in space-y-6" role="tabpanel">
                        <div className="bg-gradient-to-br from-brand-50 to-white dark:from-slate-800 dark:to-slate-900 p-6 rounded-2xl border border-brand-100 dark:border-slate-700">
                             <div className="flex gap-4 items-start">
                                 <div className="bg-brand-100 dark:bg-brand-900/30 p-3 rounded-full text-brand-600 dark:text-brand-400">
                                     <Sparkles size={24} />
                                 </div>
                                 <div className="flex-1">
                                     <h3 className="font-serif font-bold text-lg text-slate-800 dark:text-white mb-2">Need Perspective?</h3>
                                     <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                                         The AI Coach can analyze your current progress and description to provide a tailored reframe or wisdom nugget to keep you moving.
                                     </p>
                                     <button 
                                       onClick={handleGetCoaching} 
                                       disabled={loadingWisdom}
                                       className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-brand-500/20"
                                     >
                                         {loadingWisdom ? <Loader2 className="animate-spin" /> : 'Get Coaching Insight'}
                                     </button>
                                 </div>
                             </div>
                        </div>

                        {coachWisdom && (
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-sand-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                                <Quote className="absolute top-4 right-4 text-brand-100 dark:text-slate-700 w-16 h-16 opacity-50" />
                                <blockquote className="text-xl font-serif italic text-slate-800 dark:text-sand-100 mb-4 relative z-10">
                                    "{coachWisdom.quote}"
                                </blockquote>
                                <div className="text-sm font-bold text-slate-500 mb-6 uppercase tracking-wider relative z-10">— {coachWisdom.author}</div>
                                
                                <div className="bg-sand-50 dark:bg-slate-900/50 p-4 rounded-xl mb-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {coachWisdom.context}
                                </div>
                                <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-medium text-sm">
                                    <Target size={16} /> Try this: {coachWisdom.actionableStep}
                                </div>
                            </div>
                        )}
                   </div>
               )}

               {activeTab === 'Journal' && (
                   <div className="animate-fade-in space-y-6" role="tabpanel">
                       <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-sand-200 dark:border-slate-700 shadow-sm">
                           <label htmlFor="journal-note" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">How are you feeling about this project?</label>
                           <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar">
                               {moods.map(m => (
                                   <button
                                     key={m.type}
                                     onClick={() => setSelectedMood(m.type)}
                                     aria-pressed={selectedMood === m.type}
                                     className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap
                                        ${selectedMood === m.type 
                                            ? `${m.color} border-transparent ring-2 ring-offset-1 dark:ring-offset-slate-800 ring-brand-200` 
                                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                   >
                                       {m.icon} {m.label}
                                   </button>
                               ))}
                           </div>
                           <textarea 
                              id="journal-note"
                              value={noteInput}
                              onChange={(e) => setNoteInput(e.target.value)}
                              placeholder="Capture a thought, win, or blocker..."
                              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-sand-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none h-24 resize-none mb-3 placeholder:text-slate-500"
                           />
                           <div className="flex justify-end">
                               <button 
                                 onClick={handleAddProjectNote}
                                 disabled={!noteInput.trim()}
                                 className="bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                               >
                                   Add Entry
                               </button>
                           </div>
                       </div>

                       <div className="space-y-4">
                           {project.notes && project.notes.length > 0 ? (
                               project.notes.map(note => {
                                   const moodObj = moods.find(m => m.type === note.mood) || moods[3];
                                   return (
                                       <div key={note.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-sand-100 dark:border-slate-700 flex gap-4">
                                           <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${moodObj.color}`}>
                                               {moodObj.icon}
                                           </div>
                                           <div>
                                               <div className="flex items-center gap-2 mb-1">
                                                   <span className="text-xs font-bold text-slate-500 uppercase">{moodObj.label}</span>
                                                   <span className="text-[10px] text-slate-400">• {new Date(note.createdAt).toLocaleString()}</span>
                                               </div>
                                               <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{note.content}</p>
                                           </div>
                                       </div>
                                   );
                               })
                           ) : (
                               <div className="text-center py-8">
                                   <BookOpen className="mx-auto text-slate-300 mb-2" size={32} />
                                   <p className="text-slate-400 text-sm">No journal entries yet.</p>
                               </div>
                           )}
                       </div>
                   </div>
               )}
           </div>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components for Icons ---

const RocketIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>;

// --- Portal Component ---

interface PortalProps {
  user: User;
  currentView: View;
  setView: (view: View) => void;
  lang: Language;
  onLogout: () => void;
}

const Portal: React.FC<PortalProps> = ({ user, currentView, setView, lang, onLogout }) => {
  const t = translations[lang];
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Task CRUD State
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // All Tasks View State
  const [taskGroupBy, setTaskGroupBy] = useState<'None' | 'Project' | 'Priority'>('Project');
  const [taskSortBy, setTaskSortBy] = useState<'Date' | 'Priority'>('Date');

  useEffect(() => {
    // Mock Data
    setProjects([
      {
        id: '1',
        title: 'Marathon Training',
        description: 'Prepare for the city marathon in 6 months using the run/walk method.',
        category: 'Health',
        progress: 35,
        tasks: [
           { id: 't1', title: 'Buy running shoes', isCompleted: true, priority: 'High', description: 'Go to runner store' },
           { id: 't2', title: 'Run 5k', isCompleted: false, priority: 'Medium' },
           { id: 't3', title: 'Register for race', isCompleted: false, priority: 'High' }
        ],
        notes: [],
        createdAt: Date.now()
      },
      {
        id: '2',
        title: 'Learn Spanish',
        description: 'Be conversational before the summer trip to Barcelona.',
        category: 'Career',
        progress: 10,
        tasks: [
            { id: 't4', title: 'Download Duolingo', isCompleted: true, priority: 'Low' },
            { id: 't5', title: 'Practice 15 mins/day', isCompleted: false, priority: 'High' }
        ],
        notes: [],
        createdAt: Date.now()
      }
    ]);
  }, []);

  const handleCreateProject = (project: Project) => {
    setProjects([...projects, project]);
    setNewProjectModalOpen(false);
  };

  const handleUpdateProject = (updatedProject: Project) => {
      setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const handleDeleteProject = (projectId: string) => {
      setProjects(projects.filter(p => p.id !== projectId));
      if (selectedProjectId === projectId) setView(View.DASHBOARD);
  };

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

  // Task CRUD Handlers
  const openNewTaskModal = (preselectProjectId?: string) => {
      setEditingTask(null); // Clear for new
      // If preselectProjectId is passed, we could handle it in default state of modal, 
      // but for now modal defaults to first project.
      setTaskModalOpen(true);
  };

  const openEditTaskModal = (projectId: string, task: Task) => {
      setEditingTask({ ...task, projectId }); // Ensure projectId is attached
      setTaskModalOpen(true);
  };

  const handleSaveTask = (task: Task) => {
      const pid = task.projectId;
      if (!pid) return;

      setProjects(prev => prev.map(p => {
          if (p.id === pid) {
              const existingTaskIndex = p.tasks.findIndex(t => t.id === task.id);
              if (existingTaskIndex >= 0) {
                  // Update
                  const newTasks = [...p.tasks];
                  newTasks[existingTaskIndex] = task;
                  return { ...p, tasks: newTasks };
              } else {
                  // Create
                  return { ...p, tasks: [task, ...p.tasks] };
              }
          }
          return p;
      }));
  };

  const handleDeleteTask = (taskId: string) => {
      setProjects(prev => prev.map(p => ({
          ...p,
          tasks: p.tasks.filter(t => t.id !== taskId)
      })));
  };

  const handleSearch = (q: string) => {
      setSearchQuery(q);
      if (q.trim().length > 0) {
          // In a real app, this might trigger a navigation to a search results view
          // For now we assume the dashboard handles it or we switch to a search view
          // But based on prompt, let's switch to Search Results view if user hits enter
      }
  };

  const handleSearchSubmit = async () => {
      if (!searchQuery.trim()) return;
      setView(View.SEARCH_RESULTS);
  };

  const PortalHeader = ({ title, showAdd = false }: { title: string, showAdd?: boolean }) => (
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h2 className="text-3xl font-serif font-bold text-slate-800 dark:text-white">{title}</h2>
          <div className="flex items-center gap-3 w-full md:w-auto">
               {/* Expanded Search Bar in Portal */}
               <div className="relative flex-1 md:w-64">
                  <label htmlFor="portal-search" className="sr-only">{t.searchPlaceholder}</label>
                  <input 
                    id="portal-search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                    placeholder={t.searchPlaceholder}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-sand-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none shadow-sm transition-all placeholder:text-slate-500"
                  />
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
               </div>
               
               {showAdd && (
                   <button 
                     onClick={() => setNewProjectModalOpen(true)}
                     className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2 whitespace-nowrap"
                   >
                       <Plus size={18} /> {t.createProject}
                   </button>
               )}
          </div>
      </div>
  );

  return (
    <div className="flex min-h-screen bg-sand-50 dark:bg-brand-950 pt-20">
      {/* Sidebar */}
      <aside className="w-64 hidden lg:flex flex-col fixed left-0 top-20 bottom-0 bg-white dark:bg-slate-900 border-r border-sand-200 dark:border-slate-800 z-10">
         <div className="p-6">
             <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-slate-800 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-lg">
                    {user.displayName ? user.displayName[0] : 'U'}
                </div>
                <div>
                    <p className="font-bold text-slate-800 dark:text-white text-sm">{user.displayName}</p>
                    <p className="text-xs text-slate-500">Free Plan</p>
                </div>
             </div>
             
             <nav className="space-y-1">
                 <NavButton active={currentView === View.DASHBOARD} onClick={() => setView(View.DASHBOARD)} icon={<LayoutDashboard size={20}/>} label={t.dashboard} />
                 
                 {/* Projects with Quick Add */}
                 <div className={`group flex items-center justify-between rounded-xl px-4 py-3 cursor-pointer transition-colors ${currentView === View.PROJECTS ? 'bg-brand-50 dark:bg-brand-900/10 text-brand-700 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                     <button onClick={() => setView(View.PROJECTS)} className="flex items-center gap-3 flex-1 text-left focus:outline-none">
                         <ListTodo size={20} />
                         <span className="font-medium text-sm">{t.projects}</span>
                     </button>
                     <button onClick={(e) => { e.stopPropagation(); setNewProjectModalOpen(true); }} className="p-1 rounded-md hover:bg-brand-200 dark:hover:bg-slate-600 text-slate-400 hover:text-brand-700 transition-colors" aria-label="Add project">
                         <Plus size={16} />
                     </button>
                 </div>

                 {/* Tasks with Quick Add */}
                 <div className={`group flex items-center justify-between rounded-xl px-4 py-3 cursor-pointer transition-colors ${currentView === View.TASKS ? 'bg-brand-50 dark:bg-brand-900/10 text-brand-700 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                     <button onClick={() => setView(View.TASKS)} className="flex items-center gap-3 flex-1 text-left focus:outline-none">
                         <CheckSquare size={20} />
                         <span className="font-medium text-sm">{t.tasks}</span>
                     </button>
                     <button onClick={(e) => { e.stopPropagation(); openNewTaskModal(); }} className="p-1 rounded-md hover:bg-brand-200 dark:hover:bg-slate-600 text-slate-400 hover:text-brand-700 transition-colors" aria-label="Add task">
                         <Plus size={16} />
                     </button>
                 </div>

                 <NavButton active={currentView === View.WISDOM} onClick={() => setView(View.WISDOM)} icon={<Lightbulb size={20}/>} label={t.wisdom} />
                 <div className="pt-4 border-t border-sand-100 dark:border-slate-800 mt-4">
                    <p className="px-4 text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Explore</p>
                    <NavButton active={currentView === View.ROOTS} onClick={() => setView(View.ROOTS)} icon={<Sprout size={20}/>} label={t.roots} />
                    <NavButton active={currentView === View.BRANCHES} onClick={() => setView(View.BRANCHES)} icon={<GitFork size={20}/>} label={t.branches} />
                    <NavButton active={currentView === View.TOOLBOX} onClick={() => setView(View.TOOLBOX)} icon={<Wrench size={20}/>} label={t.toolbox} />
                 </div>
             </nav>
         </div>
         
         {/* Bottom Actions Row */}
         <div className="mt-auto p-4 border-t border-sand-200 dark:border-slate-800 flex justify-around">
             <button className="p-2 text-slate-400 hover:text-brand-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors" title={t.settings} aria-label={t.settings}>
                 <Settings size={20} />
             </button>
             <button className="p-2 text-slate-400 hover:text-brand-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors" title={t.profile} aria-label={t.profile}>
                 <UserIcon size={20} />
             </button>
             <button onClick={onLogout} className="p-2 text-slate-400 hover:text-danger hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title={t.signOut} aria-label={t.signOut}>
                 <LogOut size={20} />
             </button>
         </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-6 lg:p-10 animate-fade-in w-full max-w-[1600px] mx-auto">
        {currentView === View.DASHBOARD && (
          <div className="space-y-8">
            <PortalHeader title={`${t.dashboard}, ${user.displayName?.split(' ')[0]}`} />
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
               <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl p-6 text-white shadow-lg shadow-brand-500/20">
                  <div className="flex items-center gap-3 mb-2 opacity-90">
                      <ListTodo size={24} />
                      <span className="font-medium text-sm md:text-base">Active Projects</span>
                  </div>
                  <p className="text-3xl font-serif font-bold">{projects.length}</p>
               </div>
               <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-sand-200 dark:border-slate-700 shadow-sm">
                   <div className="flex items-center gap-3 mb-2 text-slate-500 dark:text-slate-400">
                      <CheckCircle size={24} />
                      <span className="font-medium text-sm md:text-base">Tasks Completed</span>
                  </div>
                  <p className="text-3xl font-serif font-bold text-slate-800 dark:text-white">
                      {projects.reduce((acc, p) => acc + p.tasks.filter(t => t.isCompleted).length, 0)}
                  </p>
               </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-serif font-bold text-slate-800 dark:text-white">{t.projects}</h3>
                <button onClick={() => setView(View.PROJECTS)} className="text-brand-600 dark:text-brand-400 text-sm font-medium hover:underline flex items-center gap-1">
                    View All <ArrowRight size={16} />
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {projects.slice(0, 4).map(project => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    onSelect={(id) => { setSelectedProjectId(id); setView(View.PROJECT_DETAIL); }}
                    onToggleTask={handleToggleTask}
                    onDelete={handleDeleteProject}
                    onUpdatePriority={handleUpdatePriority}
                    onEditTask={openEditTaskModal}
                  />
                ))}
                {projects.length === 0 && (
                  <div className="col-span-full py-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-sand-300 dark:border-slate-700">
                     <p className="text-slate-500 mb-4">You haven't started any projects yet.</p>
                     <button onClick={() => setNewProjectModalOpen(true)} className="text-brand-600 font-bold hover:underline">Start your first project</button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Quick Tasks View */}
             <div>
                 <h3 className="text-xl font-serif font-bold text-slate-800 dark:text-white mb-4">Due Soon</h3>
                 <div className="bg-white dark:bg-slate-800 rounded-2xl border border-sand-200 dark:border-slate-700 overflow-hidden">
                     {projects.flatMap(p => p.tasks.map(t => ({...t, projectName: p.title, projectId: p.id})))
                        .filter(t => !t.isCompleted && t.dueDate)
                        .sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0))
                        .slice(0, 3)
                        .map(task => (
                            <div key={task.id} className="p-4 border-b border-sand-100 dark:border-slate-700 last:border-0 hover:bg-sand-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button onClick={() => handleToggleTask(task.projectId, task.id)} aria-label={task.isCompleted ? "Mark incomplete" : "Mark complete"} className="text-slate-300 hover:text-success">
                                        <Circle size={20} />
                                    </button>
                                    <div>
                                        <button onClick={() => openEditTaskModal(task.projectId, task)} className="font-medium text-slate-800 dark:text-white text-sm cursor-pointer hover:text-brand-600 text-left">{task.title}</button>
                                        <p className="text-xs text-slate-500">{task.projectName} • {new Date(task.dueDate!).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${task.priority === 'High' ? 'bg-clay-500' : 'bg-brand-400'}`} />
                            </div>
                        ))}
                      {projects.flatMap(p => p.tasks).filter(t => !t.isCompleted && t.dueDate).length === 0 && (
                          <div className="p-6 text-center text-slate-400 text-sm">No upcoming deadlines.</div>
                      )}
                 </div>
             </div>
          </div>
        )}

        {currentView === View.PROJECTS && (
          <div className="space-y-8">
            <PortalHeader title={t.projects} showAdd={true} />
            
            {/* Filter/Sort Bar could go here */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {projects.map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onSelect={(id) => { setSelectedProjectId(id); setView(View.PROJECT_DETAIL); }}
                  onToggleTask={handleToggleTask}
                  onDelete={handleDeleteProject}
                  onUpdatePriority={handleUpdatePriority}
                  onEditTask={openEditTaskModal}
                />
              ))}
            </div>
          </div>
        )}

        {currentView === View.PROJECT_DETAIL && selectedProjectId && (
            <ProjectDetailPage 
                project={projects.find(p => p.id === selectedProjectId)!}
                projects={projects}
                onSelectProject={(id) => setSelectedProjectId(id)}
                onToggleTask={handleToggleTask}
                onUpdatePriority={handleUpdatePriority}
                onEditTask={openEditTaskModal}
                onAddTask={(pid) => openNewTaskModal(pid)}
                onUpdateProject={handleUpdateProject}
                onNavigateToToolbox={() => setView(View.TOOLBOX)}
                lang={lang}
            />
        )}
        
        {currentView === View.TASKS && (
            <div className="space-y-6">
                <PortalHeader title={t.tasks} showAdd={true} />
                
                {/* Advanced Sort/Filter Toolbar */}
                <div className="flex flex-wrap gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-sand-200 dark:border-slate-700 mb-4">
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-slate-400" />
                        <label htmlFor="group-by" className="text-sm font-bold text-slate-600 dark:text-slate-300">Group By:</label>
                        <select 
                            id="group-by"
                            value={taskGroupBy}
                            onChange={(e) => setTaskGroupBy(e.target.value as any)}
                            className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer text-slate-800 dark:text-white"
                        >
                            <option value="None">None</option>
                            <option value="Project">Project</option>
                            <option value="Priority">Priority</option>
                        </select>
                    </div>
                     <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>
                     <div className="flex items-center gap-2">
                        <ArrowUpDown size={16} className="text-slate-400" />
                        <label htmlFor="sort-by" className="text-sm font-bold text-slate-600 dark:text-slate-300">Sort By:</label>
                        <select 
                            id="sort-by"
                            value={taskSortBy}
                            onChange={(e) => setTaskSortBy(e.target.value as any)}
                            className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer text-slate-800 dark:text-white"
                        >
                            <option value="Date">Due Date</option>
                            <option value="Priority">Priority</option>
                            <option value="Title">Title</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Render logic based on grouping */}
                    {taskGroupBy === 'Project' ? (
                        projects.map(project => (
                             <div key={project.id} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-sand-200 dark:border-slate-700">
                                 <div className="bg-sand-50 dark:bg-slate-900/50 px-6 py-3 border-b border-sand-100 dark:border-slate-700 flex justify-between items-center">
                                     <h4 className="font-bold text-slate-700 dark:text-slate-300">{project.title}</h4>
                                     <span className="text-xs text-slate-500 bg-white dark:bg-slate-800 px-2 py-1 rounded-full">{project.tasks.length} tasks</span>
                                 </div>
                                 <div className="divide-y divide-sand-100 dark:divide-slate-700">
                                     {project.tasks.length === 0 ? <p className="p-4 text-sm text-slate-400 italic">No tasks.</p> : project.tasks.map(task => (
                                         <TaskRow 
                                           key={task.id} 
                                           task={task} 
                                           project={project} 
                                           onToggle={() => handleToggleTask(project.id, task.id)} 
                                           onEdit={() => openEditTaskModal(project.id, task)}
                                           onPriority={(p) => handleUpdatePriority(project.id, task.id, p)}
                                         />
                                     ))}
                                 </div>
                             </div>
                        ))
                    ) : (
                         <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-sand-200 dark:border-slate-700 divide-y divide-sand-100 dark:divide-slate-700">
                             {projects.flatMap(p => p.tasks.map(t => ({...t, project: p})))
                                .sort((a,b) => taskSortBy === 'Priority' ? (a.priority === 'High' ? -1 : 1) : 0) // Simplified sort
                                .map(item => (
                                    <TaskRow 
                                        key={item.id}
                                        task={item}
                                        project={item.project}
                                        onToggle={() => handleToggleTask(item.project.id, item.id)}
                                        onEdit={() => openEditTaskModal(item.project.id, item)}
                                        onPriority={(p) => handleUpdatePriority(item.project.id, item.id, p)}
                                    />
                                ))
                             }
                         </div>
                    )}
                </div>
            </div>
        )}

        {currentView === View.WISDOM && <WisdomGenerator />}
        {currentView === View.ROOTS && <RootsPage />}
        {currentView === View.BRANCHES && <BranchesPage />}
        {currentView === View.TOOLBOX && <ToolboxPage />}
        
        {currentView === View.ABOUT && <AboutPage />}
        {currentView === View.TERMS && <TermsPage />}
        {currentView === View.PRIVACY && <PrivacyPage />}

        {currentView === View.SEARCH_RESULTS && (
             <SearchResultsPage 
                query={searchQuery} 
                onSaveTask={(taskStr, type) => {
                    // Logic to create a project from search result
                    // For now, let's open the new project modal pre-filled
                    setNewProjectModalOpen(true);
                }}
             />
        )}

      </main>

      {/* Modals */}
      <NewProjectModal 
        isOpen={newProjectModalOpen} 
        onClose={() => setNewProjectModalOpen(false)}
        onCreate={handleCreateProject}
      />
      
      <TaskDetailModal 
         isOpen={taskModalOpen}
         onClose={() => setTaskModalOpen(false)}
         task={editingTask}
         projects={projects}
         onSave={handleSaveTask}
         onDelete={handleDeleteTask}
         lang={lang}
      />
    </div>
  );
};

const TaskRow = ({ task, project, onToggle, onEdit, onPriority }: any) => (
    <div className="p-4 hover:bg-sand-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-4 group">
        <button onClick={onToggle} aria-label={task.isCompleted ? "Mark incomplete" : "Mark complete"} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${task.isCompleted ? 'bg-success border-success' : 'border-slate-300 dark:border-slate-600 hover:border-brand-500'}`}>
            {task.isCompleted && <Check size={12} className="text-white" />}
        </button>
        <div className="flex-1 cursor-pointer" onClick={onEdit}>
            <p className={`font-medium text-sm transition-colors ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800 dark:text-white hover:text-brand-600'}`}>{task.title}</p>
            {project && <p className="text-xs text-slate-400">{project.title}</p>}
        </div>
        <div className="flex items-center gap-3">
             {task.dueDate && (
                 <span className={`text-xs px-2 py-0.5 rounded-md ${new Date(task.dueDate) < new Date() && !task.isCompleted ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'} dark:bg-slate-900`}>
                     {new Date(task.dueDate).toLocaleDateString()}
                 </span>
             )}
             <button 
                onClick={() => onPriority(task.priority === 'High' ? 'Low' : task.priority === 'Low' ? 'Medium' : 'High')}
                className={`w-2.5 h-2.5 rounded-full cursor-pointer hover:scale-125 transition-transform 
                    ${task.priority === 'High' ? 'bg-clay-500' : task.priority === 'Medium' ? 'bg-warning' : 'bg-brand-400'}`} 
                aria-label={`Change priority from ${task.priority}`}
             />
             <button onClick={onEdit} aria-label="Edit task" className="text-slate-300 hover:text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Edit2 size={16} />
             </button>
        </div>
    </div>
)

// --- Other Components ---

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 mb-1
      ${active 
        ? 'bg-brand-50 dark:bg-brand-900/10 text-brand-700 dark:text-brand-400 font-semibold shadow-sm' 
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
  >
    {icon}
    <span className="text-sm">{label}</span>
  </button>
);

const SearchResultsPage = ({ query, onSaveTask }: { query: string, onSaveTask: (t: string, type: ReframeType) => void }) => {
    const [result, setResult] = useState<SearchResult | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Follow Up State
    const [followUpQuery, setFollowUpQuery] = useState('');
    const [followUpResults, setFollowUpResults] = useState<{question: string, result: FollowUpResult}[]>([]);
    const [loadingFollowUp, setLoadingFollowUp] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const res = await analyzeSituation(query);
                setResult(res);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [query]);

    const handleFollowUp = async () => {
        if (!followUpQuery.trim()) return;
        setLoadingFollowUp(true);
        try {
            // Include context of previous variations if possible, for now just pass query
            const res = await getFollowUpAdvice(query, followUpQuery);
            setFollowUpResults([...followUpResults, { question: followUpQuery, result: res }]);
            setFollowUpQuery('');
        } catch(e) { console.error(e) } 
        finally { setLoadingFollowUp(false); }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-brand-500 mb-4" size={48} />
            <h3 className="text-xl font-serif text-slate-700 dark:text-slate-300">Consulting Wisdom...</h3>
        </div>
    );

    if (!result) return <div>Error loading results.</div>;

    return (
        <div className="space-y-8 pb-20">
            <div className="text-center max-w-2xl mx-auto mb-12">
                 <h2 className="text-3xl font-serif font-bold text-slate-800 dark:text-white mb-2">Paths Forward</h2>
                 <p className="text-slate-500 dark:text-slate-400">For your situation: "{query}"</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {result.variations.map((v, i) => (
                    <VariationCard key={i} variation={v} onSave={() => onSaveTask(v.title, v.type)} />
                ))}
            </div>
            
            {/* Conversation / Follow Up Section */}
            <div className="mt-12 border-t border-sand-200 dark:border-slate-700 pt-8">
                <h3 className="text-2xl font-serif font-bold text-slate-800 dark:text-white mb-6">Dive Deeper</h3>
                
                <div className="space-y-8 mb-8">
                    {followUpResults.map((item, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-sand-200 dark:border-slate-700 animate-fade-in-up">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                                    <UserIcon size={16} />
                                </div>
                                <p className="font-medium text-slate-800 dark:text-white pt-1">{item.question}</p>
                            </div>
                            <div className="ml-12 bg-sand-50 dark:bg-slate-900/50 p-5 rounded-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                                {item.result.answer}
                            </div>
                            
                            {/* Follow up Variations if any */}
                            {item.result.variations && (
                                <div className="ml-12 grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    {item.result.variations.map((v, vIdx) => (
                                         <VariationCard key={vIdx} variation={v} small />
                                    ))}
                                </div>
                            )}

                             {!item.result.variations && item.result.suggestedTasks && (
                                <div className="ml-12">
                                     <h5 className="text-xs font-bold uppercase text-slate-500 mb-2">Suggested Actions</h5>
                                     <div className="space-y-2">
                                         {item.result.suggestedTasks.map((t, ti) => (
                                             <div key={ti} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-2 rounded border border-sand-100 dark:border-slate-700">
                                                 <Plus size={14} className="text-brand-500" /> {t}
                                             </div>
                                         ))}
                                     </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="relative max-w-2xl mx-auto">
                    <label htmlFor="follow-up-input" className="sr-only">Follow-up question</label>
                    <input 
                        id="follow-up-input"
                        value={followUpQuery}
                        onChange={(e) => setFollowUpQuery(e.target.value)}
                        placeholder="Ask a follow-up question regarding this situation..."
                        className="w-full bg-white dark:bg-slate-800 border border-sand-200 dark:border-slate-700 rounded-2xl py-4 pl-6 pr-14 shadow-sm focus:ring-2 focus:ring-brand-500 outline-none placeholder:text-slate-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleFollowUp()}
                    />
                    <button 
                        onClick={handleFollowUp}
                        disabled={loadingFollowUp || !followUpQuery.trim()}
                        className="absolute right-2 top-2 p-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50"
                        aria-label="Send follow-up question"
                    >
                        {loadingFollowUp ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    </button>
                </div>
            </div>
        </div>
    )
}

interface VariationCardProps {
    variation: ReframeVariation;
    onSave?: () => void;
    small?: boolean;
}

const VariationCard: React.FC<VariationCardProps> = ({ variation, onSave, small }) => {
    const Icon = variation.type === 'ROOTS' ? Sprout : variation.type === 'BRANCHES' ? GitFork : Wrench;
    const color = variation.type === 'ROOTS' ? 'text-green-600 bg-green-50' : variation.type === 'BRANCHES' ? 'text-blue-600 bg-blue-50' : 'text-orange-600 bg-orange-50';
    
    return (
        <div className={`bg-white dark:bg-slate-800 rounded-2xl border border-sand-200 dark:border-slate-700 overflow-hidden flex flex-col ${small ? 'p-4' : 'p-6 hover:shadow-lg transition-shadow'}`}>
            <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color} dark:bg-opacity-20`}>
                    <Icon size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wide">{variation.type}</h4>
                    <h3 className={`font-serif font-bold text-slate-900 dark:text-sand-100 ${small ? 'text-lg' : 'text-xl'}`}>{variation.title}</h3>
                </div>
            </div>
            
            <p className={`text-slate-600 dark:text-slate-300 mb-6 flex-1 ${small ? 'text-xs' : 'text-sm'}`}>{variation.context}</p>
            
            {!small && (
                <div className="bg-sand-50 dark:bg-slate-900/50 p-4 rounded-xl mb-6 relative">
                    <Quote className="absolute top-2 right-2 text-slate-200 dark:text-slate-700 w-6 h-6" />
                    <p className="italic text-slate-700 dark:text-slate-300 text-sm mb-2">"{variation.quote}"</p>
                    <p className="text-xs font-bold text-slate-500">— {variation.author}</p>
                </div>
            )}

            <div className="space-y-3 mb-6">
                {variation.suggestedTasks.map((task, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <CheckCircle2 size={16} className="text-brand-500 mt-0.5 flex-shrink-0" />
                        <span>{task}</span>
                    </div>
                ))}
            </div>

            {onSave && (
                <button 
                    onClick={onSave}
                    className="w-full py-2.5 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 font-bold rounded-xl hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors text-sm"
                >
                    Create Project
                </button>
            )}
        </div>
    );
};

// --- Landing Page Content ---

const LandingPageContent: React.FC<{
  onStart: () => void;
  lang: Language;
  landingView: View;
  setLandingView: (v: View) => void;
  onSearch: (q: string) => void;
}> = ({ onStart, lang, landingView, setLandingView, onSearch }) => {
  const t = translations[lang];
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(searchInput.trim()) onSearch(searchInput);
  };

  if (landingView === View.ROOTS) return <RootsPage onBack={() => setLandingView(View.DASHBOARD)} />;
  if (landingView === View.BRANCHES) return <BranchesPage onBack={() => setLandingView(View.DASHBOARD)} />;
  if (landingView === View.TOOLBOX) return <ToolboxPage onBack={() => setLandingView(View.DASHBOARD)} />;
  
  if (landingView === View.ABOUT) return <AboutPage />;
  if (landingView === View.TERMS) return <TermsPage />;
  if (landingView === View.PRIVACY) return <PrivacyPage />;

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-100/50 dark:bg-brand-900/20 rounded-full blur-3xl -z-10"></div>
        
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-brand-100 dark:border-slate-700 shadow-sm mb-8 animate-fade-in-up">
            <Sparkles size={16} className="text-brand-500" />
            <span className="text-xs font-bold tracking-widest text-slate-600 dark:text-slate-300 uppercase">{t.subsubtitle}</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-serif font-bold text-slate-900 dark:text-sand-50 mb-8 leading-tight animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-800 to-clay-700 dark:from-brand-200 dark:to-clay-200">
               {t.subtitle}
            </span>
          </h2>
          
          <div className="max-w-xl mx-auto mb-12 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
             <form onSubmit={handleSearchSubmit} className="relative group">
                 <div className="absolute inset-0 bg-brand-200 dark:bg-brand-900/50 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                 <label htmlFor="hero-search" className="sr-only">{t.searchPlaceholder}</label>
                 <input 
                   id="hero-search"
                   value={searchInput}
                   onChange={(e) => setSearchInput(e.target.value)}
                   className="w-full py-5 pl-6 pr-16 rounded-2xl bg-white dark:bg-slate-800 border border-sand-200 dark:border-slate-700 shadow-xl text-lg text-slate-800 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 relative z-10"
                   placeholder={t.searchPlaceholder}
                 />
                 <button type="submit" className="absolute right-3 top-3 bottom-3 aspect-square bg-brand-600 hover:bg-brand-700 text-white rounded-xl z-20 flex items-center justify-center transition-all hover:scale-105" aria-label="Search">
                     <ArrowRight size={24} />
                 </button>
             </form>
          </div>
        </div>
      </section>

      {/* 3 Pillars Section */}
      <section className="py-20 bg-white dark:bg-slate-900/50">
         <div className="max-w-6xl mx-auto px-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <button onClick={() => setLandingView(View.ROOTS)} className="group cursor-pointer p-8 rounded-3xl bg-sand-50 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors border border-transparent hover:border-brand-100 dark:hover:border-slate-700 text-left w-full focus:outline-none focus:ring-2 focus:ring-brand-500">
                     <div className="w-14 h-14 rounded-2xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                         <Sprout size={32} />
                     </div>
                     <h3 className="text-2xl font-serif font-bold text-slate-800 dark:text-white mb-3">{t.roots}</h3>
                     <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{t.rootsDesc}</p>
                     <span className="text-brand-600 font-bold text-sm flex items-center gap-2 group-hover:translate-x-2 transition-transform">Explore Roots <ArrowRight size={16} /></span>
                 </button>
                 
                 <button onClick={() => setLandingView(View.BRANCHES)} className="group cursor-pointer p-8 rounded-3xl bg-sand-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border border-transparent hover:border-blue-100 dark:hover:border-slate-700 text-left w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                     <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                         <GitFork size={32} />
                     </div>
                     <h3 className="text-2xl font-serif font-bold text-slate-800 dark:text-white mb-3">{t.branches}</h3>
                     <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{t.branchesDesc}</p>
                     <span className="text-blue-600 font-bold text-sm flex items-center gap-2 group-hover:translate-x-2 transition-transform">Explore Branches <ArrowRight size={16} /></span>
                 </button>

                 <button onClick={() => setLandingView(View.TOOLBOX)} className="group cursor-pointer p-8 rounded-3xl bg-sand-50 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors border border-transparent hover:border-orange-100 dark:hover:border-slate-700 text-left w-full focus:outline-none focus:ring-2 focus:ring-orange-500">
                     <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                         <Wrench size={32} />
                     </div>
                     <h3 className="text-2xl font-serif font-bold text-slate-800 dark:text-white mb-3">{t.toolbox}</h3>
                     <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{t.toolboxDesc}</p>
                     <span className="text-orange-600 font-bold text-sm flex items-center gap-2 group-hover:translate-x-2 transition-transform">Open Toolbox <ArrowRight size={16} /></span>
                 </button>
             </div>
         </div>
      </section>
    </div>
  );
};

// --- Product Pages ---

const RootsPage = ({ onBack }: { onBack?: () => void }) => (
    <div className="animate-fade-in pb-20">
        {onBack && <button onClick={onBack} className="mb-8 flex items-center gap-2 text-slate-500 hover:text-brand-600"><ArrowLeft size={20} /> Back</button>}
        <div className="bg-green-50 dark:bg-green-900/10 rounded-3xl p-12 mb-12 border border-green-100 dark:border-green-900/30">
            <div className="flex items-start gap-6">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm text-green-600">
                    <Sprout size={48} />
                </div>
                <div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-green-900 dark:text-green-100 mb-4">The Roots</h1>
                    <p className="text-xl text-green-800 dark:text-green-200 leading-relaxed max-w-2xl">
                        Deep wisdom, philosophy, and spiritual grounding. Before we act, we must understand.
                    </p>
                </div>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
             <div className="p-8 bg-white dark:bg-slate-800 rounded-3xl border border-sand-100 dark:border-slate-700">
                 <h3 className="text-2xl font-serif font-bold mb-4">Core Principles</h3>
                 <ul className="space-y-4">
                     <li className="flex gap-3"><CheckCircle2 className="text-green-600" /> Stoic Resilience</li>
                     <li className="flex gap-3"><CheckCircle2 className="text-green-600" /> Eastern Mindfulness</li>
                     <li className="flex gap-3"><CheckCircle2 className="text-green-600" /> Existential Purpose</li>
                 </ul>
             </div>
             <div className="p-8 bg-white dark:bg-slate-800 rounded-3xl border border-sand-100 dark:border-slate-700">
                 <h3 className="text-2xl font-serif font-bold mb-4">Why it Matters</h3>
                 <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                     Without strong roots, a tree falls in the storm. Your mindset determines your reality.
                 </p>
             </div>
        </div>
    </div>
);

const BranchesPage = ({ onBack }: { onBack?: () => void }) => (
    <div className="animate-fade-in pb-20">
        {onBack && <button onClick={onBack} className="mb-8 flex items-center gap-2 text-slate-500 hover:text-brand-600"><ArrowLeft size={20} /> Back</button>}
        <div className="bg-blue-50 dark:bg-blue-900/10 rounded-3xl p-12 mb-12 border border-blue-100 dark:border-blue-900/30">
            <div className="flex items-start gap-6">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm text-blue-600">
                    <GitFork size={48} />
                </div>
                <div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-blue-900 dark:text-blue-100 mb-4">The Branches</h1>
                    <p className="text-xl text-blue-800 dark:text-blue-200 leading-relaxed max-w-2xl">
                        Practical application in the real world. Career, relationships, finance, and health.
                    </p>
                </div>
            </div>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
             {['Career', 'Relationships', 'Health'].map(cat => (
                 <div key={cat} className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-sand-100 dark:border-slate-700 text-center">
                     <h3 className="text-xl font-bold mb-2">{cat}</h3>
                     <p className="text-sm text-slate-500">Apply wisdom to grow in your {cat.toLowerCase()}.</p>
                 </div>
             ))}
        </div>
    </div>
);

const ToolboxPage = ({ onBack }: { onBack?: () => void }) => (
    <div className="animate-fade-in pb-20">
        {onBack && <button onClick={onBack} className="mb-8 flex items-center gap-2 text-slate-500 hover:text-brand-600"><ArrowLeft size={20} /> Back</button>}
        <div className="bg-orange-50 dark:bg-orange-900/10 rounded-3xl p-12 mb-12 border border-orange-100 dark:border-orange-900/30">
            <div className="flex items-start gap-6">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm text-orange-600">
                    <Wrench size={48} />
                </div>
                <div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-orange-900 dark:text-orange-100 mb-4">The Toolbox</h1>
                    <p className="text-xl text-orange-800 dark:text-orange-200 leading-relaxed max-w-2xl">
                        Immediate, actionable mental models and techniques to change your state instantly.
                    </p>
                </div>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {['Box Breathing', 'The Pause Button', 'Reframing', 'Journaling', 'Visualization', 'Gratitude Audit'].map((tool, i) => (
                <button key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-sand-200 dark:border-slate-700 hover:shadow-lg transition-all cursor-pointer group text-left w-full focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-lg text-slate-800 dark:text-white">{tool}</h4>
                        <ArrowRight className="text-slate-300 group-hover:text-orange-500 transition-colors" size={20} />
                    </div>
                    <div className="h-2 w-12 bg-orange-200 rounded-full"></div>
                </button>
            ))}
        </div>
    </div>
);

// --- New Project Modal ---

const NewProjectModal = ({ isOpen, onClose, onCreate }: { isOpen: boolean, onClose: () => void, onCreate: (p: Project) => void }) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState<'Personal'|'Career'|'Health'|'Spiritual'>('Personal');
  const [loadingTasks, setLoadingTasks] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingTasks(true);
    
    // AI Generate Tasks
    const suggested = await suggestProjectTasks(title, desc);
    const tasks: Task[] = suggested.map((t, i) => ({
      id: `task-${Date.now()}-${i}`,
      title: t,
      isCompleted: false,
      priority: 'Medium'
    }));

    const newProject: Project = {
      id: Date.now().toString(),
      title,
      description: desc,
      category,
      progress: 0,
      tasks,
      notes: [],
      createdAt: Date.now()
    };

    onCreate(newProject);
    setLoadingTasks(false);
    setTitle(''); setDesc('');
  };

  return (
    <div className="fixed inset-0 bg-brand-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="new-project-title">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg p-8 shadow-2xl border border-sand-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h3 id="new-project-title" className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Begin Journey</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close modal"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="project-name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Project Name</label>
            <input 
              id="project-name"
              required 
              autoFocus
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-sand-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none" 
              placeholder="e.g. Run a Marathon" 
            />
          </div>
          <div>
            <label htmlFor="project-desc" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Why this matters?</label>
            <textarea 
              id="project-desc"
              required 
              value={desc} 
              onChange={e => setDesc(e.target.value)} 
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-sand-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none h-24 resize-none" 
              placeholder="Describe your intent..." 
            />
          </div>
          <div>
            <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Domain</span>
            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Project Domain">
              {(['Personal', 'Career', 'Health', 'Spiritual'] as const).map(cat => (
                <button 
                  type="button" 
                  key={cat} 
                  role="radio"
                  aria-checked={category === cat}
                  onClick={() => setCategory(cat)} 
                  className={`py-3 rounded-xl border font-medium text-sm transition-all ${category === cat ? 'bg-brand-50 dark:bg-brand-900/30 border-brand-500 text-brand-700 dark:text-brand-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <button disabled={loadingTasks} type="submit" className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg flex justify-center items-center gap-2">
            {loadingTasks ? <Loader2 className="animate-spin" /> : 'Create Project'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Unified Login Modal ---

const LoginModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setLoading(true);
      try {
          if (isSignUp) {
             await signUpWithEmail(email, password, name);
          } else {
             await loginWithEmail(email, password);
          }
          onClose();
      } catch (err: any) {
          setError(err.message || 'Authentication failed');
      } finally {
          setLoading(false);
      }
  };

  const handleSocial = async () => {
      try {
          await signInWithSocial();
          onClose();
      } catch (err) { console.error(err); }
  };

  return (
    <div className="fixed inset-0 bg-brand-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="login-title">
       <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-8 shadow-2xl border border-sand-100 dark:border-slate-800">
           <div className="text-center mb-8">
               <h2 id="login-title" className="text-3xl font-serif font-bold text-slate-900 dark:text-white mb-2">
                   {isSignUp ? 'Join the Journey' : 'Welcome Back'}
               </h2>
               <p className="text-slate-500 text-sm">Your path to a better self starts here.</p>
           </div>

           {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 text-center">{error}</div>}

           <form onSubmit={handleSubmit} className="space-y-4">
               {isSignUp && (
                   <div className="space-y-1">
                       <label htmlFor="auth-name" className="text-xs font-bold text-slate-500 uppercase">Name</label>
                       <input 
                         id="auth-name"
                         required 
                         autoFocus
                         value={name} 
                         onChange={e => setName(e.target.value)} 
                         className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-sand-50 dark:bg-slate-800 dark:text-white outline-none focus:border-brand-500" 
                       />
                   </div>
               )}
               <div className="space-y-1">
                   <label htmlFor="auth-email" className="text-xs font-bold text-slate-500 uppercase">Email</label>
                   <input 
                     id="auth-email"
                     required 
                     type="email" 
                     value={email} 
                     onChange={e => setEmail(e.target.value)} 
                     className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-sand-50 dark:bg-slate-800 dark:text-white outline-none focus:border-brand-500" 
                   />
               </div>
               <div className="space-y-1">
                   <label htmlFor="auth-pass" className="text-xs font-bold text-slate-500 uppercase">Password</label>
                   <input 
                     id="auth-pass"
                     required 
                     type="password" 
                     value={password} 
                     onChange={e => setPassword(e.target.value)} 
                     className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-3 bg-sand-50 dark:bg-slate-800 dark:text-white outline-none focus:border-brand-500" 
                   />
               </div>
               
               <button disabled={loading} type="submit" className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition-all shadow-lg mt-2">
                   {loading ? <Loader2 className="animate-spin mx-auto" /> : (isSignUp ? 'Create Account' : 'Sign In')}
               </button>
           </form>

           <div className="relative my-6">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700"></div></div>
               <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-slate-900 text-slate-400">Or continue with</span></div>
           </div>

           <button onClick={handleSocial} className="w-full py-3 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium text-slate-700 dark:text-slate-300">
               <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
               Google
           </button>

           <div className="mt-6 text-center text-sm">
               <span className="text-slate-500">{isSignUp ? 'Already have an account?' : "Don't have an account?"}</span>
               <button onClick={() => setIsSignUp(!isSignUp)} className="ml-2 font-bold text-brand-600 hover:underline">
                   {isSignUp ? 'Sign In' : 'Sign Up'}
               </button>
           </div>
           
           <button onClick={onClose} className="absolute top-4 right-4 text-slate-300 hover:text-slate-500" aria-label="Close modal"><X size={20} /></button>
       </div>
    </div>
  )
}

// --- Main App Component ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>(View.DASHBOARD);
  const [landingView, setLandingView] = useState<View>(View.DASHBOARD);
  const [lang, setLang] = useState<Language>('en');
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Search Results view handler for public search
  const handlePublicSearch = (q: string) => {
      setSearchQuery(q);
      setView(View.SEARCH_RESULTS); // If logged in, this view exists in portal. 
      // If logged out, we need to handle "Public Search Results".
      // For simplicity, we render SearchResultsPage in main content if user is logged out too.
  };

  useEffect(() => {
    const unsub = subscribeToAuth(u => {
        setUser(u);
        if (u) {
            setView(View.DASHBOARD); // Default to Dashboard on login
        } else {
            setView(View.DASHBOARD); // Default to landing
        }
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setView(View.DASHBOARD);
    setLandingView(View.DASHBOARD);
    window.scrollTo(0, 0);
  };

  // Helper for footer navigation
  const handleFooterNavigate = (targetView: View) => {
    if (user) {
      setView(targetView);
    } else {
      setLandingView(targetView);
    }
    window.scrollTo(0, 0);
  };

  const t = translations[lang];

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-200 selection:text-brand-900">
      
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${user ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-sand-200 dark:border-slate-800' : 'bg-white/80 dark:bg-brand-950/80 backdrop-blur-md'}`}>
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between relative">
          
            <button 
              onClick={() => { setView(View.DASHBOARD); setLandingView(View.DASHBOARD); }}
              className="flex items-center gap-3 cursor-pointer group z-10 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg"
              aria-label="Go to home"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white dark:bg-brand-200 dark:text-brand-900 flex items-center justify-center shadow-lg shadow-brand-500/20 dark:shadow-none group-hover:scale-105 transition-all duration-500">
                <Leaf size={24} />
              </div>
              <h1 className="text-2xl font-serif font-bold text-slate-900 dark:text-sand-100 tracking-tight">Reframe</h1>
            </button>
            
            {/* Desktop Nav - Centered */}
            {!user && (
               <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-8" aria-label="Main Navigation">
                  <button onClick={() => setLandingView(View.ROOTS)} className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-200 transition-colors group">
                      <div className="p-1.5 rounded-lg bg-transparent group-hover:bg-brand-50 dark:group-hover:bg-white/10 transition-colors">
                        <Sprout size={18} />
                      </div>
                      <span>{t.roots}</span>
                  </button>
                  <button onClick={() => setLandingView(View.BRANCHES)} className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-200 transition-colors group">
                      <div className="p-1.5 rounded-lg bg-transparent group-hover:bg-brand-50 dark:group-hover:bg-white/10 transition-colors">
                        <GitFork size={18} />
                      </div>
                      <span>{t.branches}</span>
                  </button>
                  <button onClick={() => setLandingView(View.TOOLBOX)} className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-200 transition-colors group">
                       <div className="p-1.5 rounded-lg bg-transparent group-hover:bg-brand-50 dark:group-hover:bg-white/10 transition-colors">
                        <Wrench size={18} />
                      </div>
                      <span>{t.toolbox}</span>
                  </button>
               </nav>
            )}

          <div className="flex items-center gap-4 z-10">
             {/* Hidden on Mobile: Language */}
             <div className="hidden md:flex items-center border border-slate-200 dark:border-slate-700 rounded-full p-1 bg-slate-50 dark:bg-slate-900">
                 <button onClick={() => setLang('en')} className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${lang === 'en' ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm' : 'text-slate-400'}`}>EN</button>
                 <button onClick={() => setLang('es')} className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${lang === 'es' ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm' : 'text-slate-400'}`}>ES</button>
             </div>

             <ThemeToggle />

             {user ? (
                 <div className="relative group">
                     <button className="w-10 h-10 rounded-full bg-brand-100 dark:bg-slate-800 flex items-center justify-center text-brand-700 dark:text-brand-400 font-bold border-2 border-transparent hover:border-brand-200 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500" aria-haspopup="true">
                         {user.displayName ? user.displayName[0] : <UserIcon size={20} />}
                     </button>
                     {/* Dropdown */}
                     <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-sand-100 dark:border-slate-700 overflow-hidden hidden group-hover:block animate-fade-in-up origin-top-right">
                         <div className="p-3 border-b border-sand-50 dark:border-slate-700">
                             <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user.displayName}</p>
                             <p className="text-xs text-slate-500 truncate">{user.email}</p>
                         </div>
                         <button className="w-full text-left px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-sand-50 dark:hover:bg-slate-700 flex items-center gap-2"><Settings size={16}/> Settings</button>
                         <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"><LogOut size={16}/> Sign Out</button>
                     </div>
                 </div>
             ) : (
                 <button 
                   onClick={() => setLoginOpen(true)}
                   className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-xl font-bold text-sm hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-brand-500"
                 >
                     {t.signIn}
                 </button>
             )}
             
             {/* Mobile Menu Toggle */}
             {!user && (
                 <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-slate-600 dark:text-slate-300" aria-label="Toggle menu">
                     {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                 </button>
             )}
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && !user && (
            <div className="md:hidden absolute top-20 left-0 right-0 bg-white dark:bg-slate-900 border-b border-sand-200 dark:border-slate-800 animate-fade-in shadow-xl p-6 flex flex-col gap-4">
                 <button onClick={() => {setLandingView(View.ROOTS); setMobileMenuOpen(false);}} className="flex items-center gap-3 text-lg font-serif font-bold text-slate-800 dark:text-white"><Sprout size={20} className="text-brand-500"/> {t.roots}</button>
                 <button onClick={() => {setLandingView(View.BRANCHES); setMobileMenuOpen(false);}} className="flex items-center gap-3 text-lg font-serif font-bold text-slate-800 dark:text-white"><GitFork size={20} className="text-brand-500"/> {t.branches}</button>
                 <button onClick={() => {setLandingView(View.TOOLBOX); setMobileMenuOpen(false);}} className="flex items-center gap-3 text-lg font-serif font-bold text-slate-800 dark:text-white"><Wrench size={20} className="text-brand-500"/> {t.toolbox}</button>
                 <hr className="border-slate-100 dark:border-slate-800" />
                 <div className="flex gap-4">
                     <button onClick={() => setLang('en')} className={`flex-1 py-2 rounded-lg text-sm font-bold border ${lang === 'en' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 dark:border-slate-700'}`}>English</button>
                     <button onClick={() => setLang('es')} className={`flex-1 py-2 rounded-lg text-sm font-bold border ${lang === 'es' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 dark:border-slate-700'}`}>Español</button>
                 </div>
            </div>
        )}
      </header>

      {/* Main Render Switch */}
      {user ? (
        <Portal 
            user={user} 
            currentView={view} 
            setView={setView} 
            lang={lang} 
            onLogout={handleLogout}
        />
      ) : (
          <main className="flex-1 pt-20">
              {/* If public search was triggered */}
              {view === View.SEARCH_RESULTS ? (
                   <div className="max-w-6xl mx-auto p-6 md:p-12">
                       <button onClick={() => setView(View.DASHBOARD)} className="mb-8 flex items-center gap-2 text-slate-500 hover:text-brand-600"><ArrowLeft size={20} /> Back Home</button>
                       <SearchResultsPage query={searchQuery} onSaveTask={() => setLoginOpen(true)} />
                   </div>
              ) : (
                  <LandingPageContent 
                    onStart={() => setLoginOpen(true)} 
                    lang={lang} 
                    landingView={landingView}
                    setLandingView={setLandingView}
                    onSearch={handlePublicSearch}
                  />
              )}
          </main>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-sand-200 dark:border-slate-800 py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
            <Leaf size={32} className="mx-auto text-brand-300 dark:text-slate-700 mb-6" />
            <p className="font-serif italic text-lg text-slate-700 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
               {t.footerQuote}
            </p>
            <div className="flex justify-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400 mb-8">
               <button onClick={() => handleFooterNavigate(View.ABOUT)} className="hover:text-brand-600 transition-colors focus:outline-none">{t.about}</button>
               <button onClick={() => handleFooterNavigate(View.TERMS)} className="hover:text-brand-600 transition-colors focus:outline-none">{t.terms}</button>
               <button onClick={() => handleFooterNavigate(View.PRIVACY)} className="hover:text-brand-600 transition-colors focus:outline-none">{t.privacy}</button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-500">© {new Date().getFullYear()} Reframe. All rights reserved.</p>
        </div>
      </footer>

      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}

// --- Theme Toggle ---
const ThemeToggle = () => {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
        setDark(true);
    }
  }, []);

  const toggle = () => {
    setDark(!dark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <button 
      onClick={toggle}
      className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};
