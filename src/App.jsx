import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, Link , BrowserRouter as Router} from 'react-router-dom';
import { MoviesProvider } from './contexts/MoviesContext';

// Import AuthContext and useAuth
import { AuthProvider, useAuth } from './components/AuthContext';
// Import Auth functions
import { logout } from './utils/AuthFunctions';

// Import Components and Pages
import Spinner from './components/Spinner';
import Hero from './components/Hero';
import WatchlistPage from './pages/WatchlistPage';
import MovieDetailPage from './pages/MovieDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const AppContent = () => {
    const { currentUser, loadingAuth, setCurrentUser } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            setCurrentUser(null);
            alert("Logged out successfully!");
        } catch (error) {
            console.error("Logout failed:", error);
            alert("Failed to log out.");
        }
    };

    if (loadingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <Spinner />
            </div>
        );
    }

    return (
        <AnimatePresence>
            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
            >
                {/* Background Pattern */}
                <div 
                    className="fixed inset-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(156, 146, 172, 0.3) 1px, transparent 0)`,
                        backgroundSize: '20px 20px'
                    }}
                />

                <div className="relative z-10">
                    {/* Navigation Header */}
                    <header className="py-6 px-4 sm:px-6 lg:px-8">
                        <div className="max-w-7xl mx-auto flex justify-between items-center">
                            <Link to="/" className="text-3xl font-extrabold tracking-wide flex items-center gap-2 group">
                                <span className="bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-transparent">
                                    🎥 Movie
                                </span>
                                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:drop-shadow-[0_0_20px_rgba(99,102,241,0.8)] transition duration-300">
                                    Finder
                                </span>
                            </Link>

                            <nav className="flex items-center space-x-6">
                                {currentUser ? (
                                    <>
                                        <span className="text-gray-300 hidden sm:inline-block">
                                            Hello, {currentUser.name || currentUser.email}!
                                        </span>
                                        <Link 
                                            to="/watchlist" 
                                            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                                        >
                                            Watchlist
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link 
                                            to="/login" 
                                            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                                        >
                                            Login
                                        </Link>
                                        <Link 
                                            to="/register" 
                                            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all transform hover:scale-105"
                                        >
                                            Register
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </div>
                    </header>

                    {/* Main Content */}
                    <div className="px-4 sm:px-6 lg:px-8">
                        <Routes>
                            <Route path="/" element={<Hero />} />
                            <Route path="/watchlist" element={<WatchlistPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/movie/:imdbID" element={<MovieDetailPage />} />
                        </Routes>
                    </div>
                </div>
            </motion.main>
        </AnimatePresence>
    );
};

const App = () => (
    <AuthProvider>
        <MoviesProvider>
            <AppContent />
        </MoviesProvider>
    </AuthProvider>
);

export default App;