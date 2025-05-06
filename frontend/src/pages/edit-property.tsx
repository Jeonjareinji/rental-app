import React from 'react';
import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./../contexts/auth-context";
import Navbar from "./../components/layout/Navbar";
import Footer from "./../components/layout/Footer";
import PropertyForm, { PropertyFormValues } from "./../components/property/PropertyForm";
import { Skeleton } from "./../components/ui/skeleton";
import { Button } from "./../components/ui/button";
import { AlertCircle } from "lucide-react";

export default function EditProperty() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [propertyData, setPropertyData] = useState<PropertyFormValues | null>(null);
  
  // Check if user is a property owner
  const isOwner = user?.role === "owner";
  
  // Validate id is a number
  const propertyId = parseInt(id);
  const isValidId = !isNaN(propertyId);
  
  // Fetch property details
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/properties/${propertyId}`],
    enabled: isAuthenticated && isOwner && isValidId,
  });
  
  // When data is loaded, check if the property belongs to the current user
  useEffect(() => {
    if (data?.property) {
      const property = data.property;
      
      // Check if the current user is the owner
      if (property.ownerId !== user?.id) {
        // Not the owner, redirect
        setLocation("/my-properties");
        return;
      }
      
      // Set property data for the form
      setPropertyData({
        id: property.id,
        name: property.name,
        description: property.description,
        price: property.price,
        location: property.location,
        type: property.type,
        imageUrl: property.imageUrl || "",
      });
    }
  }, [data, user?.id, setLocation]);
  
  const handleSuccess = () => {
    // Redirect to my properties page and force a refresh to show the updated property
    window.location.href = "/my-properties";
  };
  
  // If not authenticated or not an owner, show access restricted message
  if (!isAuthenticated || !isOwner) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
              {!isAuthenticated ? (
                <p className="text-gray-600 mb-6">
                  You need to log in as a property owner to access this page.
                </p>
              ) : (
                <p className="text-gray-600 mb-6">
                  Only property owners can access this page. You are currently logged in as a tenant.
                </p>
              )}
              <Button onClick={() => setLocation("/")}>Return to Home</Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // If invalid ID, show error
  if (!isValidId) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Property ID</h1>
              <p className="text-gray-600 mb-6">
                The property ID provided is not valid.
              </p>
              <Button onClick={() => setLocation("/my-properties")}>
                Return to My Properties
              </Button>
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
            <p className="mt-2 text-gray-600">
              Update the details of your property listing.
            </p>
          </div>
          
          <div className="bg-white shadow-sm rounded-lg p-6">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-1/4" />
              </div>
            ) : error || !data?.property ? (
              <div className="text-center py-6">
                <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Property</h2>
                <p className="text-gray-600 mb-4">
                  There was an error loading the property. The property may not exist or you may not have permission to edit it.
                </p>
                <Button onClick={() => setLocation("/my-properties")}>
                  Return to My Properties
                </Button>
              </div>
            ) : propertyData ? (
              <PropertyForm
                initialData={propertyData}
                onSuccess={handleSuccess}
                isEditing={true}
              />
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-600">Loading property data...</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
