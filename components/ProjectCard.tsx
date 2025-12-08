
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

  const getPriorityColor = (p?: Priority) => {
    switch (p) {
      case 'High': return 'bg-red-500 shadow-red-500/50';
      case 'Medium': return 'bg-yellow-500 shadow-yellow-500/50';
      case 'Low': return 'bg-blue-400 shadow-blue-400/50';
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
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 hover:shadow-md transition-all duration-200 relative overflow-hidden group flex flex-col h-full">
      
      {/* Delete Confirmation Overlay */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-white/95 dark:bg-slate-800/95 z-20 flex flex-col items-center justify-center p-4 text-center animate-fade-in backdrop-blur-sm">
          <AlertTriangle className="text-red-500 mb-2" size={32} />
          <h4 className="text-slate-800 dark:text-white font-bold mb-1">Delete Project?</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">This action cannot be undone.</p>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowDeleteConfirm(false)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <X size={18} />
            </button>
            <button 
              onClick={() => onDelete(project.id)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              <Check size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-start mb-2">
        <div 
          onClick={() => onSelect(project.id)} 
          className="cursor-pointer flex-1 pr-4"
        >
          {/* Title Emphasized */}
          <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 leading-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {project.title}
          </h3>
        </div>
        <div className="flex flex-col items-end gap-2">
           {/* Delete Button (visible on hover or always on touch) */}
           <button 
             onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
             className="text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
             aria-label="Delete Project"
           >
             <Trash2 size={18} />
           </button>
        </div>
      </div>
      
      <p className="text-slate-600 dark:text-slate-300 text-sm mb-5 line-clamp-2 min-h-[2.5rem]">{project.description}</p>
      
      <div className="mb-6">
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">
          <span>Progress</span>
          <span>{percentage}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-brand-500 h-2.5 rounded-full transition-all duration-700 ease-out" 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-3 flex-1">
        {project.tasks.slice(0, 3).map(task => (
          <div 
            key={task.id} 
            className="flex items-center group/task select-none relative" 
          >
            {/* Click to Toggle Completion */}
            <div 
              className="relative mr-3 flex-shrink-0 w-5 h-5 cursor-pointer hover:scale-110 transition-transform"
              onClick={(e) => { e.stopPropagation(); onToggleTask(project.id, task.id); }}
            >
               <CheckCircle2 
                 size={20} 
                 className={`text-green-500 absolute inset-0 transition-all duration-300 transform ${task.isCompleted ? 'scale-100 opacity-100 rotate-0' : 'scale-50 opacity-0 -rotate-45'}`} 
               />
               <Circle 
                 size={20} 
                 className={`text-slate-300 dark:text-slate-600 group-hover/task:text-brand-500 absolute inset-0 transition-all duration-300 transform ${task.isCompleted ? 'scale-50 opacity-0' : 'scale-100 opacity-100'}`} 
               />
            </div>
            
            {/* Click to Edit Task */}
            <span 
              className={`text-sm truncate transition-all duration-300 flex-1 cursor-pointer hover:text-brand-600 dark:hover:text-brand-400 ${task.isCompleted ? 'text-slate-400 dark:text-slate-500 line-through opacity-70' : 'text-slate-700 dark:text-slate-300'}`}
              onClick={(e) => handleEditClick(e, task)}
            >
              {task.title}
            </span>

            <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover/task:opacity-100 transition-opacity">
               {/* Priority Indicator */}
               <div 
                  onClick={(e) => cyclePriority(e, task.id, task.priority)}
                  className={`w-2.5 h-2.5 rounded-full shadow-sm cursor-pointer ${getPriorityColor(task.priority)} hover:scale-125 transition-transform`}
                  title={`Priority: ${task.priority || 'Medium'} (Click to change)`}
               />
               
               {/* Edit Button */}
               <button
                 onClick={(e) => handleEditClick(e, task)}
                 className="text-slate-300 hover:text-brand-500 dark:text-slate-600 dark:hover:text-brand-400 p-1"
               >
                 <Edit2 size={14} />
               </button>
            </div>
          </div>
        ))}
        {project.tasks.length > 3 && (
          <p className="text-xs text-slate-400 dark:text-slate-500 pl-8 pt-1">+ {project.tasks.length - 3} more tasks</p>
        )}
      </div>

      {/* Footer: Category at bottom */}
      <div className="mt-5 pt-4 border-t border-slate-50 dark:border-slate-700/50 flex justify-end">
         <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
            ${project.category === 'Career' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300' : 
              project.category === 'Health' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300' :
              project.category === 'Spiritual' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300' :
              'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-300'}`}>
            {project.category}
          </span>
      </div>
    </div>
  );
};
