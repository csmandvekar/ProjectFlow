import { Link, useLocation } from "react-router-dom";
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Search,
} from "lucide-react";
import useAuthStore from "@/lib/stores/auth-store";

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuthStore();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <SidebarComponent>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-sm font-bold text-white">PF</span>
          </div>
          <span className="text-lg font-semibold">ProjectFlow</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <Link to="/">
            <SidebarItem active={isActive('/')}>
              <div className="flex items-center gap-3">
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </div>
            </SidebarItem>
          </Link>

          <Link to="/calendar">
            <SidebarItem active={isActive('/calendar')}>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4" />
                <span>Calendar</span>
              </div>
            </SidebarItem>
          </Link>

          <Link to="/team">
            <SidebarItem active={isActive('/team')}>
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4" />
                <span>Team Members</span>
              </div>
            </SidebarItem>
          </Link>

          <Link to="/search">
            <SidebarItem active={isActive('/search')}>
              <div className="flex items-center gap-3">
                <Search className="h-4 w-4" />
                <span>Search</span>
              </div>
            </SidebarItem>
          </Link>
        </SidebarGroup>

        {/* Projects Section */}
        <SidebarGroup title="Recent Projects" className="mt-6">
          {/* This will be populated dynamically */}
        </SidebarGroup>
      </SidebarContent>
    </SidebarComponent>
  );
}