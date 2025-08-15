import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { addMovieToWatchlist, removeMovieFromWatchlist, isMovieInWatchlist } from '../utils/AppwriteFunctions';
import { Heart, Play, Star, Calendar, Info, Sparkles, Eye } from 'lucide-react';

const MovieCard = ({ movie, index = 0, searchState }) => {
    const cardRef = useRef(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [particlesVisible, setParticlesVisible] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const { currentUser } = useAuth();
    const [isInWatchlist, setIsInWatchlist] = useState(false);
    const [watchlistDocId, setWatchlistDocId] = useState(null);

    // Motion values for 3D effects
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Adjusted transform ranges for a more subtle 3D effect
    const rotateX = useTransform(mouseY, [-150, 150], [8, -8]);
    const rotateY = useTransform(mouseX, [-150, 150], [-8, 8]);

    // Check watchlist status on mount and when movie/user changes
    useEffect(() => {
        const checkStatus = async () => {
            if (currentUser && movie.imdbID) {
                try {
                    const item = await isMovieInWatchlist(currentUser.$id, movie.imdbID);
                    if (item) {
                        setIsInWatchlist(true);
                        setWatchlistDocId(item.$id);
                    } else {
                        setIsInWatchlist(false);
                        setWatchlistDocId(null);
                    }
                } catch (error) {
                    console.error("Failed to check movie in watchlist:", error);
                    setIsInWatchlist(false);
                }
            } else {
                setIsInWatchlist(false);
                setWatchlistDocId(null);
            }
        };
        checkStatus();
    }, [currentUser, movie.imdbID]);

    const handleMouseMove = (event) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        mouseX.set(event.clientX - centerX);
        mouseY.set(event.clientY - centerY);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        mouseX.set(0);
        mouseY.set(0);
    };

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    const handleImageError = () => {
        setImageError(true);
        setImageLoaded(true);
    };

    const handleWatchlistToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!currentUser) {
            alert("Please log in to add movies to your watchlist!");
            return;
        }

        if (isProcessing) return;

        setIsProcessing(true);
        setParticlesVisible(true);
        setTimeout(() => setParticlesVisible(false), 1200);

        try {
            if (isInWatchlist) {
                await removeMovieFromWatchlist(watchlistDocId);
                setIsInWatchlist(false);
                setWatchlistDocId(null);
            } else {
                // Enhanced movie object with required attributes
                const movieData = {
                    ...movie,
                    movie_type: movie.Type || 'movie', // Add required movie_type field
                    imdb_id: movie.imdbID, // Ensure imdb_id is present
                    title: movie.Title, // Ensure title is present
                    year: movie.Year, // Ensure year is present
                    poster: movie.Poster !== 'N/A' ? movie.Poster : null, // Handle N/A posters
                };

                console.log('Adding movie to watchlist:', movieData); // Debug log
                const newDoc = await addMovieToWatchlist(currentUser.$id, movieData);
                setIsInWatchlist(true);
                setWatchlistDocId(newDoc.$id);
            }
        } catch (error) {
            console.error("Error toggling watchlist:", error);
            alert(`Failed to update watchlist: ${error.message || 'An unknown error occurred.'}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <motion.div
            ref={cardRef}
            className="relative group perspective-1000 h-full"
            initial={{ opacity: 0, y: 50, rotateY: -30 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{
                duration: 0.8,
                delay: index * 0.1,
                type: "spring",
                stiffness: 100
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d"
            }}
        >
            {/* Dynamic glowing background */}
            <motion.div
                className="absolute -inset-4 rounded-3xl blur-2xl"
                animate={{
                    background: isHovered 
                        ? "linear-gradient(45deg, rgba(168, 85, 247, 0.4), rgba(236, 72, 153, 0.4), rgba(59, 130, 246, 0.4))"
                        : "linear-gradient(45deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))",
                    scale: isHovered ? 1.1 : 1,
                    opacity: isHovered ? 1 : 0.3
                }}
                transition={{ duration: 0.5 }}
            />

            {/* Floating particles for watchlist animation */}
            {particlesVisible && (
                <div className="absolute inset-0 pointer-events-none z-50">
                    {[...Array(25)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-3 h-3 rounded-full"
                            style={{
                                background: isInWatchlist
                                    ? 'linear-gradient(45deg, #ef4444, #f97316, #eab308)'
                                    : 'linear-gradient(45deg, #8b5cf6, #06b6d4, #10b981)',
                                left: `${20 + Math.random() * 60}%`,
                                top: `${20 + Math.random() * 60}%`,
                                boxShadow: '0 0 20px currentColor'
                            }}
                            initial={{ scale: 0, opacity: 1, rotate: 0 }}
                            animate={{
                                scale: [0, 2, 0],
                                opacity: [1, 0.8, 0],
                                rotate: [0, 360, 720],
                                x: (Math.random() - 0.5) * 300,
                                y: (Math.random() - 0.5) * 300,
                            }}
                            transition={{
                                duration: 1.5,
                                delay: Math.random() * 0.4,
                                ease: [0.25, 0.46, 0.45, 0.94]
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Main card wrapper - Link for navigation */}
            <Link 
                to={`/movie/${movie.imdbID}`} 
                className="block h-full"
                style={{ textDecoration: 'none' }}
            >
                <motion.div
                    className="relative h-full bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-700/50 shadow-2xl"
                    style={{ transformStyle: "preserve-3d" }}
                    whileHover={{ 
                        y: -10,
                        boxShadow: "0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(168, 85, 247, 0.3)"
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                    {/* Holographic overlay */}
                    <motion.div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        animate={{
                            background: isHovered
                                ? [
                                    "linear-gradient(45deg, rgba(168, 85, 247, 0.1) 0%, rgba(59, 130, 246, 0.1) 50%, rgba(236, 72, 153, 0.1) 100%)",
                                    "linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 50%, rgba(168, 85, 247, 0.1) 100%)",
                                    "linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(168, 85, 247, 0.1) 50%, rgba(59, 130, 246, 0.1) 100%)"
                                ]
                                : "transparent"
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                    />

                    {/* Movie poster section */}
                    <div className="relative aspect-[2/3] overflow-hidden">
                        {/* Loading shimmer */}
                        {!imageLoaded && (
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700"
                                animate={{
                                    x: ['-100%', '100%']
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                            />
                        )}

                        <motion.img
                            src={movie.Poster !== 'N/A' && !imageError
                                ? movie.Poster
                                : 'https://via.placeholder.com/300x450/1e293b/8b5cf6?text=No+Image'
                            }
                            alt={movie.Title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                            loading="lazy"
                        />

                        {/* Gradient overlay for better text visibility */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                        {/* Floating year badge */}
                        <motion.div
                            className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-white/20"
                            initial={{ opacity: 0, scale: 0, rotate: -180 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ delay: index * 0.1 + 0.5, type: "spring", stiffness: 200 }}
                            whileHover={{ scale: 1.1, rotate: 360 }}
                        >
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {movie.Year}
                        </motion.div>

                        {/* Watchlist heart - Top left */}
                        <motion.div
                            className="absolute top-3 left-3 z-20"
                            style={{ transform: "translateZ(40px)" }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: index * 0.1 + 0.7 }}
                        >
                            <motion.button
                                onClick={handleWatchlistToggle}
                                className={`p-2 rounded-full backdrop-blur-sm border transition-all duration-300 ${
                                    isInWatchlist
                                        ? 'bg-red-500/80 border-red-300/50 text-white shadow-red-500/50'
                                        : 'bg-white/10 border-white/20 text-white shadow-black/50'
                                } shadow-lg`}
                                whileHover={{ 
                                    scale: 1.2, 
                                    rotate: 12,
                                    boxShadow: isInWatchlist 
                                        ? '0 0 25px rgba(239, 68, 68, 0.6)' 
                                        : '0 0 25px rgba(255, 255, 255, 0.4)'
                                }}
                                whileTap={{ scale: 0.9 }}
                                disabled={isProcessing}
                            >
                                <motion.div
                                    animate={{
                                        scale: isInWatchlist ? [1, 1.3, 1] : 1,
                                        rotate: isInWatchlist ? [0, 15, -15, 0] : 0
                                    }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <Heart 
                                        className="w-4 h-4" 
                                        fill={isInWatchlist ? "currentColor" : "none"}
                                    />
                                </motion.div>
                                
                                {/* Sparkle effect when added */}
                                {isInWatchlist && (
                                    <motion.div
                                        className="absolute inset-0"
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 2, opacity: [0, 1, 0] }}
                                        transition={{ duration: 0.8, repeat: Infinity }}
                                    >
                                        <Sparkles className="w-4 h-4 text-yellow-400" />
                                    </motion.div>
                                )}
                            </motion.button>
                        </motion.div>

                        {/* Play button overlay */}
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center"
                            animate={{ opacity: isHovered ? 1 : 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <motion.div
                                className="relative"
                                style={{
                                    transformStyle: 'preserve-3d',
                                    transform: isHovered ? 'translateZ(60px)' : 'translateZ(0px)'
                                }}
                                whileHover={{ 
                                    scale: 1.3, 
                                    rotate: 360,
                                    boxShadow: "0 0 40px rgba(168, 85, 247, 0.8)"
                                }}
                                whileTap={{ scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            >
                                <motion.div
                                    className="w-20 h-20 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl border-2 border-white/30 relative overflow-hidden"
                                >
                                    {/* Rotating border effect */}
                                    <motion.div
                                        className="absolute inset-0 rounded-full"
                                        style={{
                                            background: "conic-gradient(from 0deg, transparent, rgba(255,255,255,0.8), transparent)"
                                        }}
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    />
                                    
                                    <Play className="w-8 h-8 text-white ml-1 relative z-10" />
                                </motion.div>
                            </motion.div>
                        </motion.div>

                        {/* Info overlay on hover */}
                        <motion.div
                            className="absolute bottom-0 left-0 right-0 p-4 text-white"
                            animate={{ 
                                y: isHovered ? 0 : 20,
                                opacity: isHovered ? 1 : 0
                            }}
                            transition={{ duration: 0.3 }}
                            style={{ transform: "translateZ(30px)" }}
                        >
                            <div className="flex items-center gap-2 text-sm">
                                <Info className="w-4 h-4" />
                                <span>Click to view details</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Movie details section */}
                    <motion.div
                        className="p-4 space-y-3"
                        style={{ transform: "translateZ(20px)" }}
                    >
                        <motion.h3
                            className="font-bold text-white text-sm sm:text-base line-clamp-2 group-hover:text-purple-300 transition-colors duration-300"
                            whileHover={{ scale: 1.02, x: 5 }}
                        >
                            {movie.Title}
                        </motion.h3>

                        {/* Movie type badge */}
                        <motion.div
                            className="flex items-center gap-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.8 }}
                        >
                            <span className="px-2 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 rounded-full text-xs text-indigo-300 font-medium">
                                {movie.Type?.toUpperCase() || 'MOVIE'}
                            </span>
                        </motion.div>

                        {/* Action buttons row */}
                        <div className="flex gap-2 mt-3">
                            {/* View Details Button */}
                            <motion.div
                                className="flex-1"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="flex items-center justify-center space-x-2 text-xs px-3 py-2 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-white border border-white/20 shadow-purple-500/30 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
                                    <Eye className="w-4 h-4" />
                                    <span>View Details</span>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* 3D border effect */}
                    <motion.div
                        className="absolute inset-0 rounded-2xl border-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                            borderImage: "linear-gradient(45deg, rgba(168, 85, 247, 0.8), rgba(236, 72, 153, 0.8), rgba(59, 130, 246, 0.8)) 1"
                        }}
                        animate={{
                            borderImage: isHovered 
                                ? [
                                    "linear-gradient(45deg, rgba(168, 85, 247, 0.8), rgba(236, 72, 153, 0.8), rgba(59, 130, 246, 0.8)) 1",
                                    "linear-gradient(90deg, rgba(236, 72, 153, 0.8), rgba(59, 130, 246, 0.8), rgba(168, 85, 247, 0.8)) 1",
                                    "linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(168, 85, 247, 0.8), rgba(236, 72, 153, 0.8)) 1"
                                ]
                                : "linear-gradient(45deg, transparent, transparent, transparent) 1"
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />

                    {/* Corner decorations */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-purple-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-pink-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-blue-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-purple-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
            </Link>
        </motion.div>
    );
};

export default MovieCard;