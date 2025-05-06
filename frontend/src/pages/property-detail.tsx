import { useEffect } from "react";
import { useParams } from "wouter";
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import Navbar from "./../components/layout/Navbar";
import Footer from "./../components/layout/Footer";
import PropertyDetail from "./../components/property/PropertyDetail";
import { Skeleton } from "./../components/ui/skeleton";
import { useAuth } from "./../contexts/auth-context";

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  // Validate id is a number
  const propertyId = parseInt(id);
  const isValidId = !isNaN(propertyId);

  // Fetch property details
  const { data: propertyData, isLoading: isPropertyLoading, error: propertyError } = useQuery({
    queryKey: [`/api/properties/${propertyId}`],
    enabled: isValidId,
  });

  // Fetch owner details if the property exists and user is authenticated
  const { data: ownerData, isLoading: isOwnerLoading } = useQuery({
    queryKey: [`/api/users/${propertyData?.property?.ownerId}`],
    enabled: !!propertyData?.property && !!user,
  });

  const isLoading = isPropertyLoading || isOwnerLoading;
  const property = propertyData?.property;
  const owner = ownerData?.user;

  // If invalid ID, show error
  if (!isValidId) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow-sm rounded-lg overflow-hidden p-6">
              <h2 className="text-2xl font-bold text-red-500">Invalid Property ID</h2>
              <p className="mt-2 text-gray-600">The property ID provided is not valid.</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If property not found or error, show error
  if (propertyError || (propertyData && !property)) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow-sm rounded-lg overflow-hidden p-6">
              <h2 className="text-2xl font-bold text-red-500">Property Not Found</h2>
              <p className="mt-2 text-gray-600">The property you're looking for doesn't exist or has been removed.</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8">
        <PropertyDetail
          property={property}
          owner={owner}
          isLoading={isLoading}
        />
      </main>
      <Footer />
    </div>
  );
}
