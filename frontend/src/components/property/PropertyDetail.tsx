import React from 'react';
import { useState } from "react";
import { useAuth } from "../../contexts/auth-context";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { formatCurrency } from "../../lib/utils";
import SimpleMessageForm from "../../components/messages/SimpleMessageForm";
import { MapPin, User, Calendar, MessageSquare, X } from "lucide-react";

interface PropertyDetailProps {
  property: {
    id: number;
    ownerId: number;
    name: string;
    description: string;
    price: number;
    location: string;
    type: string;
    imageUrl?: string;
    createdAt: string;
  };
  owner?: {
    id: number;
    fullName: string;
    email: string;
  };
  isLoading: boolean;
}

export default function PropertyDetail({ property, owner, isLoading }: PropertyDetailProps) {
  const { user, isAuthenticated } = useAuth();
  const [showMessageForm, setShowMessageForm] = useState(false);

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

  const formatPropertyType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const toggleMessageForm = () => {
    console.log("Toggling message form visibility");
    console.log("Current state:", showMessageForm); // Add this
    setShowMessageForm(!showMessageForm);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <Skeleton className="h-96 w-full" />
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-20 w-full" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-10 w-1/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden p-6">
          <h2 className="text-2xl font-bold text-red-500">Property not found</h2>
          <p className="mt-2 text-gray-600">The property you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {/* Property Image */}
          <div className="relative h-96 w-full overflow-hidden">
            <img
              className="h-full w-full object-cover"
              src={property.imageUrl || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80"}
              alt={property.name}
            />
            <div className="absolute top-4 right-4">
              <Badge className={getBadgeVariant(property.type)}>
                {formatPropertyType(property.type)}
              </Badge>
            </div>
          </div>

          {/* Property Details */}
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{property.name}</h1>
                <div className="mt-2 flex items-center text-gray-600">
                  <MapPin className="mr-1 h-5 w-5 text-gray-400" />
                  <span>{property.location}</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(property.price)} <span className="text-sm font-normal text-gray-500">/ month</span>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900">Description</h3>
              <p className="mt-2 text-gray-600 whitespace-pre-line">{property.description}</p>
            </div>

            {/* Property Owner Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Listed by</p>
                    <p className="text-lg font-semibold">{owner?.fullName || 'Property Owner'}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="mr-1 h-4 w-4" />
                  <span>Listed on {formatDate(property.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Contact Button */}
            <div className="mt-8">
              {!isAuthenticated && (
                <>
                  <Button
                    size="lg"
                    className="w-full md:w-auto"
                    disabled={true}
                  >
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Log in to contact owner
                  </Button>
                  <p className="mt-2 text-sm text-gray-500">
                    You need to be logged in to contact the property owner.
                  </p>
                </>
              )}

              {isAuthenticated && user?.id === property.ownerId && (
                <Button
                  size="lg"
                  className="w-full md:w-auto"
                  disabled={true}
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  This is your property
                </Button>
              )}

              {isAuthenticated && user?.id !== property.ownerId && (
                <>
                  <Button
                    size="lg"
                    className="w-full md:w-auto"
                    onClick={toggleMessageForm}
                  >
                    {showMessageForm ? (
                      <>
                        <X className="mr-2 h-5 w-5" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <MessageSquare className="mr-2 h-5 w-5" />
                        Contact Owner
                      </>
                    )}
                  </Button>

                  {showMessageForm && (
                    <div className="mt-4 p-4 border border-gray-200 rounded-lg">
                      <SimpleMessageForm
                        receiverId={property.ownerId}
                        propertyId={property.id}
                        onMessageSent={() => setShowMessageForm(false)}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
