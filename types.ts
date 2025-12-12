
export enum Status {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export type Priority = 'High' | 'Medium' | 'Low';

export type Mood = 'Excited' | 'Confident' | 'Neutral' | 'Anxious' | 'Stuck' | 'Proud' | 'Overwhelmed';

export interface TaskNote {
  id: string;
  content: string;
  createdAt: number;
}

export interface ProjectNote {
  id: string;
  content: string;
  mood: Mood;
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
  notes: ProjectNote[]; // Added field
  createdAt: number;
  hasCompletedIntake?: boolean;
  userContext?: string;
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
  variations?: ReframeVariation[];
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
  PROJECT_DETAIL = 'PROJECT_DETAIL',
  ABOUT = 'ABOUT',
  TERMS = 'TERMS',
  PRIVACY = 'PRIVACY'
}
