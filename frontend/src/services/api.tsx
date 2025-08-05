import {
  Task,
  Subtask,
  CreateTaskPayload,
  UpdateTaskPayload,
  UpdateTaskDonePayload,
  GetTasksQueryParams,
  CreateSubtaskPayload,
  UpdateSubtaskPayload,
  UpdateSubtaskDonePayload,
} from '../types';

const BASE_URL = 'http://localhost:8080';

const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory data store for simulation
let tasks: Task[] = [
  {
    id: '1', title: 'Buy groceries', description: 'Milk, Eggs, Bread, Cheese', priority: 'High',
    assignee: 'John Doe', dueDate: new Date('2025-08-01').toISOString(), done: false
  },
  {
    id: '2', title: 'Finish report', description: 'Complete Q3 financial report', priority: 'High',
    assignee: 'Jane Smith', dueDate: new Date('2025-07-28').toISOString(), done: false
  },
  {
    id: '3', title: 'Call mechanic', description: 'Car check-up', priority: 'Medium',
    assignee: 'John Doe', dueDate: new Date('2025-08-05').toISOString(), done: true
  },
  {
    id: '4', title: 'Plan vacation', description: 'Research destinations', priority: 'Low',
    assignee: 'Alice Johnson', dueDate: null, done: false
  },
];

let subtasks: Subtask[] = [
  { id: 'sub1', taskId: '1', title: 'Milk', done: false },
  { id: 'sub2', taskId: '1', title: 'Eggs', done: true },
  { id: 'sub3', taskId: '2', title: 'Collect data', done: false },
  { id: 'sub4', taskId: '2', title: 'Write executive summary', done: false },
];

const generateId = (): string => Date.now().toString(36) + Math.random().toString(36).substr(2);


// Task API Calls
export const createTask = async (taskData: CreateTaskPayload): Promise<Task> => {
  console.log("API: Creating task", taskData);
  await simulateDelay(500);
  const newTask: Task = { id: generateId(), done: false, ...taskData, priority: taskData.priority }; // Ensure priority is correctly typed
  tasks.push(newTask);
  return newTask;
  // return fetch(`${BASE_URL}/tasks`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(taskData),
  // }).then(res => {
  //   if (!res.ok) throw new Error('Network response was not ok');
  //   return res.json() as Promise<Task>;
  // });
};

export const getTasks = async ({ assignee, status, sortBy }: GetTasksQueryParams): Promise<Task[]> => {
  console.log("API: Getting tasks with filters", { assignee, status, sortBy });
  await simulateDelay(300);
  let filteredTasks: Task[] = [...tasks];

  if (assignee) {
    filteredTasks = filteredTasks.filter(task => task.assignee === assignee);
  }
  if (status) {
    filteredTasks = filteredTasks.filter(task => status === 'completed' ? task.done : !task.done);
  }

  // Sort logic
  if (sortBy === 'dueDate') {
    filteredTasks.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  } else if (sortBy === 'priority') {
    const priorityOrder: Record<string, number> = { 'High': 3, 'Medium': 2, 'Low': 1 };
    filteredTasks.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));
  }
  return filteredTasks;
  // const queryParams = new URLSearchParams();
  // if (assignee) queryParams.append('assignee', assignee);
  // if (status) queryParams.append('status', status);
  // if (sortBy) queryParams.append('sortBy', sortBy);
  // return fetch(`${BASE_URL}/tasks?${queryParams.toString()}`).then(res => {
  //   if (!res.ok) throw new Error('Network response was not ok');
  //   return res.json() as Promise<Task[]>;
  // });
};

export const getAssignees = async (): Promise<string[]> => {
  console.log("API: Getting tasks with filters",);
  await simulateDelay(300);
  let assignees: string[] = ['John Doe', 'Jane Smith', 'Alice Johnson'];
  return assignees;
};

export const getTaskByID = async (id: string): Promise<Task> => {
  console.log("API: Getting task by ID", id);
  await simulateDelay(300);
  const task = tasks.find(t => t.id === id);
  if (!task) throw new Error('Task not found');
  return task;
  // return fetch(`${BASE_URL}/tasks/${id}`).then(res => {
  //   if (!res.ok) throw new Error('Network response was not ok');
  //   return res.json() as Promise<Task>;
  // });
};

export const updateTask = async ({ id, ...updatedData }: UpdateTaskPayload): Promise<Task> => {
  console.log("API: Updating task", id, updatedData);
  await simulateDelay(500);
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) throw new Error('Task not found');
  tasks[index] = { ...tasks[index], ...updatedData };
  return tasks[index];
  // return fetch(`${BASE_URL}/tasks/${id}`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(updatedData),
  // }).then(res => {
  //   if (!res.ok) throw new Error('Network response was not ok');
  //   return res.json() as Promise<Task>;
  // });
};

export const deleteTask = async (id: string): Promise<{ message: string }> => {
  console.log("API: Deleting task", id);
  await simulateDelay(500);
  tasks = tasks.filter(t => t.id !== id);
  subtasks = subtasks.filter(st => st.taskId !== id); // Also delete associated subtasks
  return { message: 'Task deleted' };
  // return fetch(`${BASE_URL}/tasks/${id}`, { method: 'DELETE' }).then(res => {
  //   if (!res.ok) throw new Error('Network response was not ok');
  //   return res.json() as Promise<{ message: string }>;
  // });
};

export const updateTaskDone = async ({ id, done }: UpdateTaskDonePayload): Promise<Task> => {
  console.log("API: Updating task done status", id, done);
  await simulateDelay(300);
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) throw new Error('Task not found');
  tasks[index].done = done;
  return tasks[index];
  // return fetch(`${BASE_URL}/tasks/${id}/done`, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ done }),
  // }).then(res => {
  //   if (!res.ok) throw new Error('Network response was not ok');
  //   return res.json() as Promise<Task>;
  // });
};

// Subtask API Calls
export const createSubtask = async ({ taskId, title }: CreateSubtaskPayload): Promise<Subtask> => {
  console.log("API: Creating subtask", taskId, title);
  await simulateDelay(500);
  const newSubtask: Subtask = { id: generateId(), taskId, title, done: false };
  subtasks.push(newSubtask);
  return newSubtask;
  // return fetch(`${BASE_URL}/tasks/${taskId}/subtasks`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ title }),
  // }).then(res => {
  //   if (!res.ok) throw new Error('Network response was not ok');
  //   return res.json() as Promise<Subtask>;
  // });
};

export const getSubtasks = async (taskId: string): Promise<Subtask[]> => {
  console.log("API: Getting subtasks for task", taskId);
  await simulateDelay(300);
  return subtasks.filter(st => st.taskId === taskId);
  // return fetch(`${BASE_URL}/tasks/${taskId}/subtasks`).then(res => {
  //   if (!res.ok) throw new Error('Network response was not ok');
  //   return res.json() as Promise<Subtask[]>;
  // });
};

export const updateSubtask = async ({ id, title }: UpdateSubtaskPayload): Promise<Subtask> => {
  console.log("API: Updating subtask", id, title);
  await simulateDelay(500);
  const index = subtasks.findIndex(st => st.id === id);
  if (index === -1) throw new Error('Subtask not found');
  subtasks[index] = { ...subtasks[index], title: title ?? "" };
  return subtasks[index];   
  // return fetch(`${BASE_URL}/subtasks/${id}`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ title }),
  // }).then(res => {
  //   if (!res.ok) throw new Error('Network response was not ok');
  //   return res.json() as Promise<Subtask>;
  // });
};

export const deleteSubtask = async (id: string): Promise<{ message: string }> => {
  console.log("API: Deleting subtask", id);
  await simulateDelay(500);
  subtasks = subtasks.filter(st => st.id !== id);
  return { message: 'Subtask deleted' };
  // return fetch(`${BASE_URL}/subtasks/${id}`, { method: 'DELETE' }).then(res => {
  //   if (!res.ok) throw new Error('Network response was not ok');
  //   return res.json() as Promise<{ message: string }>;
  // });
};

export const updateSubtaskDone = async ({ id, done }: UpdateSubtaskDonePayload): Promise<Subtask> => {
  console.log("API: Updating subtask done status", id, done);
  await simulateDelay(300);
  const index = subtasks.findIndex(st => st.id === id);
  if (index === -1) throw new Error('Subtask not found');
  subtasks[index].done = done;
  return subtasks[index];
  // return fetch(`${BASE_URL}/subtasks/${id}/done`, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ done }),
  // }).then(res => {
  //   if (!res.ok) throw new Error('Network response was not ok');
  //   return res.json() as Promise<Subtask>;
  // });
};