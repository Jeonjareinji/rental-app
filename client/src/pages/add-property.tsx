import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PropertyForm from "@/components/property/PropertyForm";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AddProperty() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  // Check if user is a property owner
  const isOwner = user?.role === "owner";
  
  const handleSuccess = () => {
    // Redirect to my properties page and force a refresh to show the new property
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
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
            <p className="mt-2 text-gray-600">
              Fill in the details below to list your property for rent.
            </p>
          </div>
          
          <div className="bg-white shadow-sm rounded-lg p-6">
            <PropertyForm onSuccess={handleSuccess} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
