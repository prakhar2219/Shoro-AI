import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from './use-toast';

interface UseAdminPageOptions<T> {
  fetchData: (page: number, pageSize: number, search: string) => Promise<{
    data: T[];
    totalPages: number;
    total: number;
  }>;
  fetchStats?: () => Promise<{ total: number }>;
  pageSize?: number;
}

export function useAdminPage<T>({
  fetchData,
  fetchStats,
  pageSize: initialPageSize = 15
}: UseAdminPageOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<{ total: number } | null>(null);
  const { toast } = useToast();

  // Use useRef to store the fetchData function to prevent infinite loops
  const fetchDataRef = useRef(fetchData);
  fetchDataRef.current = fetchData;

  // Fetch paginated data
  const fetchPaginatedData = useCallback(async (pageNum = 0, size = pageSize, search = searchTerm) => {
    try {
      setIsLoading(true);
      const res = await fetchDataRef.current(pageNum + 1, size, search);
      setData(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalRows(res.total || 0);
    } catch (error: any) {
      setData([]);
      setTotalPages(1);
      setTotalRows(0);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to fetch data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, searchTerm, toast]);

  // Fetch stats
  const fetchStatsData = useCallback(async () => {
    if (!fetchStats) return;
    try {
      const statsData = await fetchStats();
      setStats(statsData);
    } catch (error) {
      setStats(null);
    }
  }, [fetchStats]);

  // Debounced search
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (query: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          handleSearch(query);
        }, 300);
      };
    })(),
    []
  );

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      fetchPaginatedData(page, pageSize, "");
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetchDataRef.current(1, pageSize, query);
      setData(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalRows(res.total || 0);
      setPage(0);
    } catch (error: any) {
      setData([]);
      setTotalPages(1);
      setTotalRows(0);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [pageSize, page, toast, fetchPaginatedData]);

  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  const handlePageSizeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(e.target.value);
    setPageSize(newPageSize);
    setPage(0);
  }, []);

  // Effects
  useEffect(() => {
    fetchPaginatedData(page, pageSize, searchTerm);
  }, [page, pageSize, searchTerm, fetchPaginatedData]);

  useEffect(() => {
    fetchStatsData();
  }, [fetchStatsData]);

  return {
    data,
    searchTerm,
    page,
    setPage,
    pageSize,
    totalPages,
    totalRows,
    isLoading,
    stats,
    setData,
    setIsLoading,
    handleSearchInputChange,
    handlePageSizeChange,
    fetchPaginatedData,
    toast
  };
}
