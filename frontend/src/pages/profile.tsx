import React from 'react';
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "./../contexts/auth-context";
import { Button } from "./../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./../components/ui/card";
import { Input } from "./../components/ui/input";
import { Label } from "./../components/ui/label";
import { useToast } from "./../hooks/use-toast";
import { apiRequest } from "./../lib/queryClient";

export default function Profile() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(true);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
  });

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Update user data in state when profile is successfully updated
  const refreshUserData = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        // Here we would ideally update the user in context
        // This would require adding a setUser function to the auth context
        // For now, we'll reload the page to show updated data
        window.location.reload();
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await apiRequest("PATCH", `/api/users/${user?.id}`, formData);

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      setIsEditing(false);
      // Refresh user data to show updated information
      await refreshUserData();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  if (!user) {
    return (
      <div className="container mx-auto mt-10 p-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Not Authorized</CardTitle>
            <CardDescription>Please log in to view your profile</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setLocation("/")}>Go to Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-10 p-4">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">User Profile</CardTitle>
          <CardDescription>Manage your account information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  defaultValue={user.username}
                  disabled
                />
                <p className="text-sm text-muted-foreground">Username cannot be changed</p>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  name="role"
                  defaultValue={user.role === "owner" ? "Property Owner" : "Tenant"}
                  disabled
                />
              </div>
            </div>

            {isEditing ? (
              <div className="flex gap-2 mt-6">
                <Button type="submit">Save Changes</Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation("/")} // Ini yang diubah
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex gap-2 mt-6">
                <Button type="button" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                <Button variant="destructive" onClick={handleLogout}>Logout</Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}