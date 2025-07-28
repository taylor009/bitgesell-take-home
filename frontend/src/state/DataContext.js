import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchItems = useCallback(async (signal, page = 1, limit = 20, search = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (search) {
        params.append('q', search);
      }
      
      const res = await fetch(`/api/items?${params}`, { signal });
      if (!res.ok) throw new Error('Failed to fetch items');
      const json = await res.json();
      
      // Only update state if the request wasn't aborted
      if (!signal?.aborted) {
        // Handle both old and new API response formats
        if (json.items) {
          setItems(json.items);
          setPagination(json.pagination);
        } else if (Array.isArray(json)) {
          // Fallback for old format
          setItems(json);
          setPagination(null);
        }
      }
    } catch (error) {
      // Don't throw if the request was aborted
      if (error.name !== 'AbortError') {
        throw error;
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  return (
    <DataContext.Provider value={{ items, pagination, loading, fetchItems }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);