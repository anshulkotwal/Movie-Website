import { useEffect, useState } from 'react'
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx'
import { useDebounce } from 'react-use'
import { getTrendingMovies, updateSearchCount } from './appwrite.js'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const API_BASE_URL = 'https://www.omdbapi.com/';
const API_KEY = import.meta.env.VITE_OMDB_API_KEY;

gsap.registerPlugin(ScrollTrigger);

const App = () => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [searchTerm, setSearchTerm] = useState('');

  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [trendingMovies, setTrendingMovies] = useState([]);

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const endpoint = `${API_BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}`;

      const response = await fetch(endpoint);
      const data = await response.json();

      if(data.Response === 'False') {
        setErrorMessage(data.Error || 'Failed to fetch movies');
        setMovieList([]);
        return;
      }

      setMovieList(data.Search || []);

      if(query && data.Search.length > 0) {
        await updateSearchCount(query, data.Search[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  useEffect(() => {
    gsap.utils.toArray('.scroll-fade').forEach(section => {
      gsap.fromTo(section, { opacity: 0, y: 30 }, {
        opacity: 1,
        y: 0,
        duration: 1,
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
        }
      })
    })
  }, []);

  return (
    <AnimatePresence>
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="pattern" />

        <div className="wrapper">
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.img
              src="./hero.png"
              alt="Hero Banner"
              className="w-full"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6 }}
            />
            <motion.h1
              className="text-4xl font-bold mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle
            </motion.h1>

            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          </motion.header>

          {trendingMovies.length > 0 && (
            <motion.section
              className="trending scroll-fade"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl font-bold mb-4">Trending Movies</h2>

              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                {trendingMovies.map((movie, index) => (
                  <motion.li
                    key={movie.$id}
                    className="bg-white p-3 rounded-xl shadow hover:scale-105 transition relative"
                    whileHover={{ rotateY: 5 }}
                  >
                    <span className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      #{index + 1}
                    </span>
                    <img
                      src={movie.poster_url || './fallback.png'}
                      alt={movie.title}
                      className="w-full h-auto rounded"
                    />
                    <p className="mt-2 text-sm font-semibold">{movie.title}</p>
                    <p className="text-xs text-gray-500">Searches: {movie.count}</p>
                  </motion.li>
                ))}
              </ul>
            </motion.section>
          )}

          <motion.section className="all-movies scroll-fade">
            <h2>All Movies</h2>

            {isLoading ? (
              <Spinner />
            ) : errorMessage ? (
              <p className="text-red-500">{errorMessage}</p>
            ) : (
              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {movieList.map((movie) => (
                  <motion.div
                    key={movie.imdbID}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <MovieCard movie={movie} />
                  </motion.div>
                ))}
              </ul>
            )}
          </motion.section>
        </div>
      </motion.main>
    </AnimatePresence>
  )
}

export default App;
