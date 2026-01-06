import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import '../LandingPage.css';

export default function LandingPage() {
    return (
        <div className="landing-container">
            <Navbar />
            <Hero />
            <Features />
            <Footer />
        </div>
    );
}
