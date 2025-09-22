import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";

interface SidebarContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('app-sidebar');
      const trigger = document.getElementById('sidebar-trigger');
      
      if (sidebar && trigger && 
          !sidebar.contains(event.target as Node) && 
          !trigger.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close sidebar on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setIsOpen(false);
    };

    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Sidebar({ className, children, ...props }: SidebarProps) {
  const { isOpen } = useSidebar();

  return (
    <div
      id="app-sidebar"
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface SidebarTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export function SidebarTrigger({ className, ...props }: SidebarTriggerProps) {
  const { toggle } = useSidebar();

  return (
    <button
      id="sidebar-trigger"
      type="button"
      onClick={toggle}
      className={`lg:hidden p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground ${
        className || ''
      }`}
      {...props}
    >
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
      <span className="sr-only">Toggle sidebar</span>
    </button>
  );
}

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function SidebarHeader({ className, children, ...props }: SidebarHeaderProps) {
  return (
    <div
      className={`p-4 border-b border-border ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function SidebarContent({ className, children, ...props }: SidebarContentProps) {
  return (
    <div
      className={`flex-1 overflow-y-auto p-4 ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function SidebarFooter({ className, children, ...props }: SidebarFooterProps) {
  return (
    <div
      className={`p-4 border-t border-border ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface SidebarItemProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  active?: boolean;
}

export function SidebarItem({ className, active, children, ...props }: SidebarItemProps) {
  return (
    <div
      className={`p-2 rounded-md cursor-pointer transition-colors ${
        active
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      } ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface SidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  title?: string;
}

export function SidebarGroup({ className, title, children, ...props }: SidebarGroupProps) {
  return (
    <div className={`space-y-2 ${className || ''}`} {...props}>
      {title && (
        <h4 className="text-sm font-medium text-muted-foreground px-2">
          {title}
        </h4>
      )}
      {children}
    </div>
  );
}