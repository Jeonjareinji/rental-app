import React from 'react';
import { useState } from "react";
import { useAuth } from "../../contexts/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../hooks/use-toast";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Send } from "lucide-react";

interface SimpleMessageFormProps {
  receiverId: number;
  propertyId: number;
  onMessageSent?: () => void;
}

export default function SimpleMessageForm({ receiverId, propertyId, onMessageSent }: SimpleMessageFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Message cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to send messages.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSending(true);
      
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          receiverId,
          propertyId,
          content: content.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      
      setContent("");
      
      // Invalidate queries to refresh message data
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/messages/conversation/${receiverId}/${propertyId}`] 
      });
      
      if (onMessageSent) {
        onMessageSent();
      }
      
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Textarea
          placeholder="Type your message here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="resize-none min-h-24 w-full"
          disabled={isSending}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSending} className="w-full sm:w-auto">
          {isSending ? (
            "Sending..."
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" /> Send Message
            </>
          )}
        </Button>
      </div>
    </form>
  );
}