import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Search = ({ searchTerm, setSearchTerm }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const searchRef = useRef(null);

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
      className="relative w-full max-w-3xl px-4 sm:px-6 md:px-0 mx-auto mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      ref={searchRef}
    >
      {/* Search Box */}
      <div className={`relative transition-all duration-300 ${isFocused ? 'scale-105' : ''}`}>
        <div className={`flex items-center bg-white rounded-2xl shadow-md border-2 ${isFocused ? 'border-indigo-500' : 'border-gray-200'} transition-all duration-300`}>
          {/* Icon */}
          <div className="pl-4 pr-2 py-3">
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
            placeholder="Search for movies..."
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="flex-1 py-3 px-2 text-gray-900 placeholder-gray-500 text-base sm:text-lg bg-transparent border-none outline-none"
          />

          {/* Clear Button */}
          <AnimatePresence>
            {searchTerm && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={clearSearch}
                className="mr-2 p-2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            className={`mr-3 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
              searchTerm.trim()
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            whileHover={searchTerm.trim() ? { scale: 1.05 } : {}}
            whileTap={searchTerm.trim() ? { scale: 0.95 } : {}}
            onClick={() => {
              if (searchTerm.trim()) {
                saveSearch(searchTerm);
                setShowSuggestions(false);
              }
            }}
            disabled={!searchTerm.trim()}
          >
            Search
          </motion.button>
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
          >
            {/* Recent */}
            {recentSearches.length > 0 && (
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">Recent Searches</h3>
                  <button onClick={clearRecentSearches} className="text-xs text-gray-400 hover:text-red-500">
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => handleSuggestionClick(search)}
                      className="bg-gray-100 px-3 py-1 rounded-full text-sm hover:bg-indigo-100 hover:text-indigo-700 transition"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {search}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {(searchTerm.length > 0 ? filteredSuggestions : popularSearches).length > 0 && (
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  {searchTerm.length > 0 ? 'Suggestions' : 'Popular Searches'}
                </h3>
                <div className="flex flex-col gap-2">
                  {(searchTerm.length > 0 ? filteredSuggestions : popularSearches).map((search, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => handleSuggestionClick(search)}
                      className="text-left px-3 py-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 text-sm text-gray-800 transition flex items-center"
                      whileHover={{ x: 4 }}
                    >
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      {search}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {searchTerm.length > 0 && filteredSuggestions.length === 0 && (
              <div className="p-4 text-center text-gray-500 text-sm">
                No results for "<span className="font-medium">{searchTerm}</span>"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Search;
