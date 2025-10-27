// Advanced Search and Filtering Service
// Handles comprehensive search, filtering, and data querying capabilities

import { apiService, ApiError } from './apiService';

class SearchEngine {
  constructor() {
    this.searchIndexes = new Map();
    this.filters = new Map();
    this.sortOptions = new Map();
    this.searchHistory = [];
    this.maxHistory = 50;
  }

  // Initialize search engine with data
  initialize(data, type) {
    this.createSearchIndex(data, type);
    this.setupFilters(type);
    this.setupSortOptions(type);
  }

  // Create search index for fast searching
  createSearchIndex(data, type) {
    const index = {
      type,
      items: data,
      searchableFields: this.getSearchableFields(type),
      filterableFields: this.getFilterableFields(type),
      fullTextIndex: this.createFullTextIndex(data, type),
      fieldIndexes: this.createFieldIndexes(data, type)
    };

    this.searchIndexes.set(type, index);
  }

  // Get searchable fields for a data type
  getSearchableFields(type) {
    const fieldMaps = {
      posts: ['title', 'content', 'author'],
      users: ['name', 'email', 'role'],
      students: ['firstName', 'lastName', 'email', 'studentId', 'program'],
      notifications: ['title', 'message', 'type'],
      applications: ['fullName', 'email', 'program', 'level'],
      events: ['title', 'description', 'location'],
      courses: ['name', 'description', 'instructor']
    };

    return fieldMaps[type] || ['title', 'description', 'name'];
  }

  // Get filterable fields for a data type
  getFilterableFields(type) {
    const fieldMaps = {
      posts: ['type', 'author', 'date', 'visible'],
      users: ['role', 'status', 'createdAt'],
      students: ['program', 'level', 'status', 'year'],
      notifications: ['type', 'priority', 'read', 'date'],
      applications: ['status', 'program', 'level', 'date'],
      events: ['type', 'status', 'date', 'location'],
      courses: ['level', 'status', 'instructor']
    };

    return fieldMaps[type] || ['status', 'type', 'date'];
  }

  // Create full-text search index
  createFullTextIndex(data, type) {
    const index = {};
    const searchableFields = this.getSearchableFields(type);

    data.forEach((item, itemIndex) => {
      searchableFields.forEach(field => {
        if (item[field]) {
          const text = String(item[field]).toLowerCase();
          const words = this.tokenize(text);

          words.forEach(word => {
            if (!index[word]) {
              index[word] = [];
            }
            index[word].push(itemIndex);
          });
        }
      });
    });

    return index;
  }

  // Create field-based indexes for filtering
  createFieldIndexes(data, type) {
    const indexes = {};
    const filterableFields = this.getFilterableFields(type);

    filterableFields.forEach(field => {
      indexes[field] = {};

      data.forEach((item, index) => {
        const value = item[field];
        if (value !== undefined && value !== null) {
          const key = String(value).toLowerCase();

          if (!indexes[field][key]) {
            indexes[field][key] = [];
          }
          indexes[field][key].push(index);
        }
      });
    });

    return indexes;
  }

  // Tokenize text for searching
  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 1); // Filter out single characters
  }

  // Setup filters for a data type
  setupFilters(type) {
    const filters = {
      posts: [
        { field: 'type', type: 'select', options: ['text', 'image', 'video'] },
        { field: 'author', type: 'text' },
        { field: 'dateRange', type: 'dateRange' },
        { field: 'visible', type: 'boolean' }
      ],
      users: [
        { field: 'role', type: 'select', options: ['admin', 'teacher', 'staff', 'student'] },
        { field: 'status', type: 'select', options: ['active', 'inactive', 'suspended'] },
        { field: 'createdAt', type: 'dateRange' }
      ],
      students: [
        { field: 'program', type: 'select', options: ['Software Development', 'Fashion & Design', 'Building Construction', 'Wood Technology'] },
        { field: 'level', type: 'select', options: ['L3', 'L4', 'L5'] },
        { field: 'status', type: 'select', options: ['active', 'inactive', 'graduated'] },
        { field: 'enrollmentDate', type: 'dateRange' }
      ],
      notifications: [
        { field: 'type', type: 'select', options: ['payment', 'attendance', 'exam', 'report', 'announcement'] },
        { field: 'priority', type: 'select', options: ['high', 'medium', 'low'] },
        { field: 'read', type: 'boolean' },
        { field: 'dateRange', type: 'dateRange' }
      ],
      applications: [
        { field: 'status', type: 'select', options: ['pending', 'approved', 'rejected'] },
        { field: 'program', type: 'select', options: ['Software Development', 'Fashion & Design', 'Building Construction', 'Wood Technology'] },
        { field: 'level', type: 'select', options: ['L3', 'L4', 'L5'] },
        { field: 'applicationDate', type: 'dateRange' }
      ]
    };

    this.filters.set(type, filters[type] || []);
  }

  // Setup sort options
  setupSortOptions(type) {
    const sortOptions = {
      posts: [
        { field: 'createdAt', label: 'Date Created', direction: 'desc' },
        { field: 'title', label: 'Title', direction: 'asc' },
        { field: 'author', label: 'Author', direction: 'asc' }
      ],
      users: [
        { field: 'createdAt', label: 'Date Created', direction: 'desc' },
        { field: 'name', label: 'Name', direction: 'asc' },
        { field: 'role', label: 'Role', direction: 'asc' }
      ],
      students: [
        { field: 'enrollmentDate', label: 'Enrollment Date', direction: 'desc' },
        { field: 'firstName', label: 'First Name', direction: 'asc' },
        { field: 'lastName', label: 'Last Name', direction: 'asc' },
        { field: 'program', label: 'Program', direction: 'asc' }
      ],
      notifications: [
        { field: 'timestamp', label: 'Date', direction: 'desc' },
        { field: 'priority', label: 'Priority', direction: 'desc' },
        { field: 'title', label: 'Title', direction: 'asc' }
      ],
      applications: [
        { field: 'createdAt', label: 'Application Date', direction: 'desc' },
        { field: 'fullName', label: 'Name', direction: 'asc' },
        { field: 'status', label: 'Status', direction: 'asc' }
      ]
    };

    this.sortOptions.set(type, sortOptions[type] || []);
  }

  // Advanced search with filters and sorting
  async search(query, options = {}) {
    const {
      type = 'posts',
      filters = {},
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
      includeCount = true
    } = options;

    if (this.searchIndexes.has(type)) {
      return this.searchLocal(query, { type, filters, sortBy, sortOrder, page, limit, includeCount });
    } else {
      return this.searchAPI(query, { type, filters, sortBy, sortOrder, page, limit, includeCount });
    }
  }

  // Local search (for small datasets)
  searchLocal(query, options) {
    const index = this.searchIndexes.get(options.type);
    if (!index) {
      return { results: [], total: 0, page: options.page, limit: options.limit };
    }

    let results = [...index.items];

    // Apply search query
    if (query && query.trim()) {
      results = this.applySearchQuery(results, query, index);
    }

    // Apply filters
    results = this.applyFilters(results, options.filters, index);

    // Apply sorting
    results = this.applySorting(results, options.sortBy, options.sortOrder);

    // Apply pagination
    const total = results.length;
    const startIndex = (options.page - 1) * options.limit;
    const endIndex = startIndex + options.limit;
    results = results.slice(startIndex, endIndex);

    // Add search metadata
    results.forEach((result, index) => {
      result._searchScore = this.calculateSearchScore(result, query, index);
      result._originalIndex = index.originalIndex || index;
    });

    return {
      results,
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit),
      hasNext: endIndex < total,
      hasPrev: options.page > 1
    };
  }

  // Apply search query to results
  applySearchQuery(results, query, index) {
    const searchTerms = this.tokenize(query);
    const matchingIndexes = new Set();

    // Find matching items for each search term
    searchTerms.forEach(term => {
      if (index.fullTextIndex[term]) {
        index.fullTextIndex[term].forEach(itemIndex => {
          matchingIndexes.add(itemIndex);
        });
      }
    });

    // Filter results to only matching items
    return results.filter((_, resultIndex) => matchingIndexes.has(resultIndex));
  }

  // Apply filters to results
  applyFilters(results, filters, index) {
    let filteredResults = [...results];

    Object.entries(filters).forEach(([filterKey, filterValue]) => {
      if (filterValue === undefined || filterValue === null || filterValue === '') {
        return;
      }

      if (index.filterableFields.includes(filterKey)) {
        if (filterKey === 'dateRange') {
          filteredResults = this.applyDateRangeFilter(filteredResults, filterValue);
        } else if (Array.isArray(filterValue)) {
          filteredResults = filteredResults.filter(item =>
            filterValue.includes(item[filterKey])
          );
        } else {
          filteredResults = filteredResults.filter(item =>
            String(item[filterKey]).toLowerCase() === String(filterValue).toLowerCase()
          );
        }
      }
    });

    return filteredResults;
  }

  // Apply date range filter
  applyDateRangeFilter(results, dateRange) {
    if (!dateRange.start && !dateRange.end) return results;

    return results.filter(item => {
      const itemDate = new Date(item.createdAt || item.timestamp || item.date);
      const startDate = dateRange.start ? new Date(dateRange.start) : new Date(0);
      const endDate = dateRange.end ? new Date(dateRange.end) : new Date();

      return itemDate >= startDate && itemDate <= endDate;
    });
  }

  // Apply sorting to results
  applySorting(results, sortBy, sortOrder) {
    return results.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle different data types
      if (aValue instanceof Date || this.isDateString(aValue)) {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      let comparison = 0;
      if (aValue > bValue) comparison = 1;
      if (aValue < bValue) comparison = -1;

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  // Check if string is a date
  isDateString(str) {
    return /^\d{4}-\d{2}-\d{2}/.test(str);
  }

  // Calculate search relevance score
  calculateSearchScore(item, query, index) {
    if (!query) return 1;

    const searchTerms = this.tokenize(query);
    const searchableFields = this.getSearchableFields('posts'); // Use posts as default
    let score = 0;

    searchTerms.forEach(term => {
      searchableFields.forEach(field => {
        const fieldValue = String(item[field] || '').toLowerCase();
        const termIndex = fieldValue.indexOf(term);

        if (termIndex !== -1) {
          // Boost score based on position (earlier is better)
          const positionBoost = 1 / (termIndex + 1);
          // Boost score for exact matches
          const exactMatchBoost = fieldValue === term ? 2 : 1;
          // Boost score for field importance
          const fieldBoost = field === 'title' ? 2 : 1;

          score += positionBoost * exactMatchBoost * fieldBoost;
        }
      });
    });

    return score;
  }

  // API-based search (for large datasets)
  async searchAPI(query, options) {
    try {
      const params = new URLSearchParams({
        q: query,
        sortBy: options.sortBy,
        sortOrder: options.sortOrder,
        page: options.page,
        limit: options.limit,
        ...options.filters
      });

      return await apiService.get(`/api/search/${options.type}?${params}`);
    } catch (error) {
      console.error('Search API error:', error);
      throw new ApiError('Search failed', 500, 'Unable to perform search. Please try again.');
    }
  }

  // Autocomplete suggestions
  getSuggestions(query, type = 'posts', limit = 10) {
    if (!query || query.length < 2) return [];

    const index = this.searchIndexes.get(type);
    if (!index) return [];

    const queryLower = query.toLowerCase();
    const suggestions = new Set();

    // Search in full-text index
    Object.keys(index.fullTextIndex).forEach(word => {
      if (word.startsWith(queryLower)) {
        const matchingItems = index.fullTextIndex[word];
        matchingItems.forEach(itemIndex => {
          const item = index.items[itemIndex];
          suggestions.add(item.title || item.name || item.fullName);
        });
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }

  // Advanced filtering
  getFilterOptions(type, field) {
    const index = this.searchIndexes.get(type);
    if (!index || !index.fieldIndexes[field]) return [];

    return Object.keys(index.fieldIndexes[field]).sort();
  }

  // Get available filters for type
  getFilters(type) {
    return this.filters.get(type) || [];
  }

  // Get sort options for type
  getSortOptions(type) {
    return this.sortOptions.get(type) || [];
  }

  // Save search to history
  saveSearch(query, type, results) {
    const searchEntry = {
      id: Date.now() + Math.random(),
      query,
      type,
      timestamp: new Date().toISOString(),
      resultCount: results.total
    };

    this.searchHistory.unshift(searchEntry);

    // Keep only recent searches
    if (this.searchHistory.length > this.maxHistory) {
      this.searchHistory = this.searchHistory.slice(0, this.maxHistory);
    }

    localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
  }

  // Get search history
  getSearchHistory() {
    const stored = localStorage.getItem('searchHistory');
    if (stored) {
      this.searchHistory = JSON.parse(stored);
    }
    return this.searchHistory;
  }

  // Clear search history
  clearSearchHistory() {
    this.searchHistory = [];
    localStorage.removeItem('searchHistory');
  }

  // Fuzzy search implementation
  fuzzySearch(query, items, fields, threshold = 0.6) {
    const queryTerms = this.tokenize(query);

    return items.map((item, index) => {
      let bestScore = 0;

      queryTerms.forEach(term => {
        fields.forEach(field => {
          const fieldValue = String(item[field] || '').toLowerCase();
          const score = this.calculateFuzzyScore(term, fieldValue);

          if (score > bestScore) {
            bestScore = score;
          }
        });
      });

      return {
        item,
        score: bestScore,
        index
      };
    })
    .filter(result => result.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .map(result => result.item);
  }

  // Calculate fuzzy match score
  calculateFuzzyScore(query, target) {
    if (target.includes(query)) return 1;
    if (target.startsWith(query)) return 0.9;

    let score = 0;
    let queryIndex = 0;

    for (let i = 0; i < target.length && queryIndex < query.length; i++) {
      if (target[i] === query[queryIndex]) {
        score += 1;
        queryIndex++;
      }
    }

    return score / query.length;
  }

  // Highlight search terms in results
  highlightSearchTerms(text, query) {
    if (!query) return text;

    const terms = this.tokenize(query);
    let highlightedText = text;

    terms.forEach(term => {
      const regex = new RegExp(`(${this.escapeRegex(term)})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    });

    return highlightedText;
  }

  // Escape regex special characters
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Search analytics
  trackSearch(query, type, resultCount, duration) {
    const analytics = {
      query,
      type,
      resultCount,
      duration,
      timestamp: Date.now(),
      userId: this.getCurrentUserId()
    };

    // Store analytics
    const searchAnalytics = JSON.parse(localStorage.getItem('searchAnalytics') || '[]');
    searchAnalytics.unshift(analytics);

    // Keep only last 1000 analytics
    if (searchAnalytics.length > 1000) {
      searchAnalytics.splice(1000);
    }

    localStorage.setItem('searchAnalytics', JSON.stringify(searchAnalytics));
  }

  // Get search analytics
  getSearchAnalytics(filters = {}) {
    const analytics = JSON.parse(localStorage.getItem('searchAnalytics') || '[]');

    let filtered = [...analytics];

    if (filters.type) {
      filtered = filtered.filter(a => a.type === filters.type);
    }

    if (filters.userId) {
      filtered = filtered.filter(a => a.userId === filters.userId);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(a => a.timestamp >= new Date(filters.dateFrom).getTime());
    }

    return filtered;
  }

  // Get popular searches
  getPopularSearches(limit = 10) {
    const analytics = this.getSearchAnalytics();
    const searchCounts = {};

    analytics.forEach(search => {
      const key = `${search.type}:${search.query}`;
      searchCounts[key] = (searchCounts[key] || 0) + 1;
    });

    return Object.entries(searchCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([key, count]) => {
        const [type, query] = key.split(':');
        return { query, type, count };
      });
  }

  // Get current user ID
  getCurrentUserId() {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      return user.id || null;
    } catch {
      return null;
    }
  }

  // Export search results
  exportResults(results, format = 'json') {
    switch (format) {
      case 'json':
        return JSON.stringify(results, null, 2);
      case 'csv':
        return this.convertToCSV(results);
      case 'excel':
        return this.convertToExcel(results);
      default:
        return JSON.stringify(results, null, 2);
    }
  }

  // Convert results to CSV
  convertToCSV(results) {
    if (results.length === 0) return '';

    const headers = Object.keys(results[0]);
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(','));

    // Add data rows
    results.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma or quote
        const stringValue = String(value || '');
        if (stringValue.includes(',') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }

  // Advanced search with multiple criteria
  advancedSearch(criteria, options = {}) {
    const {
      type = 'posts',
      combineMethod = 'AND', // AND or OR
      sortBy = 'relevance',
      sortOrder = 'desc'
    } = options;

    const index = this.searchIndexes.get(type);
    if (!index) {
      return this.searchAPI('', { type, ...options });
    }

    let results = [...index.items];

    // Apply each criterion
    criteria.forEach(criterion => {
      const { field, operator, value } = criterion;

      switch (operator) {
        case 'contains':
          results = results.filter(item =>
            String(item[field] || '').toLowerCase().includes(value.toLowerCase())
          );
          break;
        case 'equals':
          results = results.filter(item =>
            String(item[field] || '').toLowerCase() === value.toLowerCase()
          );
          break;
        case 'startsWith':
          results = results.filter(item =>
            String(item[field] || '').toLowerCase().startsWith(value.toLowerCase())
          );
          break;
        case 'endsWith':
          results = results.filter(item =>
            String(item[field] || '').toLowerCase().endsWith(value.toLowerCase())
          );
          break;
        case 'greaterThan':
          results = results.filter(item => {
            const itemValue = parseFloat(item[field]);
            return !isNaN(itemValue) && itemValue > parseFloat(value);
          });
          break;
        case 'lessThan':
          results = results.filter(item => {
            const itemValue = parseFloat(item[field]);
            return !isNaN(itemValue) && itemValue < parseFloat(value);
          });
          break;
        case 'between':
          results = results.filter(item => {
            const itemValue = parseFloat(item[field]);
            const [min, max] = value.split(',').map(v => parseFloat(v.trim()));
            return !isNaN(itemValue) && itemValue >= min && itemValue <= max;
          });
          break;
        case 'in':
          const values = value.split(',').map(v => v.trim().toLowerCase());
          results = results.filter(item =>
            values.includes(String(item[field] || '').toLowerCase())
          );
          break;
      }
    });

    // Apply sorting
    if (sortBy === 'relevance') {
      results = results.sort((a, b) => {
        // Sort by how well they match the criteria
        const aScore = this.calculateMatchScore(a, criteria);
        const bScore = this.calculateMatchScore(b, criteria);
        return sortOrder === 'desc' ? bScore - aScore : aScore - bScore;
      });
    } else {
      results = this.applySorting(results, sortBy, sortOrder);
    }

    return {
      results,
      total: results.length,
      criteria: criteria.length
    };
  }

  // Calculate how well an item matches search criteria
  calculateMatchScore(item, criteria) {
    let score = 0;

    criteria.forEach(criterion => {
      const { field, operator, value } = criterion;
      const itemValue = String(item[field] || '').toLowerCase();
      const searchValue = value.toLowerCase();

      switch (operator) {
        case 'contains':
          if (itemValue.includes(searchValue)) score += 1;
          break;
        case 'equals':
          if (itemValue === searchValue) score += 2;
          break;
        case 'startsWith':
          if (itemValue.startsWith(searchValue)) score += 1.5;
          break;
        default:
          if (itemValue.includes(searchValue)) score += 1;
      }
    });

    return score;
  }

  // Refresh search index
  refreshIndex(type, newData) {
    this.createSearchIndex(newData, type);
  }

  // Clear all indexes
  clearIndexes() {
    this.searchIndexes.clear();
    this.filters.clear();
    this.sortOptions.clear();
  }

  // Get search statistics
  getSearchStats() {
    const analytics = this.getSearchAnalytics();
    const popularSearches = this.getPopularSearches();

    return {
      totalSearches: analytics.length,
      uniqueQueries: new Set(analytics.map(a => a.query)).size,
      averageResults: analytics.reduce((sum, a) => sum + a.resultCount, 0) / analytics.length || 0,
      popularSearches,
      searchTypes: this.getSearchTypeDistribution(analytics)
    };
  }

  // Get search type distribution
  getSearchTypeDistribution(analytics) {
    const distribution = {};

    analytics.forEach(search => {
      distribution[search.type] = (distribution[search.type] || 0) + 1;
    });

    return distribution;
  }
}

// React hooks for search
export const useSearch = (type = 'posts', initialQuery = '') => {
  const [query, setQuery] = React.useState(initialQuery);
  const [results, setResults] = React.useState({ results: [], total: 0 });
  const [loading, setLoading] = React.useState(false);
  const [filters, setFilters] = React.useState({});
  const [sortBy, setSortBy] = React.useState('createdAt');
  const [sortOrder, setSortOrder] = React.useState('desc');
  const [page, setPage] = React.useState(1);
  const [suggestions, setSuggestions] = React.useState([]);

  const search = React.useCallback(async (searchQuery = query) => {
    setLoading(true);

    try {
      const searchResults = await searchEngine.search(searchQuery, {
        type,
        filters,
        sortBy,
        sortOrder,
        page
      });

      setResults(searchResults);

      // Save to search history
      if (searchQuery.trim()) {
        searchEngine.saveSearch(searchQuery, type, searchResults);
      }

      return searchResults;
    } catch (error) {
      console.error('Search error:', error);
      setResults({ results: [], total: 0 });
    } finally {
      setLoading(false);
    }
  }, [query, type, filters, sortBy, sortOrder, page]);

  const updateFilters = React.useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  }, []);

  const updateSorting = React.useCallback((field, order) => {
    setSortBy(field);
    setSortOrder(order);
    setPage(1);
  }, []);

  const clearFilters = React.useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  const loadMore = React.useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  // Get suggestions for autocomplete
  React.useEffect(() => {
    if (query.length >= 2) {
      const suggestions = searchEngine.getSuggestions(query, type);
      setSuggestions(suggestions);
    } else {
      setSuggestions([]);
    }
  }, [query, type]);

  // Perform search when query or filters change
  React.useEffect(() => {
    const debounceTimer = setTimeout(() => {
      search();
    }, 300); // Debounce search

    return () => clearTimeout(debounceTimer);
  }, [search]);

  return {
    query,
    setQuery,
    results,
    loading,
    filters,
    setFilters: updateFilters,
    sortBy,
    sortOrder,
    setSortBy: updateSorting,
    page,
    setPage,
    loadMore,
    clearFilters,
    suggestions,
    search
  };
};

// Create singleton instance
export const searchEngine = new SearchEngine();

export default searchEngine;
