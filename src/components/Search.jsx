import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Search = ({ searchTerm, setSearchTerm }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [particleKey, setParticleKey] = useState(0);
    const [typingEffect, setTypingEffect] = useState('');
    const inputRef = useRef(null);
    const searchRef = useRef(null);

    const popularSearches = [
        'Avengers', 'Spider-Man', 'Batman', 'Star Wars', 'Marvel',
        'Harry Potter', 'Lord of the Rings', 'Fast & Furious', 'Matrix', 'Inception'
    ];

    // Particle animation trigger
    useEffect(() => {
        if (searchTerm) {
            const timer = setTimeout(() => setParticleKey(prev => prev + 1), 100);
            return () => clearTimeout(timer);
        }
    }, [searchTerm]);

    // Typing effect for placeholder
    useEffect(() => {
        const phrases = ['Search for movies...', 'Find your favorites...', 'Discover new films...'];
        let currentPhrase = 0;
        let currentChar = 0;
        let isDeleting = false;

        const typeWriter = () => {
            const phrase = phrases[currentPhrase];
            
            if (!isDeleting && currentChar <= phrase.length) {
                setTypingEffect(phrase.substring(0, currentChar));
                currentChar++;
            } else if (isDeleting && currentChar >= 0) {
                setTypingEffect(phrase.substring(0, currentChar));
                currentChar--;
            }

            if (currentChar === phrase.length && !isDeleting) {
                setTimeout(() => { isDeleting = true; }, 2000);
            } else if (currentChar === 0 && isDeleting) {
                isDeleting = false;
                currentPhrase = (currentPhrase + 1) % phrases.length;
            }
        };

        if (!isFocused && !searchTerm) {
            const timer = setInterval(typeWriter, 100);
            return () => clearInterval(timer);
        }
    }, [isFocused, searchTerm]);

    useEffect(() => {
        const savedSearches = JSON.parse(localStorage.getItem('movieSearchHistory') || '[]');
        setRecentSearches(savedSearches);
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

    // Generate floating particles
    const generateParticles = () => {
        return [...Array(12)].map((_, i) => (
            <motion.div
                key={`particle-${particleKey}-${i}`}
                className="absolute w-1 h-1 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full pointer-events-none"
                initial={{ 
                    x: Math.random() * 200 - 100,
                    y: Math.random() * 100 + 20,
                    opacity: 0,
                    scale: 0
                }}
                animate={{ 
                    x: Math.random() * 400 - 200,
                    y: -100,
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0.5]
                }}
                transition={{ 
                    duration: 2 + Math.random() * 2,
                    ease: "easeOut"
                }}
                style={{
                    left: '50%',
                    top: '50%',
                    filter: 'blur(0.5px)',
                    boxShadow: '0 0 4px rgba(99, 102, 241, 0.6)'
                }}
            />
        ));
    };

    return (
        <motion.div
            className="relative w-full max-w-3xl px-4 sm:px-6 md:px-0 mx-auto mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            ref={searchRef}
        >
            {/* Ambient glow background */}
            <div className="absolute inset-0 -z-20 opacity-20">
                <div className="absolute inset-0 bg-gradient-radial from-indigo-300 via-purple-200 to-transparent blur-3xl animate-pulse"></div>
            </div>

            {/* Floating particles on focus */}
            <AnimatePresence>
                {isFocused && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                        {generateParticles()}
                    </div>
                )}
            </AnimatePresence>

            <div className={`relative transition-all duration-500 ${isFocused ? 'scale-105' : ''}`}>
                {/* Enhanced main search container */}
                <div className={`flex items-center bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border-2 transition-all duration-500 ${
                    isFocused 
                        ? 'border-indigo-500 shadow-indigo-500/25 shadow-2xl' 
                        : 'border-gray-200 hover:border-gray-300'
                } relative overflow-hidden`}>
                    
                    {/* Animated border glow */}
                    <div className={`absolute inset-0 rounded-2xl transition-opacity duration-500 ${
                        isFocused ? 'opacity-100' : 'opacity-0'
                    }`}>
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-20 blur-sm animate-pulse"></div>
                    </div>

                    {/* Search icon with enhanced animations */}
                    <div className="pl-4 pr-2 py-3 relative z-10">
                        <motion.div
                            animate={isFocused ? { 
                                scale: 1.2, 
                                rotate: 360,
                                filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.6))'
                            } : { 
                                scale: 1, 
                                rotate: 0,
                                filter: 'drop-shadow(0 0 0px transparent)'
                            }}
                            transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                        >
                            <svg className={`w-5 h-5 transition-all duration-300 ${
                                isFocused ? 'text-indigo-600' : 'text-gray-400'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </motion.div>
                        
                        {/* Pulsing ring around icon when focused */}
                        <AnimatePresence>
                            {isFocused && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 2, opacity: [0, 0.5, 0] }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="absolute inset-0 rounded-full border-2 border-indigo-400"
                                />
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Enhanced input field */}
                    <div className="flex-1 relative">
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder={isFocused || searchTerm ? "Search for movies..." : typingEffect}
                            value={searchTerm}
                            onChange={handleInputChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            className="w-full py-3 px-2 text-gray-900 placeholder-gray-500 text-base sm:text-lg bg-transparent border-none outline-none relative z-10"
                        />
                        
                        {/* Typing cursor effect */}
                        {!isFocused && !searchTerm && (
                            <motion.div
                                animate={{ opacity: [1, 0] }}
                                transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-0.5 h-5 bg-indigo-500"
                            />
                        )}

                        {/* Shimmer effect on input */}
                        <div className={`absolute inset-0 bg-gradient-to-r from-rgba(0,0,0,0) via-white/30 to-rgba(0,0,0,0) transition-opacity duration-500 ${
                            isFocused ? 'opacity-100 animate-shimmer' : 'opacity-0'
                        }`} />
                    </div>

                    {/* Enhanced clear button */}
                    <AnimatePresence>
                        {searchTerm && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
                                transition={{ type: "spring", stiffness: 200 }}
                                onClick={clearSearch}
                                className="mr-2 p-2 text-gray-400 hover:text-red-500 transition-all duration-300 rounded-full hover:bg-red-50 group"
                            >
                                <motion.svg 
                                    className="w-5 h-5" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                    whileHover={{ rotate: 90, scale: 1.1 }}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </motion.svg>
                                
                                {/* Hover ripple effect */}
                                <motion.div
                                    className="absolute inset-0 rounded-full bg-red-400 opacity-0 group-hover:opacity-20"
                                    initial={{ scale: 0 }}
                                    whileHover={{ scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                />
                            </motion.button>
                        )}
                    </AnimatePresence>

                    {/* Enhanced search button */}
                    <motion.button
                        className={`mr-3 px-4 py-2 rounded-xl font-medium transition-all duration-300 relative overflow-hidden ${
                            searchTerm.trim()
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        whileHover={searchTerm.trim() ? { scale: 1.05, y: -2 } : {}}
                        whileTap={searchTerm.trim() ? { scale: 0.95 } : {}}
                        onClick={() => {
                            if (searchTerm.trim()) {
                                saveSearch(searchTerm);
                                setShowSuggestions(false);
                            }
                        }}
                        disabled={!searchTerm.trim()}
                    >
                        <span className="relative z-10">Search</span>
                        
                        {/* Button glow effect */}
                        {searchTerm.trim() && (
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0"
                                whileHover={{ opacity: 0.3 }}
                                transition={{ duration: 0.3 }}
                            />
                        )}
                        
                        {/* Loading particles inside button */}
                        <AnimatePresence>
                            {searchTerm.trim() && (
                                <div className="absolute inset-0 overflow-hidden">
                                    {[...Array(3)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="absolute w-1 h-1 bg-white rounded-full"
                                            initial={{ x: -10, opacity: 0 }}
                                            animate={{ 
                                                x: 70,
                                                opacity: [0, 1, 0]
                                            }}
                                            transition={{ 
                                                duration: 2,
                                                delay: i * 0.3,
                                                repeat: Infinity 
                                            }}
                                            style={{ top: '50%', transform: 'translateY(-50%)' }}
                                        />
                                    ))}
                                </div>
                            )}
                        </AnimatePresence>
                    </motion.button>
                </div>
            </div>

            {/* Enhanced suggestions dropdown */}
            <AnimatePresence>
                {showSuggestions && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95, rotateX: -10 }}
                        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95, rotateX: -10 }}
                        transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200/50 z-50 overflow-hidden"
                        style={{
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(99, 102, 241, 0.1)'
                        }}
                    >
                        {/* Glass morphism overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/40 to-white/80 backdrop-blur-xl"></div>
                        
                        {recentSearches.length > 0 && (
                            <div className="p-4 border-b border-gray-100/50 relative z-10">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            className="w-3 h-3 mr-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                        />
                                        Recent Searches
                                    </h3>
                                    <motion.button 
                                        onClick={clearRecentSearches} 
                                        className="text-xs text-gray-400 hover:text-red-500 transition-colors duration-200"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        Clear all
                                    </motion.button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {recentSearches.map((search, idx) => (
                                        <motion.button
                                            key={idx}
                                            onClick={() => handleSuggestionClick(search)}
                                            className="bg-gradient-to-r from-gray-100 to-gray-50 px-3 py-1 rounded-full text-sm hover:from-indigo-100 hover:to-purple-100 hover:text-indigo-700 transition-all duration-300 border border-gray-200/50 backdrop-blur-sm"
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                        >
                                            {search}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(searchTerm.length > 0 ? filteredSuggestions : popularSearches).length > 0 && (
                            <div className="p-4 relative z-10">
                                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                    <motion.div
                                        animate={{ 
                                            boxShadow: ['0 0 0 0 rgba(99, 102, 241, 0.7)', '0 0 0 8px rgba(99, 102, 241, 0)']
                                        }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="w-2 h-2 mr-2 rounded-full bg-indigo-500"
                                    />
                                    {searchTerm.length > 0 ? 'Suggestions' : 'Popular Searches'}
                                </h3>
                                <div className="flex flex-col gap-1">
                                    {(searchTerm.length > 0 ? filteredSuggestions : popularSearches).map((search, idx) => (
                                        <motion.button
                                            key={idx}
                                            onClick={() => handleSuggestionClick(search)}
                                            className="text-left px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 text-sm text-gray-800 transition-all duration-300 flex items-center group border border-transparent hover:border-indigo-200/50"
                                            whileHover={{ x: 8, scale: 1.02 }}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            <motion.svg 
                                                className="w-4 h-4 mr-2 text-gray-400 group-hover:text-indigo-500" 
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24"
                                                whileHover={{ rotate: 15, scale: 1.1 }}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </motion.svg>
                                            <span className="flex-1">{search}</span>
                                            
                                            {/* Trending indicator for popular searches */}
                                            {searchTerm.length === 0 && idx < 3 && (
                                                <motion.div
                                                    animate={{ scale: [1, 1.2, 1] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                    className="text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full ml-2"
                                                >
                                                    🔥
                                                </motion.div>
                                            )}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {searchTerm.length > 0 && filteredSuggestions.length === 0 && (
                            <motion.div 
                                className="p-4 text-center text-gray-500 text-sm relative z-10"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="w-8 h-8 mx-auto mb-2 border-2 border-gray-300 border-t-indigo-500 rounded-full"
                                />
                                No results for "<span className="font-medium text-indigo-600">{searchTerm}</span>"
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom CSS for additional effects */}
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
                
                .bg-gradient-radial {
                    background: radial-gradient(circle, var(--tw-gradient-stops));
                }

                @media (prefers-reduced-motion: reduce) {
                    * {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                }
            `}</style>
        </motion.div>
    );
};

export default Search;
