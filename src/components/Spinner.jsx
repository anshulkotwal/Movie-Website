import React from 'react';

const Spinner = () => (
    <div className="flex justify-center items-center">
        {/* Main spinner container with 3D perspective */}
        <div className="relative w-16 h-16 perspective-1000">
            {/* Original spinner maintained for compatibility */}
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 absolute top-2 left-2 opacity-0"></div>
            
            {/* Outer rotating ring with gradient */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-spin"
                 style={{
                     background: 'conic-gradient(from 0deg, #4f46e5, #7c3aed, #ec4899, #4f46e5)',
                     borderRadius: '50%',
                     mask: 'radial-gradient(circle at center, transparent 60%, black 61%)',
                     WebkitMask: 'radial-gradient(circle at center, transparent 60%, black 61%)',
                     animation: 'spin 2s linear infinite'
                 }}>
            </div>
            
            {/* Middle pulsing ring */}
            <div className="absolute inset-1 rounded-full border-2 border-indigo-400 opacity-60"
                 style={{
                     animation: 'pulse 1.5s ease-in-out infinite alternate, spin 3s linear infinite reverse'
                 }}>
            </div>
            
            {/* Inner floating orbs */}
            <div className="absolute inset-0 rounded-full">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-gradient-to-br from-white to-indigo-300 rounded-full shadow-lg"
                        style={{
                            top: '50%',
                            left: '50%',
                            transformOrigin: '0 0',
                            transform: `rotate(${i * 60}deg) translateX(20px) translateY(-4px)`,
                            animation: `orbit 2s linear infinite, float ${1 + i * 0.1}s ease-in-out infinite alternate`
                        }}
                    >
                        <div className="w-full h-full bg-white rounded-full opacity-80 animate-ping"></div>
                    </div>
                ))}
            </div>
            
            {/* Central glowing core */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-gradient-to-br from-white via-indigo-200 to-indigo-600 rounded-full shadow-lg"
                     style={{
                         animation: 'glow 2s ease-in-out infinite alternate, breathe 1s ease-in-out infinite alternate'
                     }}>
                    <div className="w-full h-full bg-white rounded-full opacity-60 animate-pulse"></div>
                </div>
            </div>
            
            {/* 3D floating particles */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={`particle-${i}`}
                        className="absolute w-1 h-1 bg-indigo-400 rounded-full opacity-70"
                        style={{
                            top: '50%',
                            left: '50%',
                            transform: `rotate(${i * 45}deg) translateX(${25 + i * 2}px) translateY(-2px)`,
                            animation: `sparkle ${2 + i * 0.2}s linear infinite, twinkle ${1 + i * 0.15}s ease-in-out infinite alternate`
                        }}
                    >
                    </div>
                ))}
            </div>
            
            {/* Outer glow effect */}
            <div className="absolute inset-0 rounded-full bg-indigo-600 opacity-20 blur-md animate-pulse"></div>
            <div className="absolute inset-0 rounded-full bg-purple-500 opacity-10 blur-lg animate-pulse"
                 style={{ animation: 'pulse 2s ease-in-out infinite alternate' }}>
            </div>
        </div>
        
        {/* Loading text with typewriter effect */}
        <div className="ml-4 hidden sm:block">
            <div className="text-indigo-600 font-medium text-sm tracking-wide"
                 style={{
                     animation: 'typewriter 2s steps(10) infinite, shimmer 2s linear infinite'
                 }}>
                Loading<span className="animate-pulse">...</span>
            </div>
        </div>
        
        {/* Background ambient effect */}
        <div className="absolute inset-0 -z-10 rounded-full bg-gradient-radial from-indigo-100 via-transparent to-transparent opacity-30 animate-pulse"
             style={{ transform: 'scale(3)' }}>
        </div>
        
        {/* CSS Animations */}
        <style>{`
            @keyframes orbit {
                0% { transform: rotate(0deg) translateX(20px) translateY(-4px); }
                100% { transform: rotate(360deg) translateX(20px) translateY(-4px); }
            }
            
            @keyframes float {
                0% { transform: rotate(var(--rotation, 0deg)) translateX(20px) translateY(-4px) scale(1); }
                100% { transform: rotate(var(--rotation, 0deg)) translateX(20px) translateY(-4px) scale(1.2); }
            }
            
            @keyframes glow {
                0% { 
                    box-shadow: 0 0 5px rgba(79, 70, 229, 0.5), 0 0 10px rgba(79, 70, 229, 0.3), 0 0 15px rgba(79, 70, 229, 0.1);
                    transform: scale(1);
                }
                100% { 
                    box-shadow: 0 0 10px rgba(79, 70, 229, 0.8), 0 0 20px rgba(79, 70, 229, 0.5), 0 0 30px rgba(79, 70, 229, 0.2);
                    transform: scale(1.1);
                }
            }
            
            @keyframes breathe {
                0% { transform: scale(1); opacity: 0.8; }
                100% { transform: scale(1.05); opacity: 1; }
            }
            
            @keyframes sparkle {
                0% { 
                    transform: rotate(0deg) translateX(25px) translateY(-2px) scale(1);
                    opacity: 0.7;
                }
                50% { 
                    transform: rotate(180deg) translateX(25px) translateY(-2px) scale(1.5);
                    opacity: 1;
                }
                100% { 
                    transform: rotate(360deg) translateX(25px) translateY(-2px) scale(1);
                    opacity: 0.7;
                }
            }
            
            @keyframes twinkle {
                0% { opacity: 0.3; transform: scale(0.8); }
                100% { opacity: 1; transform: scale(1.2); }
            }
            
            @keyframes typewriter {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0.3; }
            }
            
            @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }
            
            .perspective-1000 {
                perspective: 1000px;
            }
            
            /* Mobile optimizations */
            @media (max-width: 640px) {
                .orbit-particle {
                    transform: scale(0.8);
                }
            }
            
            /* Enhanced glow effects for modern browsers */
            @supports (backdrop-filter: blur(10px)) {
                .enhanced-glow {
                    backdrop-filter: blur(2px);
                }
            }
            
            /* Reduced motion for accessibility */
            @media (prefers-reduced-motion: reduce) {
                * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            }
        `}</style>
    </div>
);

export default Spinner;
