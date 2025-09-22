import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { generateAvatarUrl, getInitials } from "@/lib/utils";
import { UserPlus, Users } from "lucide-react";
import useAuthStore from "@/lib/stores/auth-store";
import api from "@/lib/api";

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  avatar?: string;
  joinedAt: string;
}

export default function Team() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await api.get('/team/members');
        setTeamMembers(response.data);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to load team members",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, [toast]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an email address",
      });
      return;
    }

    setIsInviting(true);
    try {
      await api.post('/team/invite', { email: inviteEmail });
      
      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${inviteEmail}`,
      });
      setInviteEmail("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to send invitation",
      });
    } finally {
      setIsInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading team members...</p>
        </div>
      </div>
    );
  }

  if (teamMembers.length === 0 && user?.role !== 'admin') {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground">Not in any team</h3>
          <p className="text-muted-foreground mt-2">
            You haven't been invited to any team yet. Once you receive an invitation, it will appear in your notifications.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Team Members</h1>
          <p className="text-muted-foreground">
            {user?.role === 'admin' 
              ? 'Manage your team members and send invitations'
              : 'View your team members'}
          </p>
        </div>
        {user?.role === 'admin' && (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your team. They'll receive a notification to accept.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleInvite}
                  disabled={isInviting}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isInviting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    "Send Invitation"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6">
        {teamMembers.map((member) => (
          <Card key={member._id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={member.avatar || generateAvatarUrl(member.name)}
                      alt={member.name}
                    />
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`text-sm font-medium capitalize px-2 py-1 rounded ${
                    member.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {member.role}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}