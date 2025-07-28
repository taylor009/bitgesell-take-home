import React, { useEffect, useState, useCallback } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';

function Items() {
  const { items, pagination, loading, fetchItems } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const loadItems = useCallback((page, search) => {
    const abortController = new AbortController();
    
    fetchItems(abortController.signal, page, 100, search).catch(error => {
      if (error.name !== 'AbortError') {
        console.error('Failed to fetch items:', error);
      }
    });
    
    return abortController;
  }, [fetchItems]);

  useEffect(() => {
    const controller = loadItems(currentPage, searchQuery);
    return () => controller.abort();
  }, [currentPage, searchQuery, loadItems]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Row renderer for react-window
  const Row = ({ index, style }) => {
    const item = items[index];
    return (
      <div style={style}>
        <Link 
          to={'/items/' + item.id} 
          style={{
            display: 'block',
            padding: '16px',
            borderBottom: '1px solid #e5e7eb',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'background-color 0.2s',
            ':hover': {
              backgroundColor: '#f9fafb'
            }
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '500', color: '#111827' }}>{item.name}</h3>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>{item.category}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontWeight: '500', color: '#3b82f6', fontSize: '16px' }}>${item.price.toFixed(2)}</span>
            </div>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#111827' }}>Items</h1>
        
        <form onSubmit={handleSearch} style={{ position: 'relative' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <svg 
              style={{ position: 'absolute', left: '12px', width: '20px', height: '20px', color: '#6b7280' }}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '40px',
                paddingRight: '100px',
                paddingTop: '10px',
                paddingBottom: '10px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
            <button 
              type="submit" 
              style={{
                position: 'absolute',
                right: '8px',
                padding: '6px 16px',
                borderRadius: '6px',
                backgroundColor: '#3b82f6',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
            >
              Search
            </button>
          </div>
        </form>
      </div>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        {loading && (!items || !items.length) ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                border: '3px solid #e5e7eb',
                borderTopColor: '#3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 8px'
              }}></div>
              <p style={{ color: '#6b7280' }}>Loading items...</p>
            </div>
          </div>
        ) : items && items.length > 0 ? (
          <List
            height={window.innerHeight - 200}
            itemCount={items.length}
            itemSize={72}
            width="100%"
          >
            {Row}
          </List>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#6b7280' }}>No items found</p>
          </div>
        )}
      </div>

      {pagination && (
        <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Page <span style={{ fontWeight: '500', color: '#111827' }}>{pagination.page}</span> of{" "}
              <span style={{ fontWeight: '500', color: '#111827' }}>{pagination.totalPages}</span>
              <span style={{ marginLeft: '8px' }}>({pagination.totalItems} total items)</span>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                disabled={!pagination.hasPreviousPage}
                onClick={() => handlePageChange(currentPage - 1)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                  fontWeight: '500',
                  backgroundColor: 'white',
                  color: pagination.hasPreviousPage ? '#374151' : '#9ca3af',
                  cursor: pagination.hasPreviousPage ? 'pointer' : 'not-allowed',
                  opacity: pagination.hasPreviousPage ? 1 : 0.5,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (pagination.hasPreviousPage) {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                    e.currentTarget.style.borderColor = '#9ca3af';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              
              <button 
                disabled={!pagination.hasNextPage}
                onClick={() => handlePageChange(currentPage + 1)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                  fontWeight: '500',
                  backgroundColor: 'white',
                  color: pagination.hasNextPage ? '#374151' : '#9ca3af',
                  cursor: pagination.hasNextPage ? 'pointer' : 'not-allowed',
                  opacity: pagination.hasNextPage ? 1 : 0.5,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (pagination.hasNextPage) {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                    e.currentTarget.style.borderColor = '#9ca3af';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
              >
                Next
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export default Items;