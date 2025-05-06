import React from 'react';
import { Link } from "wouter";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { MapPin } from "lucide-react";
import { formatCurrency } from "../../lib/utils";

interface PropertyCardProps {
  id: number;
  name: string;
  description: string;
  location: string;
  price: number;
  type: string;
  imageUrl: string;
}

export default function PropertyCard({
  id,
  name,
  description,
  location,
  price,
  type,
  imageUrl
}: PropertyCardProps) {
  // Function to get the appropriate badge color based on property type
  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "apartment":
        return "bg-green-100 text-green-800";
      case "house":
        return "bg-blue-100 text-blue-800";
      case "kost":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to capitalize the first letter of the property type
  const formatPropertyType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm transition-all hover:shadow-md">
      <div className="relative h-48 w-full overflow-hidden">
        <img 
          className="h-full w-full object-cover transform group-hover:scale-110 transition-transform duration-200" 
          src={imageUrl || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80"} 
          alt={name}
        />
        <div className="absolute top-0 right-0 mt-2 mr-2">
          <Badge className={getBadgeVariant(type)}>
            {formatPropertyType(type)}
          </Badge>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900">{name}</h3>
        <div className="mt-1 flex items-center text-sm text-gray-500">
          <MapPin className="mr-1 h-4 w-4 text-gray-400" />
          <span>{location}</span>
        </div>
        <p className="mt-2 text-sm text-gray-500 line-clamp-2">{description}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="font-medium text-lg text-primary">{formatCurrency(price)} / month</div>
          <Link href={`/properties/${id}`}>
            <Button variant="ghost" className="text-primary hover:bg-blue-50">
              View details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
