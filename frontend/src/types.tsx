// types.ts

export type Priority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  assignee?: string;
  dueDate?: string | null; // ISO string for date
  done: boolean;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  done: boolean;
}

// API Request/Response Types
export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority: Priority;
  assignee?: string;
  dueDate?: string | null;
}

export interface UpdateTaskPayload {
  id: string;
  title?: string;
  description?: string;
  priority?: Priority;
  assignee?: string;
  dueDate?: string | null;
  done?: boolean;
}

export interface UpdateTaskDonePayload {
  id: string;
  done: boolean;
}

export interface GetTasksQueryParams {
  assignee?: string;
  status?: 'completed' | 'pending' | '';
  sortBy?: 'dueDate' | 'priority';
}

export interface CreateSubtaskPayload {
  taskId: string;
  title: string;
}

export interface UpdateSubtaskPayload {
  id: string;
  title?: string;
  done?: boolean;
}

export interface UpdateSubtaskDonePayload {
  id: string;
  done: boolean;
}