import React from 'react';
import { useState, FormEvent } from "react";
import { useLocation } from "wouter";

export default function HeroSection() {
  const [, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useState({
    location: "",
    propertyType: "",
    priceRange: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (searchParams.location) {
      queryParams.append("location", searchParams.location);
    }
    
    if (searchParams.propertyType && searchParams.propertyType !== "all") {
      queryParams.append("type", searchParams.propertyType);
    }
    
    if (searchParams.priceRange && searchParams.priceRange !== "any") {
      queryParams.append("price", searchParams.priceRange);
    }
    
    // Navigate to properties page with filters
    const queryString = queryParams.toString();
    setLocation(`/properties${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <div className="relative">
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 lg:mt-16 lg:px-8 xl:mt-20">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Find your perfect</span>
                  <span className="block text-primary">rental property</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Browse through thousands of apartments, houses, and rooms for rent across Indonesia. Find your next home with ease.
                </p>
              </div>
            </main>
          </div>
        </div>
  
        {/* Image */}
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
            alt="Modern apartment interior"
          />
        </div>
      </div>
    </div>
  );
}
