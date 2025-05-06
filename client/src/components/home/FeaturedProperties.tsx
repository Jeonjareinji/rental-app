import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import PropertyCard from "@/components/property/PropertyCard";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeaturedProperties() {
  // Fetch featured properties
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/properties'],
  });

  const properties = data?.properties || [];

  // Display only up to 6 properties
  const displayProperties = properties.slice(0, 6);

  // Property skeleton loader for loading state
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
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Featured Properties</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Discover top rental options
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Browse through our selection of featured properties available for rent.
          </p>
        </div>

        <div className="mt-10">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <PropertyCardSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500">Failed to load properties. Please try again later.</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No properties available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {displayProperties.map((property) => (
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
          )}
        </div>

        <div className="mt-12 text-center">
          <Link href="/properties">
            <Button size="lg" className="px-6">
              View all properties
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
