import React from 'react';
import { Link } from "wouter";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../contexts/auth-context";

export default function CTASection() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="bg-primary">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          <span className="block">Ready to find your new home?</span>
          <span className="block text-blue-100">Start searching or list your property today.</span>
        </h2>
        <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          <div className="inline-flex rounded-md shadow">
            <Link href="/properties">
              <Button className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary bg-white hover:bg-blue-50">
                Search Properties
              </Button>
            </Link>
          </div>
          {isAuthenticated && user?.role === 'owner' ? (
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link href="/add-property">
                <Button className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800">
                  List Your Property
                </Button>
              </Link>
            </div>
          ) : (
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link href="/register-owner">
                <Button className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800">
                  Become a Host
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
