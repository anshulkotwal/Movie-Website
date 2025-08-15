import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { login, loginWithGoogle, loginWithFacebook } from '../utils/AuthFunctions'; // Import OAuth functions
import { Eye, EyeOff, Mail, Lock, Film, Play, Star } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);
    const [focusedField, setFocusedField] = useState(null);
    const [rememberMe, setRememberMe] = useState(false); // State for remember me checkbox

    const { setCurrentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setMousePosition({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                });
            }
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('mousemove', handleMouseMove);
            return () => container.removeEventListener('mousemove', handleMouseMove);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const user = await login(email, password);
            setCurrentUser(user);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            // Appwrite will redirect to Google, then back to your app's root (/)
            await loginWithGoogle();
        } catch (error) {
            console.error("Google login failed to initiate:", error);
            setError("Failed to initiate Google login. Please try again.");
        }
    };

    const handleFacebookLogin = async () => {
        try {
            // Appwrite will redirect to Facebook, then back to your app's root (/)
            await loginWithFacebook();
        } catch (error) {
            console.error("Facebook login failed to initiate:", error);
            setError("Failed to initiate Facebook login. Please try again.");
        }
    };


    const floatingElements = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 6 + 4,
        delay: Math.random() * 5,
        duration: Math.random() * 10 + 15
    }));

    return (
        <div
            ref={containerRef}
            className="min-h-screen relative overflow-hidden flex items-center justify-center p-4"
            style={{
                background: `
                    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%),
                    linear-gradient(135deg, #0f0f23 0%, #1a0b2e 50%, #16213e 100%)
                `
            }}
        >
            {/* Animated mesh gradient overlay */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.15) 0%, transparent 50%)`
                }}
            />

            {/* Floating geometric elements */}
            {floatingElements.map((elem) => (
                <div
                    key={elem.id}
                    className="absolute opacity-20"
                    style={{
                        left: `${elem.x}%`,
                        top: `${elem.y}%`,
                        width: `${elem.size}px`,
                        height: `${elem.size}px`,
                        background: 'linear-gradient(45deg, #8b5cf6, #06b6d4)',
                        borderRadius: Math.random() > 0.5 ? '50%' : '20%',
                        animation: `float ${elem.duration}s ease-in-out infinite ${elem.delay}s alternate`,
                        filter: 'blur(1px)'
                    }}
                />
            ))}

            {/* Movie-themed floating icons */}
            <div className="absolute inset-0 pointer-events-none">
                {[Film, Play, Star].map((Icon, index) => (
                    <Icon
                        key={index}
                        className="absolute text-purple-400/20"
                        size={24}
                        style={{
                            left: `${20 + index * 30}%`,
                            top: `${10 + index * 20}%`,
                            animation: `pulse 3s ease-in-out infinite ${index * 0.5}s`
                        }}
                    />
                ))}
            </div>

            {/* Main login container */}
            <div className="relative z-10 w-full max-w-md">
                {/* Glassmorphism card */}
                <div
                    className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl"
                    style={{
                        boxShadow: `
                            0 8px 32px rgba(0, 0, 0, 0.12),
                            inset 0 1px 0 rgba(255, 255, 255, 0.1),
                            0 0 0 1px rgba(255, 255, 255, 0.05)
                        `
                    }}
                >
                    {/* Animated border */}
                    <div
                        className="absolute inset-0 rounded-3xl opacity-50"
                        style={{
                            background: 'linear-gradient(45deg, #8b5cf6, #06b6d4, #8b5cf6)',
                            backgroundSize: '300% 300%',
                            animation: 'gradientShift 6s ease infinite',
                            padding: '2px',
                            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                            WebkitMaskComposite: 'subtract',
                            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                            maskComposite: 'subtract'
                        }}
                    />

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl mb-4">
                            <Film className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-2">
                            Welcome Back
                        </h1>
                        <p className="text-gray-400">Sign in to discover amazing movies</p>
                    </div>

                    {/* Error message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <p className="text-red-400 text-sm text-center">{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email field */}
                        <div className="relative group">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail
                                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                                        focusedField === 'email' ? 'text-purple-400' : 'text-gray-500'
                                    }`}
                                    size={20}
                                />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                                    placeholder="Enter your email"
                                    required
                                />
                                {/* Focus indicator */}
                                <div
                                    className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-400 to-cyan-400 transition-all duration-300 ${
                                        focusedField === 'email' ? 'w-full' : 'w-0'
                                    }`}
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div className="relative group">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock
                                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                                        focusedField === 'password' ? 'text-purple-400' : 'text-gray-500'
                                    }`}
                                    size={20}
                                />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors duration-200"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                                {/* Focus indicator */}
                                <div
                                    className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-400 to-cyan-400 transition-all duration-300 ${
                                        focusedField === 'password' ? 'w-full' : 'w-0'
                                    }`}
                                />
                            </div>
                        </div>

                        {/* Remember me & Forgot password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <div className="relative w-5 h-5 bg-white/10 border border-white/20 rounded-md flex items-center justify-center transition-colors duration-200 peer-checked:bg-purple-500 peer-checked:border-purple-500">
                                    <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="ml-2 text-sm text-gray-400">Remember me</span>
                            </label>
                            <Link to="#" className="text-sm text-purple-400 hover:text-purple-300 transition-colors duration-200">
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="relative w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold rounded-xl overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25"
                        >
                            {/* Button background animation */}
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Shimmer effect */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer"
                                    style={{
                                        animation: 'shimmer 2s infinite'
                                    }}
                                />
                            </div>

                            <span className="relative flex items-center justify-center">
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                        Signing In...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </span>
                        </button>
                    </form>

                    {/* Social login */}
                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-600"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-transparent text-gray-400">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={handleGoogleLogin} // Call Google OAuth function
                                className="w-full inline-flex justify-center py-3 px-4 border border-white/10 rounded-xl bg-white/5 text-sm font-medium text-gray-300 hover:bg-white/10 transition-colors duration-200"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                <span className="ml-2">Google</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleFacebookLogin} // Call Facebook OAuth function
                                className="w-full inline-flex justify-center py-3 px-4 border border-white/10 rounded-xl bg-white/5 text-sm font-medium text-gray-300 hover:bg-white/10 transition-colors duration-200"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                                <span className="ml-2">Facebook</span>
                            </button>
                        </div>
                    </div>

                    {/* Sign up link */}
                    <p className="mt-8 text-center text-sm text-gray-400">
                        Don't have an account?{' '}
                        <Link to="/register" className="cursor-pointer font-medium text-purple-400 hover:text-purple-300 transition-colors duration-200">
                            Sign up now
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
