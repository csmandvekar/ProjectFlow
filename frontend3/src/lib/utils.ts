import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to generate a consistent avatar URL based on user name
export function generateAvatarUrl(name: string | undefined | null): string {
  // Provide a default name if none is provided
  const safeName = name || 'User';
  const encodedName = encodeURIComponent(safeName);
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodedName}&backgroundColor=0369a1`;
}

// Function to format date with fallback
export function formatDate(date: string | Date | undefined): string {
  if (!date) return 'No date set';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Function to get initials from a name
export function getInitials(name: string | undefined | null): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Function to generate a color based on a string
export function stringToColor(str: string | undefined | null): string {
  if (!str) return 'hsl(210, 65%, 45%)'; // Default blue color
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 65%, 45%)`;
}

// Function to check if a date is in the past
export function isDatePast(date: string | Date | undefined): boolean {
  if (!date) return false;
  return new Date(date) < new Date();
}

// Function to get status color
export function getStatusColor(status: string): string {
  const statusColors = {
    active: 'bg-emerald-500',
    completed: 'bg-blue-500',
    'on-hold': 'bg-amber-500',
    cancelled: 'bg-red-500',
    todo: 'bg-slate-500',
    inprogress: 'bg-amber-500',
    done: 'bg-emerald-500'
  } as const;

  return statusColors[status as keyof typeof statusColors] || 'bg-slate-500';
}

// Function to get priority color
export function getPriorityColor(priority: string): string {
  const priorityColors = {
    low: 'bg-blue-500',
    medium: 'bg-amber-500',
    high: 'bg-red-500'
  } as const;

  return priorityColors[priority as keyof typeof priorityColors] || 'bg-slate-500';
}