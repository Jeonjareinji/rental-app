import React from 'react';
import { useState, useEffect, FormEvent } from "react";
import { useLocation } from "wouter";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { Card, CardContent } from "../../components/ui/card";
import { MapPin, Search } from "lucide-react";

interface PropertySearchProps {
  initialLocation?: string;
  initialType?: string;
  initialPriceRange?: string;
  onSearch?: (params: SearchParams) => void;
  className?: string;
}

export interface SearchParams {
  location?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
}

export default function PropertySearch({
  initialLocation = "",
  initialType = "",
  initialPriceRange = "",
  onSearch,
  className = "",
}: PropertySearchProps) {
  const [, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useState({
    location: initialLocation,
    propertyType: initialType,
    priceRange: initialPriceRange,
  });

  useEffect(() => {
    // Update search params when props change
    setSearchParams({
      location: initialLocation,
      propertyType: initialType,
      priceRange: initialPriceRange,
    });
  }, [initialLocation, initialType, initialPriceRange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    
    const parsePriceRange = (range: string): { minPrice?: number; maxPrice?: number } => {
      if (!range || range === "any") return {};
      
      const [min, max] = range.split("-").map(val => val ? parseInt(val) : undefined);
      
      return {
        minPrice: min,
        maxPrice: max,
      };
    };
    
    const { minPrice, maxPrice } = parsePriceRange(searchParams.priceRange);
    
    const params: SearchParams = {
      location: searchParams.location || undefined,
      type: searchParams.propertyType === "all" ? undefined : searchParams.propertyType || undefined,
      minPrice,
      maxPrice,
    };
    
    if (onSearch) {
      onSearch(params);
    } else {
      // Build query parameters for URL
      const queryParams = new URLSearchParams();
      
      if (params.location) {
        queryParams.append("location", params.location);
      }
      
      if (params.type) {
        queryParams.append("type", params.type);
      }
      
      if (params.minPrice) {
        queryParams.append("minPrice", params.minPrice.toString());
      }
      
      if (params.maxPrice) {
        queryParams.append("maxPrice", params.maxPrice.toString());
      }
      
      // Navigate to properties page with filters
      const queryString = queryParams.toString();
      setLocation(`/properties${queryString ? `?${queryString}` : ""}`);
    }
  };

  return (
    <Card className={`shadow-md ${className}`}>
      <CardContent className="pt-6">
        <form className="grid gap-4 md:grid-cols-4" onSubmit={handleSearch}>
          <div className="md:col-span-4">
            <Label htmlFor="location">Location</Label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="location"
                name="location"
                placeholder="Jakarta, Bandung, Surabaya..."
                className="pl-10"
                value={searchParams.location}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="property-type">Property Type</Label>
            <Select
              value={searchParams.propertyType}
              onValueChange={(value) => handleSelectChange("propertyType", value)}
            >
              <SelectTrigger id="property-type" className="w-full">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="kost">Kost/Room</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="price-range">Price Range</Label>
            <Select
              value={searchParams.priceRange}
              onValueChange={(value) => handleSelectChange("priceRange", value)}
            >
              <SelectTrigger id="price-range" className="w-full">
                <SelectValue placeholder="Any Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Price</SelectItem>
                <SelectItem value="0-1000000">Under 1 million Rp</SelectItem>
                <SelectItem value="1000000-3000000">1 - 3 million Rp</SelectItem>
                <SelectItem value="3000000-5000000">3 - 5 million Rp</SelectItem>
                <SelectItem value="5000000-10000000">5 - 10 million Rp</SelectItem>
                <SelectItem value="10000000-">10+ million Rp</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button className="w-full" type="submit">
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
