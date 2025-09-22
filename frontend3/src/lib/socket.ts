import { io, Socket } from 'socket.io-client';
import useAuthStore from './stores/auth-store';

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.token = token;
    this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to server:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinProject(projectId: string) {
    if (this.socket) {
      this.socket.emit('join-project', projectId);
    }
  }

  leaveProject(projectId: string) {
    if (this.socket) {
      this.socket.emit('leave-project', projectId);
    }
  }

  emitTaskUpdate(projectId: string, taskId: string, updates: any) {
    if (this.socket) {
      this.socket.emit('task-update', {
        projectId,
        taskId,
        updates
      });
    }
  }

  emitCommentAdded(projectId: string, taskId: string, comment: any) {
    if (this.socket) {
      this.socket.emit('comment-added', {
        projectId,
        taskId,
        comment
      });
    }
  }

  emitTyping(projectId: string, taskId: string, isTyping: boolean) {
    if (this.socket) {
      this.socket.emit('typing', {
        projectId,
        taskId,
        isTyping
      });
    }
  }

  onTaskUpdated(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('task:updated', callback);
    }
  }

  onCommentAdded(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('comment:added', callback);
    }
  }

  onUserJoined(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user:joined', callback);
    }
  }

  onUserLeft(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user:left', callback);
    }
  }

  onUserTyping(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user:typing', callback);
    }
  }

  onFileUploaded(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('file:uploaded', callback);
    }
  }

  onFileDeleted(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('file:deleted', callback);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
export default socketService;
