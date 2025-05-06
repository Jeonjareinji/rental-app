import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PropertyCard from "@/components/property/PropertyCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PlusCircle, AlertCircle } from "lucide-react";

interface Property {
  id: number;
  name: string;
  description: string;
  price: number;
  location: string;
  type: string;
  imageUrl?: string;
}

export default function MyProperties() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deleteProperty, setDeleteProperty] = useState<Property | null>(null);

  // Check if user is a property owner
  const isOwner = user?.role === "owner";

  // Fetch user's properties
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/my-properties'],
    enabled: isAuthenticated && isOwner,
  });

  const properties = data?.properties || [];

  // Handle property deletion
  const handleDeleteProperty = async () => {
    if (!deleteProperty) return;
  
    try {
      await apiRequest("DELETE", `/api/properties/${deleteProperty.id}`, undefined);
  
      // Refetch properties
      queryClient.invalidateQueries({ queryKey: ['/api/my-properties'] });
  
      toast({
        title: "Success",
        description: "Property deleted successfully",
      });
  
      // Refresh halaman setelah sukses delete
      window.location.reload();
  
    } catch (error) {
      console.error("Error deleting property:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete property",
        variant: "destructive",
      });
    } finally {
      setDeleteProperty(null);
    }
  };  

  // Redirect if not authenticated or not an owner
  if (isAuthenticated && !isOwner) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
              <p className="text-gray-600 mb-6">
                Only property owners can access this page. You are currently logged in as a tenant.
              </p>
              <Button onClick={() => setLocation("/")}>Return to Home</Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Property card skeleton for loading state
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
      <main className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
            <Link href="/add-property">
              <Button>
                <PlusCircle className="mr-2 h-5 w-5" />
                Add Property
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, index) => (
                <PropertyCardSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Properties</h2>
              <p className="text-gray-600 mb-4">
                There was an error loading your properties. Please try again later.
              </p>
              <Button
                onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/my-properties'] })}
              >
                Retry
              </Button>
            </div>
          ) : properties.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <HomeIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No Properties Listed</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                You haven't listed any properties yet. Start by adding your first property.
              </p>
              <Link href="/add-property">
                <Button>
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Add Your First Property
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property: Property) => (
                <div key={property.id} className="relative group">
                  <PropertyCard
                    id={property.id}
                    name={property.name}
                    description={property.description}
                    location={property.location}
                    price={property.price}
                    type={property.type}
                    imageUrl={property.imageUrl || ""}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex justify-end space-x-2">
                      <Link href={`/edit-property/${property.id}`}>
                        <Button variant="secondary" size="sm">
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          setDeleteProperty(property);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteProperty} onOpenChange={() => setDeleteProperty(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the property "{deleteProperty?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProperty} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Home icon for empty state
function HomeIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );
}
