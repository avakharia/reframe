
import React, { useState } from 'react';
import { Project, Task, Priority } from '../types';
import { Target, CheckCircle2, Circle, Trash2, AlertTriangle, X, Check, Edit2 } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onSelect: (id: string) => void;
  onToggleTask: (projectId: string, taskId: string) => void;
  onDelete: (projectId: string) => void;
  onUpdatePriority?: (projectId: string, taskId: string, priority: Priority) => void;
  onEditTask?: (projectId: string, task: Task) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect, onToggleTask, onDelete, onUpdatePriority, onEditTask }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Helper to get weight
  const getWeight = (p?: Priority) => {
    switch (p) {
      case 'High': return 3;
      case 'Medium': return 2;
      case 'Low': return 1;
      default: return 2; // Default to Medium weight
    }
  };

  // Weighted progress calculation
  const calculateProgress = () => {
    const tasks = project.tasks;
    if (tasks.length === 0) return 0;
    
    const totalWeight = tasks.reduce((sum, t) => sum + getWeight(t.priority), 0);
    const completedWeight = tasks.filter(t => t.isCompleted).reduce((sum, t) => sum + getWeight(t.priority), 0);
    
    if (totalWeight === 0) return 0;
    return Math.round((completedWeight / totalWeight) * 100);
  };

  const percentage = calculateProgress();

  // Updated Therapeutic Colors
  const getPriorityColor = (p?: Priority) => {
    switch (p) {
      case 'High': return 'bg-clay-500 shadow-clay-500/30'; // Terracotta
      case 'Medium': return 'bg-warning shadow-warning/30'; // Muted Gold
      case 'Low': return 'bg-brand-400 shadow-brand-400/30'; // Sage
      default: return 'bg-slate-300 dark:bg-slate-600';
    }
  };

  const cyclePriority = (e: React.MouseEvent, taskId: string, current?: Priority) => {
    e.stopPropagation();
    if (!onUpdatePriority) return;
    
    const next: Priority = current === 'High' ? 'Low' : current === 'Low' ? 'Medium' : 'High';
    onUpdatePriority(project.id, taskId, next);
  };

  const handleEditClick = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    if (onEditTask) {
      onEditTask(project.id, task);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm border border-sand-200 dark:border-slate-700 p-6 hover:shadow-md transition-all duration-300 relative overflow-hidden group flex flex-col h-full hover:border-brand-200 dark:hover:border-brand-800">
      
      {/* Delete Confirmation Overlay */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-white/95 dark:bg-slate-800/95 z-20 flex flex-col items-center justify-center p-4 text-center animate-fade-in backdrop-blur-sm rounded-2xl" role="alertdialog" aria-labelledby="delete-dialog-title" aria-describedby="delete-dialog-desc">
          <AlertTriangle className="text-danger mb-2" size={32} />
          <h4 id="delete-dialog-title" className="text-slate-800 dark:text-sand-100 font-serif font-bold mb-1 text-lg">Delete Project?</h4>
          <p id="delete-dialog-desc" className="text-xs text-slate-500 dark:text-slate-400 mb-4">This action cannot be undone.</p>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowDeleteConfirm(false)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label="Cancel Delete"
            >
              <X size={18} />
            </button>
            <button 
              onClick={() => onDelete(project.id)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-danger hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Confirm Delete"
            >
              <Check size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-start mb-2">
        <button 
          onClick={() => onSelect(project.id)} 
          className="cursor-pointer flex-1 pr-4 text-left focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-lg group/title"
        >
          {/* Title Emphasized */}
          <h3 className="text-2xl font-serif font-bold text-slate-800 dark:text-sand-100 leading-tight group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
            {project.title}
          </h3>
        </button>
        <div className="flex flex-col items-end gap-2">
           {/* Delete Button */}
           <button 
             onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
             className="text-slate-300 hover:text-danger dark:text-slate-600 dark:hover:text-danger transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 focus-visible:opacity-100 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
             aria-label={`Delete project ${project.title}`}
           >
             <Trash2 size={18} />
           </button>
        </div>
      </div>
      
      <p className="text-slate-600 dark:text-slate-300 text-sm mb-5 line-clamp-2 min-h-[2.5rem] leading-relaxed">
        {project.description}
      </p>
      
      <div className="mb-6">
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">
          <span>Progress</span>
          <span>{percentage}%</span>
        </div>
        <div className="w-full bg-sand-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100} aria-label="Project Progress">
          <div 
            className="bg-brand-500 dark:bg-brand-400 h-2 rounded-full transition-all duration-700 ease-out" 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-3 flex-1">
        {project.tasks.slice(0, 3).map(task => (
          <div 
            key={task.id} 
            className="flex items-center group/task select-none relative py-1" 
          >
            {/* Click to Toggle Completion */}
            <button 
              className="relative mr-3 flex-shrink-0 w-5 h-5 cursor-pointer hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-full"
              onClick={(e) => { e.stopPropagation(); onToggleTask(project.id, task.id); }}
              aria-label={task.isCompleted ? `Mark ${task.title} incomplete` : `Mark ${task.title} complete`}
            >
               <CheckCircle2 
                 size={20} 
                 className={`text-success absolute inset-0 transition-all duration-300 transform ${task.isCompleted ? 'scale-100 opacity-100 rotate-0' : 'scale-50 opacity-0 -rotate-45'}`} 
               />
               <Circle 
                 size={20} 
                 className={`text-slate-300 dark:text-slate-600 group-hover/task:text-brand-500 absolute inset-0 transition-all duration-300 transform ${task.isCompleted ? 'scale-50 opacity-0' : 'scale-100 opacity-100'}`} 
               />
            </button>
            
            {/* Click to Edit Task */}
            <button 
              className={`text-sm truncate transition-all duration-300 flex-1 cursor-pointer text-left hover:text-brand-700 dark:hover:text-brand-300 focus:outline-none focus:underline ${task.isCompleted ? 'text-slate-400 dark:text-slate-500 line-through opacity-70' : 'text-slate-700 dark:text-slate-200'}`}
              onClick={(e) => handleEditClick(e, task)}
            >
              {task.title}
            </button>

            <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover/task:opacity-100 focus-within:opacity-100 transition-opacity">
               {/* Priority Indicator */}
               <button 
                  onClick={(e) => cyclePriority(e, task.id, task.priority)}
                  className={`w-2.5 h-2.5 rounded-full shadow-sm cursor-pointer ${getPriorityColor(task.priority)} hover:scale-125 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-500`}
                  title={`Priority: ${task.priority || 'Medium'} (Click to change)`}
                  aria-label={`Change priority for ${task.title}. Current: ${task.priority || 'Medium'}`}
               />
               
               {/* Edit Button */}
               <button
                 onClick={(e) => handleEditClick(e, task)}
                 className="text-slate-300 hover:text-brand-500 dark:text-slate-600 dark:hover:text-brand-400 p-1 rounded focus:outline-none focus:ring-2 focus:ring-brand-500"
                 aria-label={`Edit ${task.title}`}
               >
                 <Edit2 size={14} />
               </button>
            </div>
          </div>
        ))}
        {project.tasks.length > 3 && (
          <p className="text-xs text-slate-400 dark:text-slate-500 pl-8 pt-1 italic">+ {project.tasks.length - 3} more tasks</p>
        )}
      </div>

      {/* Footer: Category at bottom */}
      <div className="mt-5 pt-4 border-t border-sand-100 dark:border-slate-700/50 flex justify-end">
         <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
            ${project.category === 'Career' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' : 
              project.category === 'Health' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' :
              project.category === 'Spiritual' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' :
              'bg-clay-50 text-clay-600 dark:bg-clay-900/20 dark:text-clay-300'}`}>
            {project.category}
          </span>
      </div>
    </div>
  );
};
