import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { LogOut, User, Settings, LayoutDashboard } from "lucide-react";
import useAuthStore from "@/lib/stores/auth-store";
import { Link } from "react-router-dom";
import { generateAvatarUrl, getInitials } from "@/lib/utils";
import { NotificationButton } from "../notifications/NotificationButton";

export function Navbar() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="sticky top-0 z-40 h-16 border-b border-border bg-surface/50 backdrop-blur-lg px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center space-x-2 sm:space-x-4">
        <SidebarTrigger />
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-sm font-bold text-white">PF</span>
          </div>
          <h1 className="text-lg sm:text-xl font-semibold text-foreground">ProjectFlow</h1>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <NotificationButton />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full cursor-pointer">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar || generateAvatarUrl(user.name)} alt={user.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link to="/">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Link to="/login">
            <Button variant="ghost">Login</Button>
          </Link>
        )}
      </div>
    </nav>
  );
}