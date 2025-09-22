import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import api from "@/lib/api";
import { useState } from "react";

interface TeamInviteNotificationProps {
  notificationId: string;
  teamId: string;
  inviteId: string;
  onAccept: () => void;
  onReject: () => void;
}

export function TeamInviteNotification({
  notificationId,
  teamId,
  inviteId,
  onAccept,
  onReject
}: TeamInviteNotificationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      await api.post(`/team/invites/${inviteId}/accept`);
      toast({
        title: "Success",
        description: "You have joined the team",
      });
      onAccept();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to accept invitation",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    try {
      await api.post(`/team/invites/${inviteId}/reject`);
      toast({
        title: "Success",
        description: "Invitation rejected",
      });
      onReject();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to reject invitation",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <Button
        size="sm"
        variant="default"
        onClick={handleAccept}
        disabled={isLoading}
        className="flex-1"
      >
        {isLoading ? "Processing..." : "Accept"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={handleReject}
        disabled={isLoading}
        className="flex-1"
      >
        {isLoading ? "Processing..." : "Reject"}
      </Button>
    </div>
  );
}
