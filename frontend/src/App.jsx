import { useState, useEffect } from 'react';
import { User, Lock, ArrowRight, Shield } from 'lucide-react';

// We create the cat as a separate component so we can easily pass the mouse coordinates to it.
const GeometricCat = ({ mouseX, mouseY }) => {
  const screenW = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const screenH = typeof window !== 'undefined' ? window.innerHeight : 800;

  // Normalize mouse position to create a constrained movement for the pupils.
  const normalizedX = (mouseX - screenW / 2) / (screenW / 2);
  const normalizedY = (mouseY - screenH / 2) / (screenH / 2);
  const maxMove = 12;
  const pupilOffset = {
    x: normalizedX * maxMove,
    y: normalizedY * maxMove,
  };

  return (
    <div className="relative w-full max-w-[400px] aspect-square flex items-center justify-center">
      {/* Outer glow aura for the cat */}
      <div className="absolute inset-0 bg-blue-500/10 blur-[80px] rounded-full"></div>
      
      <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-[0_0_15px_rgba(45,212,191,0.3)]">
        <defs>
          <linearGradient id="eyeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" /> {/* Purple */}
            <stop offset="100%" stopColor="#2dd4bf" /> {/* Teal */}
          </linearGradient>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#2dd4bf" />
          </linearGradient>
        </defs>

        {/* Base Head Outline */}
        <polygon 
          points="200,360 80,320 40,200 60,80 120,120 200,80 280,120 340,80 360,200 320,320" 
          fill="#0a0f1a" 
          stroke="url(#lineGradient)" 
          strokeWidth="2" 
          strokeLinejoin="round"
        />

        {/* Inner Geometric Forehead/Mask */}
        <polygon points="200,120 140,160 160,200 240,200 260,160" fill="#131a2a" stroke="#2dd4bf" strokeWidth="1" opacity="0.5"/>
        <polygon points="200,120 140,160 80,140 120,120" fill="none" stroke="#2dd4bf" strokeWidth="1" opacity="0.3"/>
        <polygon points="200,120 260,160 320,140 280,120" fill="none" stroke="#2dd4bf" strokeWidth="1" opacity="0.3"/>
        <polygon points="80,140 40,200 120,220 140,160" fill="none" stroke="#2dd4bf" strokeWidth="1" opacity="0.3"/>
        <polygon points="320,140 360,200 280,220 260,160" fill="none" stroke="#2dd4bf" strokeWidth="1" opacity="0.3"/>

        {/* Muzzle/Lower Face */}
        <polygon points="200,280 140,240 80,320 200,360" fill="none" stroke="#2dd4bf" strokeWidth="1" opacity="0.4"/>
        <polygon points="200,280 260,240 320,320 200,360" fill="none" stroke="#2dd4bf" strokeWidth="1" opacity="0.4"/>
        
        {/* Whiskers */}
        <line x1="120" y1="260" x2="40" y2="250" stroke="#2dd4bf" strokeWidth="1.5" opacity="0.6"/>
        <line x1="120" y1="280" x2="50" y2="290" stroke="#2dd4bf" strokeWidth="1.5" opacity="0.6"/>
        <line x1="280" y1="260" x2="360" y2="250" stroke="#2dd4bf" strokeWidth="1.5" opacity="0.6"/>
        <line x1="280" y1="280" x2="350" y2="290" stroke="#2dd4bf" strokeWidth="1.5" opacity="0.6"/>

        {/* Nose */}
        <polygon points="190,260 210,260 200,275" fill="#2dd4bf" />
        <line x1="200" y1="275" x2="200" y2="290" stroke="#2dd4bf" strokeWidth="2" />
        <line x1="200" y1="290" x2="185" y2="300" stroke="#2dd4bf" strokeWidth="2" />
        <line x1="200" y1="290" x2="215" y2="300" stroke="#2dd4bf" strokeWidth="2" />

        {/* Security Badge / Collar Core */}
        <polygon points="200,350 170,310 230,310" fill="#0d1424" stroke="#2dd4bf" strokeWidth="1.5"/>
        <circle cx="200" cy="325" r="4" fill="#2dd4bf" className="animate-pulse" />

        {/* Left Eye */}
        <g>
          {/* Eye Socket/Background */}
          <polygon points="100,210 140,195 180,210 140,225" fill="url(#eyeGradient)" />
          {/* Pupil - Position driven by state */}
          <ellipse 
            cx={140 + pupilOffset.x} 
            cy={210 + pupilOffset.y} 
            rx="6" 
            ry="14" 
            fill="#ffffff"
            className="transition-transform duration-75 ease-out"
          />
        </g>

        {/* Right Eye */}
        <g>
          {/* Eye Socket/Background */}
          <polygon points="220,210 260,195 300,210 260,225" fill="url(#eyeGradient)" />
          {/* Pupil - Position driven by state */}
          <ellipse 
            cx={260 + pupilOffset.x} 
            cy={210 + pupilOffset.y} 
            rx="6" 
            ry="14" 
            fill="#ffffff"
            className="transition-transform duration-75 ease-out"
          />
        </g>
      </svg>
    </div>
  );
};

export default function App() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHoveringForm, setIsHoveringForm] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#050508] text-white font-sans overflow-hidden relative selection:bg-purple-500/30">
      
      {/* Custom Cursor Glow Effect */}
      <div 
        className="pointer-events-none fixed w-[400px] h-[400px] rounded-full transition-opacity duration-300 z-50 mix-blend-screen"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(45, 212, 191, 0.05) 40%, transparent 70%)',
          left: mousePos.x,
          top: mousePos.y,
          transform: 'translate(-50%, -50%)',
          opacity: isHoveringForm ? 0.3 : 1
        }}
      />

      { }
      {/* Left Panel: Graphic & Branding */}
      <div className="relative w-full lg:w-1/2 min-h-[50vh] lg:min-h-screen flex flex-col justify-center p-8 lg:p-16 xl:p-24 overflow-hidden z-10">
        
        {/* Background Gradient for Left Panel */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_#1e103c_0%,_transparent_60%)]" />
        
        <div className="relative z-10 flex flex-col h-full justify-between max-w-xl mx-auto lg:mx-0 w-full">
          {/* Header */}
          <div className="mb-12 lg:mb-0">
            <h2 className="text-[#2dd4bf] text-xs md:text-sm font-mono font-bold tracking-[0.2em] mb-4 uppercase flex items-center gap-2">
              Neural Guardian <span className="text-gray-500">//</span> Online
            </h2>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Secure access.<br />
              <span className="text-gray-300">Watched closely.</span>
            </h1>
          </div>

          {/* Interactive Graphic */}
          <div className="flex-grow flex items-center justify-center py-10">
            <GeometricCat mouseX={mousePos.x} mouseY={mousePos.y} />
          </div>
        </div>
      </div>

      { }
      {/* Right Panel: Authentication Form */}
      <div 
        className="relative w-full lg:w-1/2 min-h-[50vh] lg:min-h-screen flex items-center justify-center p-8 lg:p-16 bg-[#0a0d14] z-20 border-l border-gray-800/50"
        onMouseEnter={() => setIsHoveringForm(true)}
        onMouseLeave={() => setIsHoveringForm(false)}
      >
        <div className="w-full max-w-[420px] bg-[#0d111a]/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl border border-gray-800/60 shadow-2xl relative overflow-hidden">
          
          {/* Subtle inner top glow for the card */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>

          {/* Icon Header */}
          <div className="w-12 h-12 rounded-xl bg-gray-900/80 border border-gray-700/50 flex items-center justify-center mb-8 shadow-inner shadow-purple-500/10">
            <Shield className="w-6 h-6 text-purple-400" />
          </div>

          {/* Title Area */}
          <div className="mb-8">
            <p className="text-[#2dd4bf] text-[10px] font-bold tracking-widest uppercase mb-3">
              Authentication Portal
            </p>
            <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-gray-400 text-sm">Enter your credentials to continue.</p>
          </div>

          {/* Form Fields */}
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            
            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 block">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Enter your username"
                  className="w-full bg-[#121620] border border-gray-800 text-white placeholder-gray-500 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300 block">Password</label>
                <a href="#" className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                </div>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full bg-[#121620] border border-gray-800 text-white placeholder-gray-500 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="group relative w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-[#2dd4bf] hover:from-purple-500 hover:to-teal-400 text-white font-semibold py-3.5 px-4 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.25)] hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              <span className="relative z-10">Login</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Footer Note */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            <p className="text-xs font-mono text-gray-500">End-to-end encrypted session</p>
          </div>

        </div>
      </div>
    </div>
  );
}