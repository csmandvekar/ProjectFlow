import { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";

interface SearchFilters {
  type: 'all' | 'projects' | 'tasks';
  status: string;
  priority: string;
  assignee: string;
  projectId: string;
}

interface FilterOptions {
  projects: { _id: string; title: string }[];
  statuses: string[];
  priorities: string[];
  assignees: { _id: string; name: string; email: string }[];
}

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  placeholder?: string;
}

export function SearchBar({ onSearch, placeholder = "Search projects and tasks..." }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    type: 'all',
    status: '',
    priority: '',
    assignee: '',
    projectId: ''
  });
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    projects: [],
    statuses: [],
    priorities: [],
    assignees: []
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await api.get('/search/filters');
        setFilterOptions(response.data);
      } catch (error) {
        console.error('Error fetching filter options:', error);
      }
    };

    fetchFilterOptions();
  }, []);

  const handleSearch = () => {
    onSearch(query, filters);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      status: '',
      priority: '',
      assignee: '',
      projectId: ''
    });
    onSearch(query, {
      type: 'all',
      status: '',
      priority: '',
      assignee: '',
      projectId: ''
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.type !== 'all') count++;
    if (filters.status) count++;
    if (filters.priority) count++;
    if (filters.assignee) count++;
    if (filters.projectId) count++;
    return count;
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} variant="default">
          Search
        </Button>
        <DropdownMenu open={showFilters} onOpenChange={setShowFilters}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs"
                >
                  Clear all
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Type</label>
                  <Select
                    value={filters.type}
                    onValueChange={(value: 'all' | 'projects' | 'tasks') =>
                      setFilters({ ...filters, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="projects">Projects</SelectItem>
                      <SelectItem value="tasks">Tasks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {filters.type === 'tasks' || filters.type === 'all' ? (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Status</label>
                      <Select
                        value={filters.status}
                        onValueChange={(value) =>
                          setFilters({ ...filters, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any status</SelectItem>
                          {filterOptions.statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Priority</label>
                      <Select
                        value={filters.priority}
                        onValueChange={(value) =>
                          setFilters({ ...filters, priority: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any priority</SelectItem>
                          {filterOptions.priorities.map((priority) => (
                            <SelectItem key={priority} value={priority}>
                              {priority.charAt(0).toUpperCase() + priority.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Assignee</label>
                      <Select
                        value={filters.assignee}
                        onValueChange={(value) =>
                          setFilters({ ...filters, assignee: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any assignee" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any assignee</SelectItem>
                          {filterOptions.assignees.map((assignee) => (
                            <SelectItem key={assignee._id} value={assignee._id}>
                              {assignee.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : null}

                <div>
                  <label className="text-sm font-medium mb-2 block">Project</label>
                  <Select
                    value={filters.projectId}
                    onValueChange={(value) =>
                      setFilters({ ...filters, projectId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any project</SelectItem>
                      {filterOptions.projects.map((project) => (
                        <SelectItem key={project._id} value={project._id}>
                          {project.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSearch} className="flex-1">
                  Apply Filters
                </Button>
                <Button variant="outline" onClick={() => setShowFilters(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active filters display */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.type !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Type: {filters.type}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFilters({ ...filters, type: 'all' })}
              />
            </Badge>
          )}
          {filters.status && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {filters.status}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFilters({ ...filters, status: '' })}
              />
            </Badge>
          )}
          {filters.priority && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Priority: {filters.priority}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFilters({ ...filters, priority: '' })}
              />
            </Badge>
          )}
          {filters.assignee && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Assignee: {filterOptions.assignees.find(a => a._id === filters.assignee)?.name}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFilters({ ...filters, assignee: '' })}
              />
            </Badge>
          )}
          {filters.projectId && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Project: {filterOptions.projects.find(p => p._id === filters.projectId)?.title}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => setFilters({ ...filters, projectId: '' })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
