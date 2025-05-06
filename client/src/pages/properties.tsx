import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PropertySearch, { SearchParams } from "@/components/property/PropertySearch";
import PropertyCard from "@/components/property/PropertyCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function Properties() {
  const [location] = useLocation();
  const [searchParams, setSearchParams] = useState<SearchParams>({});

  // Parse URL query parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    const newParams: SearchParams = {};
    
    if (urlParams.has("location")) {
      newParams.location = urlParams.get("location") || undefined;
    }
    
    if (urlParams.has("type")) {
      newParams.type = urlParams.get("type") || undefined;
    }
    
    if (urlParams.has("minPrice")) {
      const minPrice = parseInt(urlParams.get("minPrice") || "0");
      if (!isNaN(minPrice)) {
        newParams.minPrice = minPrice;
      }
    }
    
    if (urlParams.has("maxPrice")) {
      const maxPrice = parseInt(urlParams.get("maxPrice") || "0");
      if (!isNaN(maxPrice)) {
        newParams.maxPrice = maxPrice;
      }
    }
    
    setSearchParams(newParams);
  }, [location]);

  // Construct API URL with query parameters
  const createApiUrl = () => {
    const params = new URLSearchParams();
    
    if (searchParams.location) {
      params.append("location", searchParams.location);
    }
    
    if (searchParams.type) {
      params.append("type", searchParams.type);
    }
    
    if (searchParams.minPrice) {
      params.append("minPrice", searchParams.minPrice.toString());
    }
    
    if (searchParams.maxPrice) {
      params.append("maxPrice", searchParams.maxPrice.toString());
    }
    
    const queryString = params.toString();
    return `/api/properties${queryString ? `?${queryString}` : ""}`;
  };

  // Query properties
  const { data, isLoading, error } = useQuery({
    queryKey: [createApiUrl()],
  });
  
  const properties = data?.properties || [];

  // Handle search form submission
  const handleSearch = (params: SearchParams) => {
    setSearchParams(params);
  };

  // Grid of property skeleton loaders
  const PropertyCardSkeleton = () => (
    <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-16 w-full" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-6 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Browse Properties</h1>
            <PropertySearch 
              initialLocation={searchParams.location}
              initialType={searchParams.type}
              initialPriceRange={
                searchParams.minPrice !== undefined && searchParams.maxPrice !== undefined
                  ? `${searchParams.minPrice}-${searchParams.maxPrice}`
                  : searchParams.minPrice !== undefined
                  ? `${searchParams.minPrice}-`
                  : searchParams.maxPrice !== undefined
                  ? `0-${searchParams.maxPrice}`
                  : ""
              }
              onSearch={handleSearch}
            />
          </div>

          <div className="mt-8">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, index) => (
                  <PropertyCardSkeleton key={index} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-red-500">Failed to load properties. Please try again later.</p>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-500">
                  Try adjusting your search filters to find properties.
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">
                  Found {properties.length} {properties.length === 1 ? "property" : "properties"}
                </p>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {properties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      id={property.id}
                      name={property.name}
                      description={property.description}
                      location={property.location}
                      price={property.price}
                      type={property.type}
                      imageUrl={property.imageUrl || ""}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
