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

  if (error) return <div className="wrapper"><p className="text-red-500">{error}</p></div>;
  if (!movie) return <div className="wrapper"><p>Loading...</p></div>;

  return (
    <motion.div 
      className="wrapper py-10"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <button 
        onClick={() => navigate(-1)} 
        className="mb-6 text-sm text-blue-500 hover:underline"
      >
        ← Back to results
      </button>

      <div className="flex flex-col md:flex-row gap-6">
        <motion.div
          className="w-full md:w-80 rounded shadow"
          whileHover={{ rotateY: 8, scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <img
            src={movie.Poster !== 'N/A' ? movie.Poster : './fallback.png'}
            alt={movie.Title}
            className="w-full h-auto rounded"
            loading="lazy"
          />
        </motion.div>

        <motion.div 
          className="flex-1"
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
          <motion.h1 
            className="text-3xl font-bold mb-2"
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
          >
            {movie.Title}
          </motion.h1>

          <motion.p 
            className="text-gray-500 mb-1"
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
          >
            {movie.Year} • {movie.Runtime} • {movie.Genre}
          </motion.p>

          <motion.p 
            className="mb-4"
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
          >
            {movie.Plot}
          </motion.p>

          <motion.p className="text-sm" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            <strong>Director:</strong> {movie.Director}
          </motion.p>
          <motion.p className="text-sm" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            <strong>Writer:</strong> {movie.Writer}
          </motion.p>
          <motion.p className="text-sm" variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            <strong>Actors:</strong> {movie.Actors}
          </motion.p>

          <div className="mt-4 space-y-1">
            {movie.Ratings?.map((rating, i) => (
              <motion.p 
                key={i}
                className="text-sm"
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
              >
                <strong>{rating.Source}:</strong> {rating.Value}
              </motion.p>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MovieDetail;
