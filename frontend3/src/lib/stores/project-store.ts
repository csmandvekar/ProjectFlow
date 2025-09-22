import { create } from 'zustand';
import api from '../api';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Member {
  user: User;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

export type ProjectStatus = 'active' | 'completed' | 'on-hold' | 'cancelled';

interface Project {
  _id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  owner: User;
  members: Member[];
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (data: { title: string; description?: string; deadline?: string; status?: ProjectStatus }) => Promise<Project>;
  updateProject: (id: string, data: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  addMember: (projectId: string, email: string) => Promise<void>;
  removeMember: (projectId: string, memberId: string) => Promise<void>;
  clearError: () => void;
}

const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
  initialized: false,

  fetchProjects: async () => {
    if (get().loading) {
      console.log("Already loading projects, skipping fetch");
      return;
    }
    set({ loading: true, error: null });
    try {
      const response = await api.get('/projects');
      
      // Validate and sanitize project data
      const validatedProjects = response.data.map((project: any) => ({
        ...project,
        members: Array.isArray(project.members) 
          ? project.members.filter((m: any) => m && m.user && m.user._id && m.user.name)
          : []
      }));

      console.log('Validated projects:', validatedProjects);

      set({ 
        projects: validatedProjects, 
        loading: false, 
        initialized: true,
        error: null 
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch projects';
      set({ error: errorMessage, loading: false, initialized: true });
      throw error;
    }
  },

  fetchProject: async (id) => {
    if (get().loading) {
      console.log(`Already loading project ${id}, skipping fetch`);
      return;
    }
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/projects/${id}`);
      
      // Validate and sanitize project data
      const validatedProject = {
        ...response.data,
        members: Array.isArray(response.data.members) 
          ? response.data.members.filter((m: any) => m && m.user && m.user._id && m.user.name)
          : []
      };

      console.log('Validated project:', validatedProject);

      set({ currentProject: validatedProject, loading: false, error: null });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch project';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  createProject: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/projects', data);
      set(state => ({
        projects: [...state.projects, response.data],
        loading: false,
        error: null
      }));
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create project';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  updateProject: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.patch(`/projects/${id}`, data);
      set(state => ({
        projects: state.projects.map(p => p._id === id ? response.data : p),
        currentProject: state.currentProject?._id === id ? response.data : state.currentProject,
        loading: false,
        error: null
      }));
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update project';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  deleteProject: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/projects/${id}`);
      set(state => ({
        projects: state.projects.filter(p => p._id !== id),
        currentProject: state.currentProject?._id === id ? null : state.currentProject,
        loading: false,
        error: null
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete project';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  addMember: async (projectId, email) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/projects/${projectId}/members`, { email });
      set(state => ({
        projects: state.projects.map(p => p._id === projectId ? response.data : p),
        currentProject: state.currentProject?._id === projectId ? response.data : state.currentProject,
        loading: false,
        error: null
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add member';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  removeMember: async (projectId, memberId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.delete(`/projects/${projectId}/members/${memberId}`);
      set(state => ({
        projects: state.projects.map(p => p._id === projectId ? response.data : p),
        currentProject: state.currentProject?._id === projectId ? response.data : state.currentProject,
        loading: false,
        error: null
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to remove member';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));

export default useProjectStore;