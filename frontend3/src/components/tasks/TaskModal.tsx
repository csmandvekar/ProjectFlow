import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { FileUpload } from "./FileUpload";

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

interface TaskAssignee {
  user: string; // User ID
  role: 'primary' | 'secondary';
}

interface Attachment {
  _id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: User;
  uploadedAt: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'inprogress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignees: TaskAssignee[];
  attachments: Attachment[];
  deadline?: string;
}

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Task>) => Promise<void>;
  initialStatus: 'todo' | 'inprogress' | 'done';
  task?: Task;
  projectMembers?: Member[];
  projectId?: string;
  isEditing?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'inprogress', label: 'In Progress' },
  { value: 'done', label: 'Done' }
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

export function TaskModal({
  open,
  onClose,
  onSubmit,
  initialStatus,
  task,
  projectMembers = [],
  projectId,
  isEditing = false
}: TaskModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    status: initialStatus,
    priority: 'medium',
    assignees: [],
    deadline: format(new Date().setDate(new Date().getDate() + 7), 'yyyy-MM-dd')
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        assignees: task.assignees || [],
        deadline: task.deadline ? format(new Date(task.deadline), 'yyyy-MM-dd') : undefined
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: initialStatus,
        priority: 'medium',
        assignees: [],
        deadline: format(new Date().setDate(new Date().getDate() + 7), 'yyyy-MM-dd')
      });
    }
  }, [task, initialStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      toast({
        variant: "destructive",
        title: "Title is required",
        description: "Please enter a task title",
      });
      return;
    }

    setLoading(true);
    try {
      // Send the form data with just the assignee ID
      await onSubmit({
        ...formData,
        assignees: formData.assignees
      });
      
      toast({
        title: `Task ${isEditing ? 'updated' : 'created'} successfully`,
        description: formData.title,
      });
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: `Failed to ${isEditing ? 'update' : 'create'} task`,
        description: error.message || "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  // Debug log members and assignees
  console.log('TaskModal members:', {
    projectMembers,
    formData,
    assignees: formData.assignees,
    projectMembersIds: projectMembers.map(m => m.user._id)
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-surface border-border">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              placeholder="Task title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="bg-surface/50 border-border/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Task description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-surface/50 border-border/50 min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={formData.status}
                onValueChange={(value: 'todo' | 'inprogress' | 'done') => 
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={formData.priority}
                onValueChange={(value: 'low' | 'medium' | 'high') => 
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Assignees</label>
              <div className="space-y-2">
                {formData.assignees.map((assignee, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select
                      value={assignee.user}
                      onValueChange={(value) => {
                        const newAssignees = [...formData.assignees];
                        newAssignees[index].user = value;
                        setFormData({ ...formData, assignees: newAssignees });
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue>
                          {projectMembers.find(m => m.user._id === assignee.user)?.user.name || 'Select member'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {projectMembers.map((member) => (
                          <SelectItem key={member.user._id} value={member.user._id}>
                            {member.user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={assignee.role}
                      onValueChange={(value: 'primary' | 'secondary') => {
                        const newAssignees = [...formData.assignees];
                        newAssignees[index].role = value;
                        setFormData({ ...formData, assignees: newAssignees });
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Primary</SelectItem>
                        <SelectItem value="secondary">Secondary</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newAssignees = formData.assignees.filter((_, i) => i !== index);
                        setFormData({ ...formData, assignees: newAssignees });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      assignees: [
                        ...formData.assignees,
                        { user: '', role: 'secondary' }
                      ]
                    });
                  }}
                >
                  Add Assignee
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Deadline</label>
              <Input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="bg-surface/50 border-border/50"
              />
            </div>
          </div>

          {/* File Upload Section - Only show when editing existing task */}
          {isEditing && task && projectId && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Attachments</label>
              <FileUpload
                taskId={task._id}
                projectId={projectId}
                attachments={task.attachments || []}
                onFileUploaded={(attachment) => {
                  // Update the task's attachments in the form data
                  setFormData(prev => ({
                    ...prev,
                    attachments: [...(prev.attachments || []), attachment]
                  }));
                }}
                onFileDeleted={(attachmentId) => {
                  // Remove the attachment from the form data
                  setFormData(prev => ({
                    ...prev,
                    attachments: (prev.attachments || []).filter(a => a._id !== attachmentId)
                  }));
                }}
              />
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                isEditing ? 'Update Task' : 'Create Task'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}