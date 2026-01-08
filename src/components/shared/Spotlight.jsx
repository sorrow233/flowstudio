import React, { useRef, useState } from 'react';

/**
 * Spotlight Component
 * Adds a modern radial gradient glow that follows the mouse cursor.
 * 
 * @param {React.ReactNode} children - The content to be spotlighted
 * @param {string} className - Additional classes for the wrapper
 * @param {string} spotColor - Color of the spotlight (default: rgba(16, 185, 129, 0.15)) -> Emerald
 * @param {number} size - Size of the spotlight in pixels (default: 400)
 */
const Spotlight = ({
    children,
    className = "",
    spotColor = "rgba(16, 185, 129, 0.15)", // Default to Emerald glow
    size = 400
}) => {
    const divRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e) => {
        if (!divRef.current) return;

        const rect = divRef.current.getBoundingClientRect();
        setPosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    const handleMouseEnter = () => {
        setOpacity(1);
    };

    const handleMouseLeave = () => {
        setOpacity(0);
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`relative overflow-hidden ${className}`}
        >
            {/* The Spotlight Overlay */}
            <div
                className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
                style={{
                    opacity,
                    background: `radial-gradient(${size}px circle at ${position.x}px ${position.y}px, ${spotColor}, transparent 40%)`
                }}
            />

            {/* Content */}
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
};

export default Spotlight;
