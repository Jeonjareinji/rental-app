import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// Property schema for validation
const propertySchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  type: z.enum(["apartment", "house", "kost"], {
    required_error: "Please select a property type",
  }),
  imageUrl: z.string().optional(),
});

export type PropertyFormValues = z.infer<typeof propertySchema>;

interface Property extends PropertyFormValues {
  id?: number;
}

interface PropertyFormProps {
  initialData?: Property;
  onSuccess: () => void;
  isEditing?: boolean;
}

export default function PropertyForm({
  initialData,
  onSuccess,
  isEditing = false,
}: PropertyFormProps) {
  const { toast } = useToast();
  const { token, isAuthenticated, user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form with default values
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      price: 0,
      location: "",
      type: "apartment",
      imageUrl: "",
    },
  });

  const onSubmit = async (values: PropertyFormValues) => {
    // Check if user is authenticated and has the correct role
    if (!isAuthenticated) {
      toast({
        title: "Error",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      });
      return;
    }

    if (user?.role !== "owner") {
      toast({
        title: "Error",
        description: "Only property owners can create or edit properties",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (isEditing && initialData && initialData.id) {
        // Update existing property
        await apiRequest("PUT", `/api/properties/${initialData.id}`, values);
        toast({
          title: "Success",
          description: "Property updated successfully",
        });
      } else {
        // Create new property
        await apiRequest("POST", "/api/properties", values);
        toast({
          title: "Success",
          description: "Property created successfully",
        });
      }
      onSuccess();
    } catch (error) {
      console.error("Error submitting property:", error);
      
      // Handle authentication errors specifically
      if (error instanceof Error && error.message.includes("401")) {
        toast({
          title: "Authentication Error",
          description: "Your session may have expired. Please log in again.",
          variant: "destructive",
        });
      } else if (error instanceof Error && error.message.includes("403")) {
        toast({
          title: "Permission Error",
          description: "You don't have permission to perform this action.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to save property. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Skyline Apartment" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Type</FormLabel>
              <Select
                disabled={isSubmitting}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a property type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="kost">Kost/Room</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Central Jakarta" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Rent Price (Rp)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0"
                  placeholder="e.g. 3500000"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value === "" ? "0" : e.target.value;
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your property in detail..."
                  className="min-h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. https://images.unsplash.com/..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onSuccess()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Property" : "Create Property")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
