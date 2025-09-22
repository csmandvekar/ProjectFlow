import { create } from 'zustand';
import api from '../api';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface TaskAssignee {
  user: User;
  role: 'primary' | 'secondary';
  assignedBy: User;
  assignedAt: string;
}

interface Comment {
  _id: string;
  content: string;
  author: User;
  createdAt: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'inprogress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignees: TaskAssignee[];
  deadline?: string;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: (projectId: string) => Promise<void>;
  createTask: (projectId: string, data: Partial<Task>) => Promise<Task>;
  updateTask: (projectId: string, taskId: string, data: Partial<Task>) => Promise<Task>;
  deleteTask: (projectId: string, taskId: string) => Promise<void>;
  addComment: (projectId: string, taskId: string, content: string) => Promise<Comment>;
  clearError: () => void;
}

const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async (projectId) => {
    set({ loading: true, error: null });
    try {
      console.log('Fetching tasks for project:', projectId);
      const response = await api.get(`/projects/${projectId}/tasks`);
      console.log('Tasks fetched:', response.data);
      
      // Ensure we have an array of tasks
      const tasks = Array.isArray(response.data) ? response.data : [];
      
      set({ 
        tasks,
        loading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      set({
        tasks: [],
        error: error.response?.data?.message || 'Failed to fetch tasks',
        loading: false
      });
      throw error;
    }
  },

  createTask: async (projectId, data) => {
    set({ loading: true, error: null });
    try {
      console.log('Creating task:', data);
      const response = await api.post(`/projects/${projectId}/tasks`, data);
      console.log('Task created:', response.data);
      
      set(state => ({
        tasks: [...state.tasks, response.data],
        loading: false,
        error: null
      }));
      
      return response.data;
    } catch (error: any) {
      console.error('Error creating task:', error);
      set({
        error: error.response?.data?.message || 'Failed to create task',
        loading: false
      });
      throw error;
    }
  },

  updateTask: async (projectId, taskId, data) => {
    set({ loading: true, error: null });
    try {
      console.log('Updating task:', taskId, data);
      const response = await api.patch(`/projects/${projectId}/tasks/${taskId}`, data);
      console.log('Task updated:', response.data);
      
      set(state => ({
        tasks: state.tasks.map(t => t._id === taskId ? response.data : t),
        loading: false,
        error: null
      }));
      
      return response.data;
    } catch (error: any) {
      console.error('Error updating task:', error);
      set({
        error: error.response?.data?.message || 'Failed to update task',
        loading: false
      });
      throw error;
    }
  },

  deleteTask: async (projectId, taskId) => {
    set({ loading: true, error: null });
    try {
      console.log('Deleting task:', taskId);
      await api.delete(`/projects/${projectId}/tasks/${taskId}`);
      console.log('Task deleted:', taskId);
      
      set(state => ({
        tasks: state.tasks.filter(t => t._id !== taskId),
        loading: false,
        error: null
      }));
    } catch (error: any) {
      console.error('Error deleting task:', error);
      set({
        error: error.response?.data?.message || 'Failed to delete task',
        loading: false
      });
      throw error;
    }
  },

  addComment: async (projectId, taskId, content) => {
    set({ loading: true, error: null });
    try {
      console.log('Adding comment to task:', taskId, content);
      const response = await api.post(`/projects/${projectId}/tasks/${taskId}/comments`, { content });
      console.log('Comment added:', response.data);
      
      // Update the task with the new comment
      const task = get().tasks.find(t => t._id === taskId);
      if (task) {
        task.comments = [...task.comments, response.data];
        set(state => ({
          tasks: state.tasks.map(t => t._id === taskId ? task : t),
          loading: false,
          error: null
        }));
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error adding comment:', error);
      set({
        error: error.response?.data?.message || 'Failed to add comment',
        loading: false
      });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));

export default useTaskStore;