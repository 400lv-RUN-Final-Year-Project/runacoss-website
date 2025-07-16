import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RepositoryFile, FileSearchFilters } from '../../services/types';
import { repositoryDataService, repositoryCategories, repositoryDepartments } from '../../data/RepositoryFileData';
import RepositoryFileList from '../../componentLibrary/RepositoryFileList';
import MultimediaViewer from '../../componentLibrary/MultimediaViewer';
import Footer from "../contact/Footer";

const RepositorySearch: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FileSearchFilters>({
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [selectedFile, setSelectedFile] = useState<RepositoryFile | null>(null);
  const [showViewer, setShowViewer] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const resultsCountRef = useRef<HTMLDivElement>(null);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('repositorySearchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Save search to history
  const saveToHistory = useCallback((query: string) => {
    if (!query.trim()) return;
    const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('repositorySearchHistory', JSON.stringify(newHistory));
  }, [searchHistory]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      saveToHistory(query);
    }
    // Announce to screen readers
    setTimeout(() => {
      if (resultsCountRef.current) {
        resultsCountRef.current.focus();
      }
    }, 100);
  }, [saveToHistory]);

  const handleFileSelect = (file: RepositoryFile) => {
    setSelectedFile(file);
    setShowViewer(true);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    // Announce to screen readers
    setTimeout(() => {
      if (resultsCountRef.current) {
        resultsCountRef.current.focus();
      }
    }, 100);
  };

  const clearFilters = () => {
    setFilters({
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setSearchQuery('');
    setTimeout(() => {
      if (resultsCountRef.current) {
        resultsCountRef.current.focus();
      }
    }, 100);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (filters.category) count++;
    if (filters.department) count++;
    if (filters.level) count++;
    if (filters.semester) count++;
    if (filters.fileType) count++;
    return count;
  };

  // Skip to results link for accessibility
  const skipToResultsId = "repository-search-results";

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 px-6 md:px-20 py-8">
        {/* Skip to Results Link */}
        <a
          href={`#${skipToResultsId}`}
          className="sr-only focus:not-sr-only absolute left-0 top-0 bg-blue-600 text-white px-4 py-2 z-50"
          tabIndex={0}
        >
          Skip to search results
        </a>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Repository</h1>
              <p className="text-gray-600">Find files across all categories and departments</p>
            </div>
            <button
              onClick={() => navigate('/repository')}
              className="text-gray-600 hover:text-gray-800 transition-colors focus:outline-blue-500"
              aria-label="Back to Repository"
            >
              ← Back to Repository
            </button>
          </div>

          {/* Search Bar */}
          <form role="search" aria-label="Repository search" className="relative mb-6">
            <input
              type="text"
              placeholder="Search files by name, description, course code, or tags..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              aria-label="Search files"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" aria-hidden="true">
              🔍
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearch('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-blue-500"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </form>

          {/* Search History */}
          {searchHistory.length > 0 && !searchQuery && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Searches</h3>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(query)}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors focus:outline-blue-500"
                    aria-label={`Search for ${query}`}
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filter Toggle */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors focus:outline-blue-500"
              aria-expanded={showAdvancedFilters}
              aria-controls="advanced-filters-panel"
              aria-label="Toggle advanced filters"
            >
              <span>🔧</span>
              <span>Advanced Filters</span>
              <span>{showAdvancedFilters ? '▼' : '▶'}</span>
            </button>
            {getActiveFiltersCount() > 0 && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {getActiveFiltersCount()} active filter{getActiveFiltersCount() !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-600 hover:text-red-700 transition-colors focus:outline-blue-500"
                  aria-label="Clear all filters"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="bg-white p-6 rounded-lg shadow-sm border mb-6" id="advanced-filters-panel">
              <h3 className="font-semibold text-gray-800 mb-4">Advanced Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="filter-category">
                    Category
                  </label>
                  <select
                    id="filter-category"
                    value={filters.category || ''}
                    onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Filter by category"
                  >
                    <option value="">All Categories</option>
                    {repositoryCategories.map(cat => (
                      <option key={cat.name} value={cat.name}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Department Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="filter-department">
                    Department
                  </label>
                  <select
                    id="filter-department"
                    value={filters.department || ''}
                    onChange={(e) => handleFilterChange('department', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Filter by department"
                  >
                    <option value="">All Departments</option>
                    {repositoryDepartments.map(dept => (
                      <option key={dept.code} value={dept.code}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Level Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="filter-level">
                    Level
                  </label>
                  <select
                    id="filter-level"
                    value={filters.level || ''}
                    onChange={(e) => handleFilterChange('level', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Filter by level"
                  >
                    <option value="">All Levels</option>
                    <option value="100">100 Level</option>
                    <option value="200">200 Level</option>
                    <option value="300">300 Level</option>
                    <option value="400">400 Level</option>
                    <option value="500">500 Level</option>
                    <option value="600">600 Level</option>
                    <option value="general">General</option>
                  </select>
                </div>
                {/* Semester Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="filter-semester">
                    Semester
                  </label>
                  <select
                    id="filter-semester"
                    value={filters.semester || ''}
                    onChange={(e) => handleFilterChange('semester', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Filter by semester"
                  >
                    <option value="">All Semesters</option>
                    <option value="first">First Semester</option>
                    <option value="second">Second Semester</option>
                    <option value="summer">Summer</option>
                    <option value="general">General</option>
                  </select>
                </div>
                {/* File Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="filter-filetype">
                    File Type
                  </label>
                  <select
                    id="filter-filetype"
                    value={filters.fileType || ''}
                    onChange={(e) => handleFilterChange('fileType', e.target.value || undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Filter by file type"
                  >
                    <option value="">All File Types</option>
                    <option value="pdf">PDF</option>
                    <option value="docx">Word</option>
                    <option value="pptx">PowerPoint</option>
                    <option value="txt">Text</option>
                    <option value="jpg">Image (JPG)</option>
                    <option value="png">Image (PNG)</option>
                    <option value="mp4">Video (MP4)</option>
                    <option value="mp3">Audio (MP3)</option>
                    {/* Add more as needed */}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count (ARIA live region) */}
        <div
          id={skipToResultsId}
          ref={resultsCountRef}
          tabIndex={-1}
          aria-live="polite"
          className="mb-4 text-sm text-gray-600"
        >
          {/* RepositoryFileList will show the count, but you can add a summary here if needed */}
        </div>

        {/* File List */}
        <RepositoryFileList
          {...filters}
          search={searchQuery}
          onFileSelect={handleFileSelect}
          className="mt-4"
        />
        {/* Multimedia Viewer (if needed) */}
        {showViewer && selectedFile && (
          <MultimediaViewer
            file={selectedFile}
            onClose={() => setShowViewer(false)}
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default RepositorySearch; 