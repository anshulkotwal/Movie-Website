import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play, Star, TrendingUp, Search as SearchIcon, Sparkles } from 'lucide-react';

// Import Components
import Search from './Search';
import MovieCard from './MovieCard';
import Spinner from './Spinner';

// Import Appwrite functions
import { getTrendingMovies, updateSearchCount } from '../utils/AppwriteFunctions';

// OMDB API Configuration
const API_BASE_URL = 'https://www.omdbapi.com/';
const API_KEY = import.meta.env.VITE_OMDB_API_KEY;

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Enhanced state management with persistence
    const [searchTerm, setSearchTerm] = useState(() => {
        // Check for navigation state first, then localStorage
        if (location.state?.searchTerm) {
            return location.state.searchTerm;
        }
        try {
            return localStorage.getItem('lastSearchTerm') || '';
        } catch (error) {
            return '';
        }
    });

    const [movieList, setMovieList] = useState(() => {
        // Check for navigation state first, then localStorage
        if (location.state?.movies && location.state?.preserveSearch) {
            return location.state.movies;
        }
        try {
            const savedMovies = localStorage.getItem('searchResults');
            return savedMovies ? JSON.parse(savedMovies) : [];
        } catch (error) {
            console.error('Error loading saved movies:', error);
            return [];
        }
    });

    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [hasSearched, setHasSearched] = useState(() => {
        // Check if we have preserved search state or saved results
        if (location.state?.preserveSearch || movieList.length > 0) {
            return true;
        }
        try {
            return localStorage.getItem('hasSearched') === 'true';
        } catch (error) {
            return false;
        }
    });

    // Handle navigation state on component mount
    useEffect(() => {
        if (location.state?.preserveSearch) {
            // Clear the navigation state to prevent issues with browser back/forward
            const newState = { ...location.state };
            delete newState.preserveSearch;
            delete newState.movies;
            delete newState.searchTerm;
            
            // Replace the current history entry without the state
            window.history.replaceState(newState, document.title);
        }
    }, [location.state]);

    // Save to localStorage whenever movies change
    useEffect(() => {
        try {
            if (movieList.length > 0) {
                localStorage.setItem('searchResults', JSON.stringify(movieList));
                localStorage.setItem('hasSearched', 'true');
            }
        } catch (error) {
            console.error('Error saving movies to localStorage:', error);
        }
    }, [movieList]);

    // Effect to save searchTerm to localStorage
    useEffect(() => {
        try {
            if (searchTerm) {
                localStorage.setItem('lastSearchTerm', searchTerm);
            }
        } catch (error) {
            console.error('Error saving search term:', error);
        }
    }, [searchTerm]);

    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const fetchMovies = async (query = '') => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const endpoint = `${API_BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}`;
            const response = await fetch(endpoint);
            const data = await response.json();

            if (data.Response === 'False') {
                setErrorMessage(data.Error || 'Failed to fetch movies');
                setMovieList([]);
                setHasSearched(true);
                return;
            }

            setMovieList(data.Search || []);
            setHasSearched(true);

            if (query && data.Search && data.Search.length > 0) {
                await updateSearchCount(query, data.Search[0]);
            }
        } catch (error) {
            console.error(`Error fetching movies: ${error}`);
            setErrorMessage('Error fetching movies. Please try again later.');
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const loadTrendingMovies = async () => {
        try {
            const movies = await getTrendingMovies();
            setTrendingMovies(movies);
        } catch (error) {
            console.error(`Error fetching trending movies: ${error}`);
        }
    };

    // Only fetch if we don't have preserved search state
    useEffect(() => {
        if (!location.state?.preserveSearch && debouncedSearchTerm) {
            fetchMovies(debouncedSearchTerm);
        }
    }, [debouncedSearchTerm]);

    useEffect(() => {
        loadTrendingMovies();
    }, []);

    useEffect(() => {
        gsap.utils.toArray('.scroll-fade').forEach(section => {
            gsap.fromTo(section, 
                { opacity: 0, y: 30 }, 
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 80%',
                        toggleActions: 'play none none none'
                    }
                }
            );
        });
    }, [movieList, trendingMovies]);

    // Clear search function
    const clearSearch = () => {
        setSearchTerm('');
        setMovieList([]);
        setHasSearched(false);
        setErrorMessage('');
        try {
            localStorage.removeItem('searchResults');
            localStorage.removeItem('lastSearchTerm');
            localStorage.removeItem('hasSearched');
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <motion.section 
                className="relative min-h-screen flex items-center justify-center text-center overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                {/* Animated Background Elements */}
                <div className="absolute inset-0">
                    <motion.div 
                        className="absolute top-20 left-10 w-4 h-4 bg-yellow-400 rounded-full opacity-60"
                        animate={{ 
                            y: [0, -20, 0],
                            scale: [1, 1.2, 1],
                            opacity: [0.6, 1, 0.6]
                        }}
                        transition={{ 
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <motion.div 
                        className="absolute top-40 right-20 w-6 h-6 bg-purple-400 rounded-full opacity-50"
                        animate={{ 
                            y: [0, 30, 0],
                            x: [0, -10, 0],
                            scale: [1, 0.8, 1]
                        }}
                        transition={{ 
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1
                        }}
                    />
                    <motion.div 
                        className="absolute bottom-40 left-1/4 w-3 h-3 bg-pink-400 rounded-full opacity-70"
                        animate={{ 
                            rotate: 360,
                            scale: [1, 1.5, 1]
                        }}
                        transition={{ 
                            duration: 8,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                </div>

                <div className="relative z-10 max-w-5xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex items-center justify-center mb-6"
                    >
                        <Sparkles className="w-8 h-8 text-yellow-400 mr-2" />
                        <span className="text-lg font-medium text-purple-300 tracking-wide">
                            Welcome to the Future of Movie Discovery
                        </span>
                        <Sparkles className="w-8 h-8 text-yellow-400 ml-2" />
                    </motion.div>

                    <motion.h1
                        className="text-6xl md:text-8xl font-black mb-8 leading-tight"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.4 }}
                    >
                        <span className="bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent block">
                            Discover
                        </span>
                        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent block">
                            Cinematic
                        </span>
                        <span className="bg-gradient-to-r from-green-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent block">
                            Magic
                        </span>
                    </motion.h1>

                    <motion.p
                        className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        Embark on an extraordinary journey through the world of cinema. 
                        Find your next favorite movie with our intelligent search powered by passion and precision.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="mb-16"
                    >
                        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                        
                        {/* Clear search button - shows when there are results */}
                        {hasSearched && movieList.length > 0 && (
                            <motion.button
                                onClick={clearSearch}
                                className="mt-4 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-full text-sm font-medium transition-colors duration-300"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Clear Search & Show All
                            </motion.button>
                        )}
                    </motion.div>

                    {/* Feature Cards */}
                    <motion.div
                        className="grid md:grid-cols-3 gap-8 mb-20"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 1 }}
                    >
                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
                            <TrendingUp className="w-12 h-12 text-yellow-400 mb-4 group-hover:scale-110 transition-transform" />
                            <h3 className="text-xl font-bold text-white mb-2">Trending Now</h3>
                            <p className="text-gray-300">Stay updated with the hottest movies everyone's talking about</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
                            <SearchIcon className="w-12 h-12 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
                            <h3 className="text-xl font-bold text-white mb-2">Smart Search</h3>
                            <p className="text-gray-300">Find exactly what you're looking for with our intelligent search engine</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
                            <Star className="w-12 h-12 text-pink-400 mb-4 group-hover:scale-110 transition-transform" />
                            <h3 className="text-xl font-bold text-white mb-2">Personal Watchlist</h3>
                            <p className="text-gray-300">Curate your personal collection of must-watch movies</p>
                        </div>
                    </motion.div>

                    {/* CTA Button */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 1.2 }}
                    >
                        <button className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white font-bold rounded-full text-lg overflow-hidden hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105">
                            <span className="relative z-10 flex items-center">
                                <Play className="w-5 h-5 mr-2" />
                                Start Exploring
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-700 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </button>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div 
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 1.5 }}
                >
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
                    >
                        <motion.div
                            animate={{ y: [0, 12, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-1 h-3 bg-white/50 rounded-full mt-2"
                        />
                    </motion.div>
                </motion.div>
            </motion.section>

            {/* Trending Movies Section - Only show when no search results */}
            {trendingMovies.length > 0 && (!hasSearched || movieList.length === 0) && (
                <motion.section
                    className="trending scroll-fade py-20"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="text-center mb-16">
                        <motion.div
                            className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-full text-sm font-bold mb-4"
                            whileHover={{ scale: 1.05 }}
                        >
                            <TrendingUp className="w-4 h-4 mr-2" />
                            HOT RIGHT NOW
                        </motion.div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Trending Movies
                        </h2>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            Discover what's capturing audiences worldwide right now
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {trendingMovies.map((movie, index) => (
                            <motion.div
                                key={movie.$id}
                                className="group relative bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300"
                                whileHover={{ y: -8, scale: 1.02 }}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                            >
                                <div className="absolute -top-3 -left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                                    #{index + 1}
                                </div>
                                <div className="relative overflow-hidden rounded-xl mb-4">
                                    <img
                                        src={movie.poster_url || './fallback.png'}
                                        alt={movie.title}
                                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                                <h3 className="text-white font-bold text-sm mb-2 line-clamp-2">{movie.title}</h3>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-300">Searches: {movie.count}</span>
                                    <div className="flex items-center text-yellow-400">
                                        <Star className="w-3 h-3 mr-1" />
                                        <span>Hot</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>
            )}

            {/* Search Results Section */}
            <motion.section className="all-movies scroll-fade py-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        {searchTerm ? (
                            <>
                                Results for <span className="text-gradient bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">"{searchTerm}"</span>
                            </>
                        ) : hasSearched && movieList.length === 0 ? (
                            'No Movies Found'
                        ) : (
                            'Discover Movies'
                        )}
                    </h2>
                    {searchTerm && movieList.length > 0 && (
                        <p className="text-xl text-gray-300">
                            Found {movieList.length} movies matching your search
                        </p>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Spinner />
                    </div>
                ) : errorMessage ? (
                    <div className="text-center py-20">
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-md mx-auto">
                            <p className="text-red-400 text-lg">{errorMessage}</p>
                            <motion.button
                                onClick={clearSearch}
                                className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm font-medium transition-colors duration-300"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Clear & Try Again
                            </motion.button>
                        </div>
                    </div>
                ) : hasSearched && movieList.length === 0 && searchTerm ? (
                    <div className="text-center py-20">
                        <div className="bg-gray-500/10 border border-gray-500/20 rounded-2xl p-8 max-w-md mx-auto">
                            <SearchIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-400 text-lg mb-4">No movies found for "{searchTerm}"</p>
                            <p className="text-gray-500 text-sm mb-4">Try a different search term!</p>
                            <motion.button
                                onClick={clearSearch}
                                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-sm font-medium transition-colors duration-300"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Clear Search
                            </motion.button>
                        </div>
                    </div>
                ) : movieList.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {movieList.map((movie, index) => (
                            <motion.div
                                key={movie.imdbID}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.05 }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <MovieCard 
                                    movie={movie} 
                                    index={index}
                                    searchState={{
                                        searchTerm,
                                        movies: movieList,
                                        hasSearched
                                    }}
                                />
                            </motion.div>
                        ))}
                    </div>
                ) : null}
            </motion.section>
        </div>
    );
};

export default Hero;