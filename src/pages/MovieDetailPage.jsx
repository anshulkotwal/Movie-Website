import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate,useLocation } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Play, Star, Award, Calendar, Clock, Globe, Users, ArrowLeft, Heart, Share, BookOpen } from 'lucide-react';

// OMDB API Configuration
const API_BASE_URL = 'https://www.omdbapi.com/';
const API_KEY = import.meta.env.VITE_OMDB_API_KEY;

const FloatingParticle = ({ delay = 0 }) => (
  <motion.div
    className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20"
    animate={{
      y: [0, -100, 0],
      x: [0, 50, -50, 0],
      scale: [1, 1.5, 1],
      opacity: [0.2, 0.8, 0.2]
    }}
    transition={{
      duration: 8,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    style={{
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`
    }}
  />
);

const GlowingRating = ({ rating, source, index }) => (
  <motion.div
    initial={{ scale: 0, rotateY: 180 }}
    animate={{ scale: 1, rotateY: 0 }}
    transition={{ delay: index * 0.2, duration: 0.8, type: "spring" }}
    whileHover={{ 
      scale: 1.1, 
      rotateY: 360,
      boxShadow: "0 0 30px rgba(168, 85, 247, 0.6)"
    }}
    className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-red-500 text-white px-4 py-3 rounded-2xl text-sm font-bold shadow-2xl border border-purple-300/30 backdrop-blur-sm"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 hover:opacity-100 transition-opacity duration-300" />
    <div className="relative z-10 flex items-center gap-2">
      <Star className="w-4 h-4" />
      <span>{source}: {rating}</span>
    </div>
  </motion.div>
);

const Spinner = () => (
  <div className="relative">
    <motion.div
      className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
    <motion.div
      className="absolute inset-2 w-12 h-12 border-4 border-pink-200 border-b-pink-600 rounded-full"
      animate={{ rotate: -360 }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

const MovieDetailPage = () => {
  const { imdbID } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
  const [movieDetails, setMovieDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0.3]);
  
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const response = await fetch(`${API_BASE_URL}?apikey=${API_KEY}&i=${imdbID}&plot=full`);
        const data = await response.json();
        
        if (data.Response === 'True') {
          setMovieDetails(data);
        } else {
          setError(data.Error || 'Movie not found');
        }
      } catch (err) {
        console.error('Error fetching movie details:', err);
        setError('Failed to fetch movie details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (imdbID) {
      fetchMovieDetails();
    }
  }, [imdbID]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) / 20);
    y.set((e.clientY - centerY) / 20);
  };

  const handleGoBack = () => {
        const state = location.state;
        
        if (state && (state.movies || state.searchTerm)) {
            // Navigate back with preserved search state
            navigate(state.from || '/', { 
                state: { 
                    movies: state.movies || [],
                    searchTerm: state.searchTerm || '',
                    hasSearched: state.hasSearched || false,
                    preserveSearch: true // This tells Hero to use the preserved state
                },
                replace: true // Replace current history entry to avoid issues
            });
        } else {
            // Fallback to normal back navigation
            navigate(-1);
        }
    };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <FloatingParticle key={i} delay={i * 0.2} />
          ))}
        </div>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="relative z-10 text-center"
        >
          <Spinner />
          <motion.p
            className="mt-6 text-white text-xl font-light tracking-wider"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Loading cinematic experience...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-purple-900 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0, rotateX: 90 }}
          animate={{ scale: 1, rotateX: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center max-w-md"
        >
          <motion.div 
            className="text-8xl mb-6"
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            🎬
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-4">Oops!</h2>
          <p className="text-white text-xl mb-8">{error}</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => navigate(-1)} 
              className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-full hover:from-gray-500 hover:to-gray-600 transition-all duration-300 shadow-2xl flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-2xl"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!movieDetails) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <FloatingParticle key={i} delay={i * 0.1} />
        ))}
      </div>

      {/* Cosmic Background Effect */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, #7c3aed 0%, transparent 50%)",
            "radial-gradient(circle at 80% 20%, #ec4899 0%, transparent 50%)",
            "radial-gradient(circle at 40% 80%, #3b82f6 0%, transparent 50%)",
            "radial-gradient(circle at 20% 50%, #7c3aed 0%, transparent 50%)"
          ]
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <motion.div
        ref={containerRef}
        className="relative z-10 py-8 px-4 sm:py-16"
        style={{ y: y1, opacity }}
        onMouseMove={handleMouseMove}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ x, y }}
          className="max-w-7xl mx-auto"
        >
          {/* Back Button */}
          <motion.button
                onClick={handleGoBack} 
                className="mb-8 flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-300 group"
                whileHover={{ x: -5 }}
                whileTap={{ scale: 0.95 }}
            >
                <ArrowLeft className="w-5 h-5 group-hover:text-purple-400 transition-colors" />
                <span className="font-medium">
                    {location.state?.searchTerm ? `Back to "${location.state.searchTerm}" results` : 'Back to Movies'}
                </span>
            </motion.button>

          {/* Movie Container */}
          <div className="flex flex-col xl:flex-row gap-8 lg:gap-12 items-start">
            
            {/* Movie Poster */}
            <motion.div
              className="flex-shrink-0 relative group mx-auto xl:mx-0"
              initial={{ x: -100, opacity: 0, rotateY: -30 }}
              animate={{ x: 0, opacity: 1, rotateY: 0 }}
              transition={{ duration: 1.2, type: "spring" }}
              whileHover={{ 
                scale: 1.05, 
                rotateY: 5,
                transition: { duration: 0.3 }
              }}
            >
              <div className="relative">
                {/* Glowing border effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl opacity-75 group-hover:opacity-100 blur-xl group-hover:blur-2xl transition-all duration-500" />
                
                {/* Main poster */}
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-2 rounded-2xl shadow-2xl">
                  <img
                    src={movieDetails.Poster !== 'N/A' ? movieDetails.Poster : '/api/placeholder/400/600'}
                    alt={movieDetails.Title}
                    className="w-64 sm:w-80 h-80 sm:h-[480px] object-cover rounded-xl shadow-lg"
                  />
                  
                  {/* Holographic overlay */}
                  <motion.div
                    className="absolute inset-2 rounded-xl bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    animate={{
                      background: [
                        "linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)",
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                        "linear-gradient(135deg, transparent, rgba(255,255,255,0.1), transparent)",
                        "linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)"
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </div>

                {/* Floating rating badge */}
                <motion.div
                  className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-full font-black text-lg shadow-2xl"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.1, rotate: 360 }}
                >
                  ⭐ {movieDetails.imdbRating || 'N/A'}
                </motion.div>
              </div>
            </motion.div>

            {/* Movie Details */}
            <motion.div
              className="flex-grow space-y-6 text-center xl:text-left max-w-4xl"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.3 }}
              style={{ y: y2 }}
            >
              {/* Title */}
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent leading-tight"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                whileHover={{ 
                  scale: 1.02,
                  textShadow: "0 0 50px rgba(168, 85, 247, 0.5)"
                }}
              >
                {movieDetails.Title}
              </motion.h1>

              {/* Meta Info */}
              <motion.div
                className="flex flex-wrap gap-3 sm:gap-6 justify-center xl:justify-start text-purple-200 text-sm sm:text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {[
                  { icon: Calendar, text: movieDetails.Year },
                  { icon: Award, text: movieDetails.Rated },
                  { icon: Clock, text: movieDetails.Runtime },
                  { icon: Globe, text: movieDetails.Language }
                ].map((item, index) => (
                  <motion.span
                    key={index}
                    className="relative px-3 sm:px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-purple-300/30 flex items-center gap-2"
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.7 + index * 0.1, type: "spring" }}
                    whileHover={{ 
                      scale: 1.05, 
                      backgroundColor: "rgba(168, 85, 247, 0.2)",
                      boxShadow: "0 0 20px rgba(168, 85, 247, 0.4)"
                    }}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-xs sm:text-sm">{item.text}</span>
                  </motion.span>
                ))}
              </motion.div>

              {/* Genre Tags */}
              <motion.div
                className="flex flex-wrap gap-2 justify-center xl:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                {movieDetails.Genre?.split(', ').map((genre, index) => (
                  <motion.span
                    key={index}
                    className="px-3 py-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-400/30 rounded-full text-purple-200 text-sm font-medium"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    whileHover={{ scale: 1.1, backgroundColor: "rgba(168, 85, 247, 0.3)" }}
                  >
                    {genre}
                  </motion.span>
                ))}
              </motion.div>

              {/* Plot */}
              <motion.p
                className="text-lg sm:text-xl text-gray-200 leading-relaxed font-light max-w-4xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
              >
                {movieDetails.Plot}
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                className="flex flex-wrap gap-4 justify-center xl:justify-start"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                <motion.button
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-2xl hover:shadow-purple-500/50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-5 h-5" />
                  Watch Trailer
                </motion.button>
                <motion.button
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold rounded-full hover:bg-white/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Heart className="w-5 h-5" />
                  Add to Watchlist
                </motion.button>
                <motion.button
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold rounded-full hover:bg-white/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Share className="w-5 h-5" />
                  Share
                </motion.button>
              </motion.div>

              {/* Ratings */}
              {movieDetails.Ratings && movieDetails.Ratings.length > 0 && (
                <motion.div
                  className="flex flex-wrap gap-4 justify-center xl:justify-start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3 }}
                >
                  {movieDetails.Ratings.map((rating, index) => (
                    <GlowingRating 
                      key={index} 
                      rating={rating.Value} 
                      source={rating.Source} 
                      index={index}
                    />
                  ))}
                </motion.div>
              )}

              {/* Additional Info Grid */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300 max-w-4xl"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.8 }}
              >
                {[
                  { label: "Director", value: movieDetails.Director, icon: Users },
                  { label: "Writer", value: movieDetails.Writer, icon: BookOpen },
                  { label: "Actors", value: movieDetails.Actors, icon: Users },
                  { label: "Awards", value: movieDetails.Awards, icon: Award }
                ].filter(info => info.value && info.value !== 'N/A').map((info, index) => (
                  <motion.div
                    key={index}
                    className="bg-white/5 backdrop-blur-sm border border-purple-300/20 p-4 rounded-xl hover:bg-white/10 transition-all duration-300"
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.7 + index * 0.1 }}
                    whileHover={{ 
                      scale: 1.02,
                      borderColor: "rgba(168, 85, 247, 0.5)",
                      boxShadow: "0 0 25px rgba(168, 85, 247, 0.2)"
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <info.icon className="w-4 h-4 text-purple-400" />
                      <p className="text-purple-300 font-semibold">{info.label}:</p>
                    </div>
                    <p className="text-white font-light text-sm">{info.value}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MovieDetailPage;