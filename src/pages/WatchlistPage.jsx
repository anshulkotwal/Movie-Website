/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import * as THREE from 'three'; // Keep THREE for the background particles

// Import actual Appwrite functions and context
import { useAuth } from '../components/AuthContext'; // Correct path to your AuthContext
import { getWatchlist, addMovieToWatchlist, removeMovieFromWatchlist } from '../utils/AppwriteFunctions'; // Import CRUD for watchlist
import { Link } from 'react-router-dom'; // Import Link for navigation

// Spinner Component (retained as is)
const Spinner = () => (
    <div className="relative">
        <motion.div
            className="w-16 h-16 border-4 border-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            style={{
                borderTop: '4px solid transparent',
                background: 'conic-gradient(from 0deg, #a855f7, #ec4899, #3b82f6, #a855f7)'
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
            className="absolute inset-2 w-12 h-12 border-4 border-blue-400 rounded-full"
            style={{ borderRight: '4px solid transparent' }}
            animate={{ rotate: -360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
    </div>
);

// 3D Floating Particles Background (retained as is)
const FloatingParticles = () => {
    const mountRef = useRef(null);

    useEffect(() => {
        if (!mountRef.current) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);
        mountRef.current.appendChild(renderer.domElement);

        // Create floating particles
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 100;
        const posArray = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 20;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.1,
            color: 0x8b5cf6,
            transparent: true,
            opacity: 0.6
        });

        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        camera.position.z = 5;

        const animate = () => {
            requestAnimationFrame(animate);
            particlesMesh.rotation.x += 0.001;
            particlesMesh.rotation.y += 0.002;
            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    return <div ref={mountRef} className="fixed inset-0 -z-10" />;
};

// Consolidated and Enhanced MovieCard Component
const MovieCard = ({ movie, index, onWatchlistToggle, watchlist }) => {
    const cardRef = useRef(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [particlesVisible, setParticlesVisible] = useState(false);

    // Check if movie is in the provided watchlist
    const isInWatchlist = watchlist.some(item => item.imdbID === movie.imdbID);

    // Motion values for 3D effects
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Adjusted transform ranges for a more subtle 3D effect
    const rotateX = useTransform(mouseY, [-150, 150], [10, -10]);
    const rotateY = useTransform(mouseX, [-150, 150], [-10, 10]);

    const handleMouseMove = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        mouseX.set(event.clientX - centerX);
        mouseY.set(event.clientY - centerY);
    };

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    const handleImageError = () => {
        setImageError(true);
        setImageLoaded(true);
    };

    const handleToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent card click from triggering

        setParticlesVisible(true);
        setTimeout(() => setParticlesVisible(false), 1200);

        // Call the parent's watchlist toggle function
        onWatchlistToggle(movie);
    };

    return (
        <motion.div
            className="relative group perspective-1000"
            initial={{ opacity: 0, y: 50, rotateY: -30 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{
                duration: 0.8,
                delay: index * 0.1,
                type: "spring",
                stiffness: 100
            }}
            whileHover={{
                scale: 1.05,
                transition: { duration: 0.3 }
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d"
            }}
        >
            {/* Glowing background */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl"
                animate={{
                    opacity: isHovered ? 1 : 0,
                    scale: isHovered ? 1.1 : 1
                }}
                transition={{ duration: 0.3 }}
            />

            {/* Floating particles for watchlist animation */}
            {particlesVisible && (
                <div className="absolute inset-0 pointer-events-none z-50">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 rounded-full"
                            style={{
                                background: isInWatchlist
                                    ? 'linear-gradient(45deg, #ef4444, #f97316)' // Red/Orange for 'removed'
                                    : 'linear-gradient(45deg, #8b5cf6, #06b6d4)', // Purple/Cyan for 'added'
                                left: `${30 + Math.random() * 40}%`,
                                top: `${30 + Math.random() * 40}%`,
                            }}
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{
                                scale: [0, 1.5, 0],
                                opacity: [1, 0.8, 0],
                                x: (Math.random() - 0.5) * 200,
                                y: (Math.random() - 0.5) * 200,
                            }}
                            transition={{
                                duration: 1.2,
                                delay: Math.random() * 0.3,
                                ease: "easeOut"
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Main card */}
            <motion.div
                className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-700/50 shadow-2xl"
                style={{ transformStyle: "preserve-3d" }}
            >
                {/* Holographic overlay */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    animate={{
                        background: isHovered
                            ? "linear-gradient(45deg, rgba(168, 85, 247, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)"
                            : "transparent"
                    }}
                />

                {/* Movie poster */}
                <div className="relative overflow-hidden aspect-[2/3]">
                    <motion.img
                        src={movie.Poster !== 'N/A' && !imageError
                            ? movie.Poster
                            : 'https://via.placeholder.com/300x450/1e293b/8b5cf6?text=No+Image'
                        }
                        alt={movie.Title}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        loading="lazy"
                    />

                    {/* Floating year badge */}
                    <motion.div
                        className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.5 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {movie.Year}
                    </motion.div>

                    {/* Play button overlay - placeholder for now */}
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
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                            <motion.div
                                className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl border-2 border-white/30"
                            >
                                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                </svg>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Movie details */}
                <motion.div
                    className="p-4 space-y-2"
                    style={{ transform: "translateZ(20px)" }}
                >
                    <motion.h3
                        className="font-bold text-white text-sm sm:text-base line-clamp-2 group-hover:text-purple-300 transition-colors duration-300"
                        whileHover={{ scale: 1.02 }}
                    >
                        {movie.Title}
                    </motion.h3>

                    {/* Watchlist button */}
                    <motion.button
                        onClick={handleToggle}
                        className={`flex items-center justify-center w-full space-x-3 text-sm px-4 py-3 rounded-2xl font-bold transition-all duration-500 shadow-xl backdrop-blur-sm border ${
                            isInWatchlist
                                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white border-white/20 shadow-red-500/30'
                                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-white/20 shadow-purple-500/30'
                        }`}
                        style={{ transform: isHovered ? 'translateZ(35px)' : 'translateZ(0px)' }}
                        whileHover={{
                            scale: 1.05,
                            y: -2,
                            boxShadow: isInWatchlist
                                ? '0 20px 40px rgba(239, 68, 68, 0.4)'
                                : '0 20px 40px rgba(139, 92, 246, 0.4)'
                        }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                        <motion.svg
                            className="w-5 h-5"
                            fill={isInWatchlist ? "currentColor" : "none"}
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            animate={{
                                scale: isInWatchlist ? [1, 1.2, 1] : 1,
                                rotate: isInWatchlist ? [0, 5, -5, 0] : 0
                            }}
                            transition={{ duration: 0.5 }}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 22.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </motion.svg>
                        <motion.span
                            className="relative"
                            animate={{ color: isInWatchlist ? '#fbbf24' : 'white' }}
                        >
                            {isInWatchlist ? 'Saved ✨' : 'Add to Watchlist'}
                        </motion.span>
                    </motion.button>
                </motion.div>

                {/* 3D border effect */}
                <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                        mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                        maskComposite: "exclude"
                    }}
                />
            </motion.div>
        </motion.div>
    );
};


// Animated background elements (retained as is)
const AnimatedBackground = () => (
    <div className="fixed inset-0 -z-20 overflow-hidden">
        {/* Gradient orbs */}
        {[...Array(5)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-3xl"
                style={{
                    width: Math.random() * 400 + 200,
                    height: Math.random() * 400 + 200,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                }}
                animate={{
                    x: [0, 100, 0],
                    y: [0, -100, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: Math.random() * 10 + 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
        ))}
    </div>
);

const WatchlistPage = () => {
    const { currentUser, loadingAuth } = useAuth();
    const [watchlistMovies, setWatchlistMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const titleY = useSpring(0, { stiffness: 100, damping: 30 });

    // Function to handle adding/removing from watchlist
    const handleWatchlistToggle = async (movie) => {
        if (!currentUser) {
            setError("Please log in to manage your watchlist.");
            return;
        }

        const existingMovie = watchlistMovies.find(item => item.imdbID === movie.imdbID);

        try {
            if (existingMovie) {
                // Remove from watchlist
                await removeMovieFromWatchlist(existingMovie.$id);
                setWatchlistMovies(prev => prev.filter(item => item.imdbID !== movie.imdbID));
                console.log(`Removed ${movie.Title} from watchlist.`);
            } else {
                // Add to watchlist
                const newWatchlistItem = await addMovieToWatchlist(currentUser.$id, movie);
                // Ensure the added movie has the $id from Appwrite for future removal
                setWatchlistMovies(prev => [...prev, { ...movie, $id: newWatchlistItem.$id }]);
                console.log(`Added ${movie.Title} to watchlist.`);
            }
            setError(''); // Clear any previous errors
        } catch (err) {
            console.error("Error toggling watchlist:", err);
            setError(`Failed to update watchlist: ${err.message || 'An unknown error occurred.'}`);
        }
    };


    useEffect(() => {
        const fetchWatchlist = async () => {
            if (loadingAuth) return; // Wait for authentication status to be determined

            if (!currentUser) {
                setIsLoading(false);
                setError("Please log in to view your watchlist.");
                setWatchlistMovies([]);
                return;
            }

            console.log("Fetching watchlist for current user:", currentUser.$id);
            try {
                setIsLoading(true);
                setError('');
                const movies = await getWatchlist(currentUser.$id);
                const formattedMovies = movies.map(doc => ({
                    imdbID: doc.movie_imdb_id,
                    Title: doc.movie_title,
                    Poster: doc.movie_poster,
                    Year: doc.movie_year,
                    Type: 'movie', // Assuming all watchlist items are movies for simplicity
                    $id: doc.$id // Crucial for removal
                }));
                setWatchlistMovies(formattedMovies);
                console.log("Watchlist loaded successfully:", formattedMovies);
            } catch (err) {
                console.error("Failed to fetch watchlist:", err);
                setError("Failed to load your watchlist. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchWatchlist();
    }, [currentUser, loadingAuth]); // Re-fetch when currentUser or loadingAuth changes

    if (isLoading) {
        return (
            <>
                <AnimatedBackground />
                <FloatingParticles />
                <motion.div
                    className="min-h-screen flex flex-col items-center justify-center p-4 relative"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div
                        animate={{
                            rotateY: 360,
                            transition: { duration: 2, repeat: Infinity, ease: "linear" }
                        }}
                        style={{ transformStyle: "preserve-3d" }}
                    >
                        <Spinner />
                    </motion.div>
                    <motion.p
                        className="mt-6 text-gray-300 text-lg font-medium bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        Loading your cinematic universe...
                    </motion.p>
                </motion.div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <AnimatedBackground />
                <motion.div
                    className="min-h-screen flex flex-col items-center justify-center p-4 relative"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div
                        className="bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-8 border border-red-500/30 shadow-2xl"
                        animate={{
                            boxShadow: [
                                "0 0 20px rgba(239, 68, 68, 0.3)",
                                "0 0 40px rgba(239, 68, 68, 0.5)",
                                "0 0 20px rgba(239, 68, 68, 0.3)"
                            ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <p className="text-red-400 text-lg font-medium text-center">{error}</p>
                        {!currentUser && (
                            <motion.p
                                className="mt-4 text-gray-300 text-center"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Link to="/login"
                                    className="text-purple-400 hover:text-purple-300 underline font-medium"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Log in
                                </Link> to manage your movies.
                            </motion.p>
                        )}
                    </motion.div>
                </motion.div>
            </>
        );
    }

    return (
        <>
            <AnimatedBackground />
            <FloatingParticles />
            <motion.div
                className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                {/* Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <motion.h1
                        className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4"
                        style={{ y: titleY }}
                        animate={{
                            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                        }}
                        transition={{ duration: 5, repeat: Infinity }}
                    >
                        Your Watchlist
                    </motion.h1>
                    <motion.div
                        className="h-1 w-32 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: 128 }}
                        transition={{ duration: 1, delay: 0.5 }}
                    />
                </motion.div>

                <AnimatePresence mode="wait">
                    {watchlistMovies.length === 0 ? (
                        <motion.div
                            key="empty"
                            className="text-center text-gray-300 max-w-2xl mx-auto"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.6 }}
                        >
                            <motion.div
                                className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-3xl p-12 border border-gray-700/50 shadow-2xl"
                                animate={{
                                    boxShadow: [
                                        "0 0 20px rgba(139, 92, 246, 0.3)",
                                        "0 0 40px rgba(139, 92, 246, 0.5)",
                                        "0 0 20px rgba(139, 92, 246, 0.3)"
                                    ]
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                            >
                                <motion.div
                                    className="text-6xl mb-6"
                                    animate={{ rotateY: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                >
                                    🎬
                                </motion.div>
                                <motion.p
                                    className="text-xl sm:text-2xl font-medium mb-4"
                                    animate={{ opacity: [0.7, 1, 0.7] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    Your watchlist is empty!
                                </motion.p>
                                <p className="text-gray-400 mb-8">Start searching for movies you'd like to save.</p>
                                <Link to="/" // Link to your search/home page
                                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl shadow-lg font-medium text-lg"
                                    whileHover={{
                                        scale: 1.05,
                                        boxShadow: "0 10px 30px rgba(139, 92, 246, 0.4)"
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    animate={{
                                        background: [
                                            "linear-gradient(45deg, #9333ea, #3b82f6)",
                                            "linear-gradient(45deg, #3b82f6, #9333ea)",
                                            "linear-gradient(45deg, #9333ea, #3b82f6)"
                                        ]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                >
                                    Browse Movies
                                </Link>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="movies"
                            className="max-w-7xl mx-auto"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8 }}
                        >
                            <motion.div
                                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: {
                                        opacity: 1,
                                        transition: {
                                            staggerChildren: 0.1
                                        }
                                    }
                                }}
                                initial="hidden"
                                animate="visible"
                            >
                                {watchlistMovies.map((movie, index) => (
                                    <MovieCard
                                        key={movie.$id || movie.imdbID} // Use Appwrite $id if available, fallback to imdbID
                                        movie={movie}
                                        index={index}
                                        onWatchlistToggle={handleWatchlistToggle}
                                        watchlist={watchlistMovies} // Pass current watchlist for isInWatchlist check
                                    />
                                ))}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </>
    );
};

export default WatchlistPage;
