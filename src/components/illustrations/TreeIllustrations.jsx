import React from 'react';
import { motion } from 'framer-motion';

export const SakuraTree = ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g
            initial={{ rotate: -1 }}
            animate={{ rotate: 1 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            style={{ originX: "50%", originY: "100%" }}
        >
            {/* Trunk */}
            <path d="M95 180C95 180 85 140 85 120C85 100 60 80 40 70" stroke="#8D6E63" strokeWidth="8" strokeLinecap="round" />
            <path d="M105 180C105 180 115 140 115 120C115 100 140 80 160 70" stroke="#8D6E63" strokeWidth="8" strokeLinecap="round" />
            <path d="M100 180L100 100" stroke="#8D6E63" strokeWidth="10" strokeLinecap="round" />

            {/* Crown Main */}
            <circle cx="100" cy="80" r="45" fill="#FBCFE8" fillOpacity="0.8" />
            <circle cx="70" cy="90" r="35" fill="#F9A8D4" fillOpacity="0.8" />
            <circle cx="130" cy="90" r="35" fill="#F9A8D4" fillOpacity="0.8" />
            <circle cx="100" cy="50" r="35" fill="#F472B6" fillOpacity="0.8" />

            {/* Falling Petals */}
            <circle cx="80" cy="70" r="5" fill="#FFF1F2" />
            <circle cx="110" cy="60" r="4" fill="#FFF1F2" />
            <circle cx="120" cy="100" r="5" fill="#FFF1F2" />
        </motion.g>
    </svg>
);

export const MapleTree = ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g
            initial={{ rotate: 1 }}
            animate={{ rotate: -1 }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            style={{ originX: "50%", originY: "100%" }}
        >
            {/* Trunk */}
            <path d="M100 180L100 120" stroke="#78350F" strokeWidth="10" strokeLinecap="round" />

            {/* Crown Leaves (Spiky Maple shape) */}
            <path d="M100 40 L130 70 L110 80 L140 100 L110 110 L120 140 L100 125 L80 140 L90 110 L60 100 L90 80 L70 70 Z" fill="#F97316" fillOpacity="0.9" />
            <path d="M100 50 L120 70 L105 80 L125 100 L100 105 L108 125 L100 120 L92 125 L100 105 L75 100 L95 80 L80 70 Z" fill="#FB923C" fillOpacity="0.8" />

        </motion.g>
    </svg>
);

export const GinkgoTree = ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 1.02 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            style={{ originX: "50%", originY: "100%" }}
        >
            {/* Trunk */}
            <path d="M100 180Q95 150 100 120" stroke="#713F12" strokeWidth="8" strokeLinecap="round" />

            {/* Crown (Fan shapes) */}
            <path d="M100 130 C 60 130, 40 80, 70 50 C 90 30, 110 30, 130 50 C 160 80, 140 130, 100 130 Z" fill="#FACC15" fillOpacity="0.8" />
            <path d="M100 125 C 70 125, 55 85, 80 60 C 95 45, 105 45, 120 60 C 145 85, 130 125, 100 125 Z" fill="#FEF08A" fillOpacity="0.6" />
        </motion.g>
    </svg>
);

export const CedarTree = ({ className }) => (
    <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g
            initial={{ skewX: 1 }}
            animate={{ skewX: -1 }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            style={{ originX: "50%", originY: "100%" }}
        >
            {/* Trunk */}
            <path d="M100 180L100 140" stroke="#422006" strokeWidth="10" strokeLinecap="round" />

            {/* Layers */}
            <path d="M60 150 L100 100 L140 150 Z" fill="#15803D" />
            <path d="M70 110 L100 60 L130 110 Z" fill="#166534" />
            <path d="M80 70 L100 30 L120 70 Z" fill="#14532D" />
        </motion.g>
    </svg>
);
