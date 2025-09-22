import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface TeamMember {
  user: User;
  role: string;
  joinedAt: string;
}

interface AddTeamMemberButtonProps {
  projectId: string;
  currentMembers: { user: User }[];
  onMemberAdded: () => void;
}

export function AddTeamMemberButton({ projectId, currentMembers, onMemberAdded }: AddTeamMemberButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await api.get('/team/members');
        setTeamMembers(response.data);
      } catch (error: any) {
        console.error('Error fetching team members:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load team members",
        });
      }
    };

    if (isOpen) {
      fetchTeamMembers();
    }
  }, [isOpen, toast]);

  // Debug log the members data
  console.log('Members data:', {
    teamMembers,
    currentMembers,
    currentMemberIds: currentMembers?.map(m => m?.user?._id).filter(Boolean)
  });

  // Filter out members who are already in the project
  const availableMembers = teamMembers.filter(teamMember => {
    // Ensure we have valid team member data
    if (!teamMember?.user?._id) return false;

    // If no current members, all team members are available
    if (!currentMembers || !Array.isArray(currentMembers)) return true;

    // Check if the team member is not already in the project
    return !currentMembers.some(projectMember => 
      projectMember?.user?._id === teamMember.user._id
    );
  });

  const handleAddMember = async () => {
    if (!selectedMember) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a team member",
      });
      return;
    }

    setLoading(true);
    try {
      const member = teamMembers.find(m => m.user._id === selectedMember);
      if (!member) throw new Error('Member not found');

      await api.post(`/projects/${projectId}/members`, {
        email: member.user.email
      });

      toast({
        title: "Success",
        description: `Added ${member.user.name} to the project`,
      });

      onMemberAdded();
      setIsOpen(false);
      setSelectedMember("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to add member",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-4">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Team Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Team Member to Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {availableMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              All team members are already in this project.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Team Member</label>
                <Select
                  value={selectedMember}
                  onValueChange={setSelectedMember}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMembers.map((member) => (
                      <SelectItem key={member.user._id} value={member.user._id}>
                        {member.user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddMember}
                  disabled={loading || !selectedMember}
                >
                  {loading ? "Adding..." : "Add Member"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
