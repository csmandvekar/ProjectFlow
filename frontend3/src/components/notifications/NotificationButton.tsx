import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import useNotificationStore from "@/lib/stores/notification-store";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateAvatarUrl, getInitials } from "@/lib/utils";
import { TeamInviteNotification } from "./TeamInviteNotification";

export function NotificationButton() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
  } = useNotificationStore();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const handleNotificationClick = async (notificationId: string, link?: string) => {
    await markAsRead([notificationId]);
    if (link) {
      navigate(link);
    }
    setIsOpen(false);
  };

  const getNotificationIcon = (type: string, role?: string) => {
    switch (type) {
      case 'task_assigned':
        return role === 'primary' ? '🎯' : '📋';
      case 'task_updated':
        return '✏️';
      case 'comment_added':
        return '💬';
      case 'member_joined':
        return '👋';
      case 'role_changed':
        return '👑';
      case 'project_update':
        return '📢';
      case 'team_invite':
        return '🤝';
      case 'task_removed':
        return '🗑️';
      default:
        return '📬';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs flex items-center justify-center text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="text-sm font-semibold">Notifications</div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => markAllAsRead()}
            >
              Mark all read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => clearAllNotifications()}
            >
              Clear all
            </Button>
          </div>
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification._id}
                className={`p-4 cursor-pointer ${!notification.read ? 'bg-muted/50' : ''}`}
                onClick={() => handleNotificationClick(notification._id, notification.link)}
              >
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={notification.sender.avatar || generateAvatarUrl(notification.sender.name)}
                      alt={notification.sender.name}
                    />
                    <AvatarFallback>
                      {getInitials(notification.sender.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {getNotificationIcon(notification.type, notification.actionData?.role)}
                      </span>
                      <p className="text-sm font-medium">
                        {notification.title}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                      {notification.project && (
                        <p className="text-xs text-primary">
                          {notification.project.title}
                        </p>
                      )}
                    </div>
                    {notification.type === 'team_invite' && notification.actionData && (
                      <TeamInviteNotification
                        notificationId={notification._id}
                        teamId={notification.actionData.teamId}
                        inviteId={notification.actionData.inviteId}
                        onAccept={() => {
                          fetchNotifications();
                          setIsOpen(false);
                        }}
                        onReject={() => {
                          fetchNotifications();
                          setIsOpen(false);
                        }}
                      />
                    )}
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}