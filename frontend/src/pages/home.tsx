import React from 'react';
import HeroSection from "./../components/home/HeroSection";
import FeaturedProperties from "./../components/home/FeaturedProperties";
import PropertyTypes from "./../components/home/PropertyTypes";
import HowItWorks from "./../components/home/HowItWorks";
import CTASection from "./../components/home/CTASection";
import Navbar from "./../components/layout/Navbar";
import Footer from "./../components/layout/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <FeaturedProperties />
        <PropertyTypes />
        <HowItWorks />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
