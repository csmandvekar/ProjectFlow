import { useState } from "react";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchResults } from "@/components/search/SearchResults";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface SearchFilters {
  type: 'all' | 'projects' | 'tasks';
  status: string;
  priority: string;
  assignee: string;
  projectId: string;
}

interface SearchResults {
  projects: any[];
  tasks: any[];
}

export default function SearchPage() {
  const [results, setResults] = useState<SearchResults>({ projects: [], tasks: [] });
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const { toast } = useToast();

  const handleSearch = async (searchQuery: string, filters: SearchFilters) => {
    if (!searchQuery.trim()) {
      setResults({ projects: [], tasks: [] });
      setQuery("");
      return;
    }

    setLoading(true);
    setQuery(searchQuery);

    try {
      const params = new URLSearchParams();
      params.append('q', searchQuery);
      
      if (filters.type !== 'all') {
        params.append('type', filters.type);
      }
      if (filters.status) {
        params.append('status', filters.status);
      }
      if (filters.priority) {
        params.append('priority', filters.priority);
      }
      if (filters.assignee) {
        params.append('assignee', filters.assignee);
      }
      if (filters.projectId) {
        params.append('projectId', filters.projectId);
      }

      const response = await api.get(`/search?${params.toString()}`);
      setResults(response.data);
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        variant: "destructive",
        title: "Search Error",
        description: error.response?.data?.message || "Failed to search",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Search</h1>
        <p className="text-muted-foreground">
          Find projects and tasks across your workspace
        </p>
      </div>

      <div className="mb-8">
        <SearchBar onSearch={handleSearch} />
      </div>

      <SearchResults results={results} loading={loading} query={query} />
    </div>
  );
}
