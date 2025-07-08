import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const API_KEY = import.meta.env.VITE_OMDB_API_KEY;

const MovieDetail = () => {
  const { imdbID } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!imdbID) {
      setError('Invalid IMDb ID');
      return;
    }

    const fetchMovieDetails = async () => {
      try {
        const res = await fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=${API_KEY}`);
        const data = await res.json();
        if (data.Response === 'True') {
          setMovie(data);
        } else {
          setError(data.Error || 'Movie not found.');
        }
      } catch (err) {
        setError('Failed to fetch movie.');
      }
    };

    fetchMovieDetails();
  }, [imdbID]);

  if (error) {
    return (
      <div className="wrapper py-20">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <p className="text-red-500 text-xl mb-4">{error}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="wrapper py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading movie details...</p>
        </div>
      </div>
    );
  }

  const getRatingColor = (rating) => {
    if (rating >= 8) return 'text-green-600 bg-green-100';
    if (rating >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getImdbRating = () => {
    const imdbRating = movie.Ratings?.find(r => r.Source === 'Internet Movie Database');
    return imdbRating ? parseFloat(imdbRating.Value.split('/')[0]) : null;
  };

  const imdbRating = getImdbRating();

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Hero Section with Backdrop */}
      <div className="relative">
        <div className="absolute inset-0 bg-black/60"></div>
        <div 
          className="h-96 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: movie.Poster !== 'N/A' ? `url(${movie.Poster})` : 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        </div>
        
        <div className="absolute top-6 left-6 z-10">
          <motion.button 
            onClick={() => navigate(-1)} 
            className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to results
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="wrapper -mt-32 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Movie Poster */}
          <motion.div
            className="w-full lg:w-80 mx-auto lg:mx-0"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl overflow-hidden"
              whileHover={{ 
                rotateY: 8, 
                scale: 1.02,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <img
                src={movie.Poster !== 'N/A' ? movie.Poster : './fallback.png'}
                alt={movie.Title}
                className="w-full h-auto"
                loading="lazy"
              />
            </motion.div>
          </motion.div>

          {/* Movie Info */}
          <motion.div 
            className="flex-1 bg-white rounded-2xl shadow-xl p-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {/* Title and Rating */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <motion.h1 
                  className="text-4xl font-bold text-gray-900"
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                >
                  {movie.Title}
                </motion.h1>
                
                {imdbRating && (
                  <motion.div 
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${getRatingColor(imdbRating)}`}
                    variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}
                  >
                    ⭐ {imdbRating}/10
                  </motion.div>
                )}
              </div>

              {/* Movie Meta */}
              <motion.div 
                className="flex flex-wrap gap-4 text-gray-600 mb-6"
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              >
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">{movie.Year}</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">{movie.Runtime}</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">{movie.Rated}</span>
              </motion.div>

              {/* Genres */}
              <motion.div 
                className="flex flex-wrap gap-2 mb-6"
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              >
                {movie.Genre?.split(', ').map((genre, index) => (
                  <span 
                    key={index}
                    className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {genre}
                  </span>
                ))}
              </motion.div>

              {/* Plot */}
              <motion.div 
                className="mb-8"
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              >
                <h2 className="text-xl font-semibold mb-3 text-gray-900">Synopsis</h2>
                <p className="text-gray-700 leading-relaxed text-lg">
                  {movie.Plot}
                </p>
              </motion.div>

              {/* Cast & Crew */}
              <motion.div 
                className="grid md:grid-cols-2 gap-6 mb-8"
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Director</h3>
                    <p className="text-gray-700">{movie.Director}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Writer</h3>
                    <p className="text-gray-700">{movie.Writer}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Cast</h3>
                  <p className="text-gray-700">{movie.Actors}</p>
                </div>
              </motion.div>

              {/* Additional Info */}
              {(movie.Awards || movie.Country || movie.Language) && (
                <motion.div 
                  className="grid md:grid-cols-2 gap-6 mb-8"
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                >
                  {movie.Awards && movie.Awards !== 'N/A' && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Awards</h3>
                      <p className="text-gray-700">{movie.Awards}</p>
                    </div>
                  )}
                  <div className="space-y-4">
                    {movie.Country && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Country</h3>
                        <p className="text-gray-700">{movie.Country}</p>
                      </div>
                    )}
                    {movie.Language && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Language</h3>
                        <p className="text-gray-700">{movie.Language}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Ratings */}
              {movie.Ratings && movie.Ratings.length > 0 && (
                <motion.div 
                  className="border-t pt-6"
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                >
                  <h3 className="font-semibold text-gray-900 mb-4">Ratings</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {movie.Ratings.map((rating, i) => (
                      <motion.div 
                        key={i}
                        className="bg-gray-50 rounded-xl p-4 text-center"
                        variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {rating.Value}
                        </div>
                        <div className="text-sm text-gray-600">
                          {rating.Source}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default MovieDetail;