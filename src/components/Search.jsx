import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Search = ({ searchTerm, setSearchTerm }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

  const popularSearches = [
    'Avengers', 'Spider-Man', 'Batman', 'Star Wars', 'Marvel',
    'Harry Potter', 'Lord of the Rings', 'Fast & Furious', 'Matrix', 'Inception'
  ];

  useEffect(() => {
    const savedSearches = localStorage.getItem('movieSearchHistory');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  const saveSearch = (search) => {
    if (search.trim() && !recentSearches.includes(search)) {
      const newRecentSearches = [search, ...recentSearches.slice(0, 4)];
      setRecentSearches(newRecentSearches);
      localStorage.setItem('movieSearchHistory', JSON.stringify(newRecentSearches));
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(value.length > 0 || isFocused);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestions(false);
    }, 200);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    saveSearch(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      saveSearch(searchTerm);
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    inputRef.current?.focus();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('movieSearchHistory');
  };

  const filteredSuggestions = popularSearches.filter(search =>
    search.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      className="search-container relative max-w-2xl mx-auto mt-8 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      {/* Search Bar */}
      <div className={`flex flex-col sm:flex-row items-stretch gap-2 bg-white rounded-2xl shadow-lg border-2 p-2 transition-all duration-300 ${
        isFocused ? 'border-indigo-500 shadow-xl' : 'border-gray-200'
      }`}>
        {/* Icon */}
        <div className="flex items-center justify-center pl-2 sm:pl-4">
          <motion.div
            animate={isFocused ? { scale: 1.1, rotate: 360 } : { scale: 1, rotate: 0 }}
            transition={{ duration: 0.3 }}
          >
            <svg className={`w-5 h-5 ${isFocused ? 'text-indigo-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </motion.div>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          placeholder="Search movies..."
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="flex-1 w-full py-2 px-3 text-gray-900 placeholder-gray-500 bg-transparent border-none outline-none text-lg"
          autoComplete="off"
        />

        {/* Clear Button */}
        <AnimatePresence>
          {searchTerm && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={clearSearch}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Search Button */}
        <motion.button
          onClick={() => {
            if (searchTerm.trim()) {
              saveSearch(searchTerm);
              setShowSuggestions(false);
            }
          }}
          disabled={!searchTerm.trim()}
          className={`w-full sm:w-auto px-5 py-2 rounded-xl font-medium text-white transition-all duration-300 ${
            searchTerm.trim() ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md' : 'bg-gray-300 cursor-not-allowed'
          }`}
          whileHover={searchTerm.trim() ? { scale: 1.05 } : {}}
          whileTap={searchTerm.trim() ? { scale: 0.95 } : {}}
        >
          Search
        </motion.button>
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50"
          >
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">Recent Searches</h3>
                  <button
                    onClick={clearRecentSearches}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((item, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleSuggestionClick(item)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-indigo-100 hover:text-indigo-700"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {item}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular / Filtered Suggestions */}
            {(searchTerm.length > 0 ? filteredSuggestions : popularSearches).length > 0 && (
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  {searchTerm.length > 0 ? 'Suggestions' : 'Popular Searches'}
                </h3>
                <div className="space-y-1">
                  {(searchTerm.length > 0 ? filteredSuggestions : popularSearches).map((item, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleSuggestionClick(item)}
                      className="w-full text-left px-3 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg flex items-center"
                      whileHover={{ x: 5 }}
                    >
                      <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      {item}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {searchTerm.length > 0 && filteredSuggestions.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">No suggestions found for "{searchTerm}"</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Search;
