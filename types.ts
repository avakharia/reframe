export enum Status {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
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

export enum View {
  DASHBOARD = 'DASHBOARD',
  PROJECTS = 'PROJECTS',
  WISDOM = 'WISDOM',
  PROFILE = 'PROFILE',
}
