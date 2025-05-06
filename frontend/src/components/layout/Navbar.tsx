import { useState } from "react";
import React from 'react';
import { Link, useLocation } from "wouter";
import { useAuth } from "../../contexts/auth-context";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import LoginModal from "../../components/auth/LoginModal";
import RegisterModal from "../../components/auth/RegisterModal";
import { useMobile } from "../../hooks/use-mobile";
import { Menu, X, Home, Search, Info, MessageCircle, LogOut, User, PlusCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function Navbar() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const isMobile = useMobile();
  const queryClient = useQueryClient();

  // Get unread messages count
  const { data: unreadData, refetch } = useQuery<{ count: number }>({
    queryKey: ['/api/messages/unread-count'],
    enabled: isAuthenticated,
    // Tambahkan polling untuk sinkronisasi
    refetchInterval: 30000, // 30 detik
    refetchOnWindowFocus: true
  });

  const unreadCount = queryClient.getQueryData<{ count: number }>(['/api/messages/unread-count'])?.count || 0;

  const handleMessagesClick = () => {
    refetch();
  };

  const navLinks = [
    { name: "Home", href: "/", icon: <Home className="w-4 h-4 mr-2" /> },
    { name: "Browse Properties", href: "/properties", icon: <Search className="w-4 h-4 mr-2" /> },
    { name: "About", href: "/about", icon: <Info className="w-4 h-4 mr-2" /> },
    // { name: "Contact", href: "/contact", icon: <MessageCircle className="w-4 h-4 mr-2" /> }
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const showLoginModal = () => {
    setLoginModalOpen(true);
    setRegisterModalOpen(false);
    setMobileMenuOpen(false);
  };

  const showRegisterModal = () => {
    setRegisterModalOpen(true);
    setLoginModalOpen(false);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and main navigation */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/">
                  <span className="text-xl font-bold text-primary cursor-pointer">HomeFinder</span>
                </Link>
              </div>

              {/* Desktop Navigation Links */}
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`${location === link.href ? 'border-primary text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Authentication buttons or user menu */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
              {!isAuthenticated ? (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={showLoginModal}
                  >
                    Log in
                  </Button>
                  <Button
                    onClick={showRegisterModal}
                  >
                    Register
                  </Button>
                </div>
              ) : (
                <div className="flex items-center">
                  {/* Add Property button for owners */}
                  {user?.role === "owner" && (
                    <Link href="/add-property">
                      <Button className="bg-secondary hover:bg-green-600 mr-2">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Property
                      </Button>
                    </Link>
                  )}

                  {/* Messages button */}
                  <Link href="/messages" onClick={handleMessagesClick}>
                    <Button variant="ghost" className="relative mr-2">
                      <MessageCircle className="h-5 w-5" />
                      {(unreadData?.count ?? 0) > 0 && ( // Perbaikan disini
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
                          {unreadData?.count}
                        </span>
                      )}
                    </Button>
                  </Link>

                  {/* User dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                        <span className="sr-only">Open user menu</span>
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <div className="flex flex-col space-y-1 p-2">
                        <p className="text-sm font-medium">{user?.fullName}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile">
                          <button className="w-full text-left">Your Profile</button>
                        </Link>
                      </DropdownMenuItem>
                      {user?.role === "owner" && (
                        <DropdownMenuItem asChild>
                          <Link href="/my-properties">
                            <button className="w-full text-left">My Properties</button>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link href="/messages">
                          <button className="w-full text-left">Messages</button>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="-mr-2 flex items-center sm:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobile && mobileMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`
                    ${location === link.href
                      ? 'bg-primary border-primary text-white'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                    } block pl-3 pr-4 py-2 border-l-4 text-base font-medium flex items-center
                  `}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Mobile Authentication options */}
            {!isAuthenticated ? (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center justify-around px-4">
                  <Button
                    variant="outline"
                    className="w-full mr-2"
                    onClick={showLoginModal}
                  >
                    Log in
                  </Button>
                  <Button
                    className="w-full"
                    onClick={showRegisterModal}
                  >
                    Register
                  </Button>
                </div>
              </div>
            ) : (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user?.fullName}</div>
                    <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Your Profile
                  </Link>
                  {user?.role === "owner" && (
                    <Link
                      href="/my-properties"
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Properties
                    </Link>
                  )}
                  <Link
                    href="/messages"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Messages
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </nav>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onRegisterClick={showRegisterModal}
      />

      <RegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onLoginClick={showLoginModal}
      />
    </>
  );
}
