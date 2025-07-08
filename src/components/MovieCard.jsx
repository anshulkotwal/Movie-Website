import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import VanillaTilt from 'vanilla-tilt';
import { motion } from 'framer-motion';

const MovieCard = ({ movie }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    VanillaTilt.init(cardRef.current, {
      max: 15,
      speed: 400,
      glare: true,
      "max-glare": 0.3,
    });
  }, []);

  return (
    <motion.li
      ref={cardRef}
      className="bg-white p-4 rounded-xl shadow flex flex-col items-center text-center cursor-pointer"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ scale: 1.05 }}
    >
      <Link to={`/movie/${movie.imdbID}`}>
        <img
          src={movie.Poster !== 'N/A' ? movie.Poster : './fallback.png'}
          alt={movie.Title}
          className="w-full h-auto rounded mb-3 transition-transform duration-300"
        />
        <h3 className="text-md font-semibold">{movie.Title}</h3>
        <p className="text-sm text-gray-500">{movie.Year}</p>
      </Link>
    </motion.li>
  );
};

export default MovieCard;
