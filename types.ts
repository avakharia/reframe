
export enum Status {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export type Priority = 'High' | 'Medium' | 'Low';

export interface TaskNote {
  id: string;
  content: string;
  createdAt: number;
}

export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  priority?: Priority;
  description?: string;
  notes?: TaskNote[];
  dueDate?: number;
  projectId?: string; 
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: 'Personal' | 'Career' | 'Spiritual' | 'Health';
  progress: number;
  tasks: Task[];
  createdAt: number;
}

export interface WisdomNugget {
  id: string;
  quote: string;
  author: string;
  context: string;
  tags: string[];
  actionableStep?: string;
}

export type ReframeType = 'ROOTS' | 'BRANCHES' | 'TOOLBOX';

export interface ReframeVariation {
  type: ReframeType;
  title: string; // e.g. "The Stoic Approach" or "Career Pivot"
  quote: string;
  author: string;
  context: string;
  suggestedTasks: string[]; // Max 3
}

export interface SearchResult {
  id: string;
  query: string;
  variations: ReframeVariation[];
}

export interface FollowUpResult {
  answer: string;
  suggestedTasks: string[]; // Max 3
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  PROJECTS = 'PROJECTS',
  TASKS = 'TASKS',
  WISDOM = 'WISDOM',
  PROFILE = 'PROFILE',
  ROOTS = 'ROOTS',
  BRANCHES = 'BRANCHES',
  TOOLBOX = 'TOOLBOX',
  SEARCH_RESULTS = 'SEARCH_RESULTS',
  PROJECT_DETAIL = 'PROJECT_DETAIL'
}
