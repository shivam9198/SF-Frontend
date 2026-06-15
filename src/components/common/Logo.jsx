import React from 'react';

const Logo = ({ className = "h-10 w-10" }) => (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect width="40" height="40" rx="8" className="fill-orange-600 dark:fill-orange-500" />
        {/* Rising sun indicating Sfurti (Energy/Dawn) & Varanasi Ghats */}
        <path d="M10 24C10 18.4772 14.4772 14 20 14C25.5228 14 30 18.4772 30 24H10Z" fill="white" fillOpacity="0.9" />
        <circle cx="20" cy="11" r="3.5" fill="#FFD700" />
        {/* River Waves / Ghat Steps */}
        <path d="M10 27H30" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M13 31H27" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
);

export default Logo;
