import React from 'react';
import { Project } from '../types';
import { Target, CheckCircle2, Circle } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onSelect: (id: string) => void;
  onToggleTask: (projectId: string, taskId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect, onToggleTask }) => {
  const completedTasks = project.tasks.filter(t => t.isCompleted).length;
  const totalTasks = project.tasks.length;
  const percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 hover:shadow-md transition-all duration-200">
      <div className="flex justify-between items-start mb-3">
        <div 
          onClick={() => onSelect(project.id)} 
          className="cursor-pointer"
        >
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 
            ${project.category === 'Career' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 
              project.category === 'Health' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
              project.category === 'Spiritual' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
              'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'}`}>
            {project.category}
          </span>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{project.title}</h3>
        </div>
        <div className="text-slate-400 dark:text-slate-500">
          <Target size={20} />
        </div>
      </div>
      
      <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-2">{project.description}</p>
      
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span>Progress</span>
          <span>{percentage}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
          <div 
            className="bg-brand-500 h-2 rounded-full transition-all duration-500" 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {project.tasks.slice(0, 3).map(task => (
          <div key={task.id} className="flex items-center group cursor-pointer" onClick={() => onToggleTask(project.id, task.id)}>
            {task.isCompleted ? (
              <CheckCircle2 size={16} className="text-green-500 mr-2 flex-shrink-0" />
            ) : (
              <Circle size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-brand-500 mr-2 flex-shrink-0 transition-colors" />
            )}
            <span className={`text-sm truncate ${task.isCompleted ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
              {task.title}
            </span>
          </div>
        ))}
        {project.tasks.length > 3 && (
          <p className="text-xs text-slate-400 dark:text-slate-500 pl-6">+ {project.tasks.length - 3} more tasks</p>
        )}
      </div>
    </div>
  );
};