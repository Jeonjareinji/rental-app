import React from 'react';
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "../../contexts/auth-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";

// UI Components
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { ScrollArea } from "../../components/ui/scroll-area";
import { User, Home, Trash2, MoreVertical, Send } from "lucide-react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "../../components/ui/form";
import { Textarea } from "../../components/ui/textarea";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "../../components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "../../components/ui/alert-dialog";

// ======================
// Shared Types
// ======================

interface Message {
    id: number;
    content: string;
    senderId: number;
    receiverId: number;
    propertyId: number;
    read: boolean;
    createdAt: string;
    sender: {
        id: number;
        username: string;
        fullName: string;
    };
    receiver: {
        id: number;
        username: string;
        fullName: string;
    };
    property: {
        id: number;
        name: string;
    };
}

interface Conversation {
    user: {
        id: number;
        fullName: string;
    };
    property: {
        id: number;
        name: string;
    };
    lastMessage: {
        id: number;
        content: string;
        createdAt: string;
    };
    unreadCount: number;
}

// ======================
// MESSAGE FORM COMPONENT
// ======================

// Message schema for validation
const messageSchema = z.object({
    content: z.string().min(1, "Message cannot be empty"),
});

type MessageFormValues = z.infer<typeof messageSchema>;

interface MessageFormProps {
    receiverId: number;
    propertyId: number;
    onMessageSent?: () => void;
}

export function MessageForm({ receiverId, propertyId, onMessageSent }: MessageFormProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isSending, setIsSending] = useState(false);

    // Form
    const form = useForm<MessageFormValues>({
        resolver: zodResolver(messageSchema),
        defaultValues: {
            content: "",
        },
    });

    const onSubmit = async (values: MessageFormValues) => {
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

            const messageData = {
                receiverId,
                propertyId,
                content: values.content,
            };

            await apiRequest("POST", "/api/messages", messageData);

            form.reset();

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
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                <div className="flex items-end gap-2">
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormControl>
                                    <Textarea
                                        placeholder="Type your message here..."
                                        className="resize-none min-h-[60px] max-h-24"
                                        {...field}
                                        disabled={isSending}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        disabled={isSending}
                        size="icon"
                        className="flex-shrink-0 h-10 w-10"
                    >
                        {isSending ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

// ======================
// MESSAGE LIST COMPONENT
// ======================

interface MessageListProps {
    onSelectConversation: (userId: number, propertyId: number, propertyName: string, userName: string) => void;
}

export function MessageList({ onSelectConversation }: MessageListProps) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<{ userId: number; propertyId: number } | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [conversationToDelete, setConversationToDelete] = useState<{ userId: number; propertyId: number; userName: string; propertyName: string } | null>(null);

    // Delete conversation mutation
    const deleteConversationMutation = useMutation({
        mutationFn: async ({ userId, propertyId }: { userId: number; propertyId: number }) => {
            return await apiRequest('DELETE', `/api/messages/conversation/${userId}/${propertyId}`);
        },
        onSuccess: () => {
            // Remove the conversation from the list
            if (conversationToDelete) {
                const newConversations = conversations.filter(
                    c => !(c.user.id === conversationToDelete.userId && c.property.id === conversationToDelete.propertyId)
                );
                setConversations(newConversations);

                // If the deleted conversation was selected, clear the selection
                if (selectedConversation?.userId === conversationToDelete.userId &&
                    selectedConversation?.propertyId === conversationToDelete.propertyId) {
                    setSelectedConversation(null);
                    // Notify parent component
                    onSelectConversation(0, 0, '', '');
                }
            }

            // Show success message
            toast({
                title: "Conversation deleted",
                description: "The conversation has been permanently deleted.",
            });

            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['/api/messages'] });

            // Reset state
            setConversationToDelete(null);
        },
        onError: (error) => {
            console.error("Error deleting conversation:", error);
            toast({
                title: "Error",
                description: "Failed to delete the conversation. Please try again.",
                variant: "destructive",
            });
        },
    });

    // Fetch all user messages
    const { data: messagesData, isLoading, error } = useQuery<{ messages: Message[] }>({
        queryKey: ['/api/messages'],
    });

    // Organize messages into conversations
    useEffect(() => {
        if (messagesData?.messages && messagesData.messages.length > 0) {
            const messages = messagesData.messages;
            const conversationsMap = new Map<string, Conversation>();

            messages.forEach((message) => {
                // Determine the other user in the conversation
                const otherUser = message.senderId === user?.id ? message.receiver : message.sender;
                const property = message.property;

                // Create a unique key for each conversation based on the other user and property
                const conversationKey = `${otherUser.id}-${property.id}`;

                if (!conversationsMap.has(conversationKey)) {
                    conversationsMap.set(conversationKey, {
                        user: {
                            id: otherUser.id,
                            fullName: otherUser.fullName,
                        },
                        property: {
                            id: property.id,
                            name: property.name,
                        },
                        lastMessage: {
                            id: message.id,
                            content: message.content,
                            createdAt: message.createdAt,
                        },
                        unreadCount: message.receiverId === user?.id && !message.read ? 1 : 0,
                    });
                } else {
                    const existing = conversationsMap.get(conversationKey)!;

                    // Update last message if this message is newer
                    const existingDate = new Date(existing.lastMessage.createdAt);
                    const currentDate = new Date(message.createdAt);

                    if (currentDate > existingDate) {
                        existing.lastMessage = {
                            id: message.id,
                            content: message.content,
                            createdAt: message.createdAt,
                        };
                    }

                    // Update unread count
                    if (message.receiverId === user?.id && !message.read) {
                        existing.unreadCount += 1;
                    }

                    conversationsMap.set(conversationKey, existing);
                }
            });

            // Convert map to array and sort by most recent message
            const sortedConversations = Array.from(conversationsMap.values()).sort((a, b) => {
                return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
            });

            setConversations(sortedConversations);
        } else {
            setConversations([]);
        }
    }, [messagesData, user?.id]);

    const handleSelectConversation = async (conversation: Conversation) => {
        // Skip jika conversation sama
        if (selectedConversation?.userId === conversation.user.id &&
            selectedConversation?.propertyId === conversation.property.id) {
            return;
        }

        // Optimistic update langsung di UI
        const updatedConversations = conversations.map(c => {
            if (c.user.id === conversation.user.id &&
                c.property.id === conversation.property.id) {
                return { ...c, unreadCount: 0 };
            }
            return c;
        });
        setConversations(updatedConversations);

        // Update NavBar count optimistically
        queryClient.setQueryData(['/api/messages/unread-count'],
            (old: { count: number } | undefined) => ({
                count: Math.max(0, (old?.count || 0) - conversation.unreadCount)
            })
        );

        // Set selected conversation
        setSelectedConversation({
            userId: conversation.user.id,
            propertyId: conversation.property.id
        });

        // Panggil API untuk mark as read
        try {
            await apiRequest('POST', `/api/messages/mark-as-read`, {
                senderId: conversation.user.id,
                receiverId: user?.id
            });
        } catch (error) {
            // Rollback jika gagal
            queryClient.invalidateQueries({
                queryKey: ['/api/messages/unread-count'],
                exact: true
              });
            console.error("Failed to mark as read:", error);
        }

        // Trigger parent component
        onSelectConversation(
            conversation.user.id,
            conversation.property.id,
            conversation.property.name,
            conversation.user.fullName
        );
    };

    // Handle opening delete confirmation dialog
    const handleDeleteClick = (e: React.MouseEvent, conversation: Conversation) => {
        // Prevent the click from bubbling up to the parent button
        e.stopPropagation();

        // Set the conversation to delete
        setConversationToDelete({
            userId: conversation.user.id,
            propertyId: conversation.property.id,
            userName: conversation.user.fullName,
            propertyName: conversation.property.name
        });

        // Open the confirmation dialog
        setDialogOpen(true);
    };

    // Handle confirmed deletion
    const handleConfirmDelete = () => {
        if (conversationToDelete) {
            deleteConversationMutation.mutate({
                userId: conversationToDelete.userId,
                propertyId: conversationToDelete.propertyId
            });
        }

        // Close the dialog
        setDialogOpen(false);
    };

    if (isLoading) {
        return (
            <div className="border rounded-md p-4 h-full">
                <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-20" />
                </div>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start space-x-4 p-3 mb-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="border rounded-md p-4 h-full">
                <p className="text-red-500">Failed to load conversations. Please try again later.</p>
            </div>
        );
    }

    return (
        <div className="border rounded-md h-full flex flex-col">
            <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Conversations</h2>
            </div>

            {conversations.length === 0 ? (
                <div className="p-6 text-center text-gray-500 flex-1 flex flex-col items-center justify-center">
                    <div className="mb-4 text-gray-400">
                        <MessageIcon size={48} />
                    </div>
                    <p>No messages yet</p>
                    <p className="text-sm mt-2">Start a conversation by browsing properties</p>
                </div>
            ) : (
                <ScrollArea className="flex-1 h-[500px] overflow-y-auto pr-2">
                    <div className="divide-y divide-gray-100">
                        {conversations.map((conversation) => {
                            const isSelected =
                                selectedConversation?.userId === conversation.user.id &&
                                selectedConversation?.propertyId === conversation.property.id;

                            return (
                                <div
                                    key={`${conversation.user.id}-${conversation.property.id}`}
                                    className={`relative cursor-pointer transition-colors fade-in ${isSelected ? 'bg-indigo-50' : 'hover:bg-gray-50'
                                        }`}
                                    onClick={() => handleSelectConversation(conversation)}
                                >
                                    <div className="flex items-start gap-3 p-3">
                                        {/* Avatar + Unread badge */}
                                        <div className="flex-shrink-0 relative">
                                            <Avatar className="h-12 w-12 bg-indigo-100 text-indigo-600">
                                                <AvatarFallback>
                                                    <User className="h-5 w-5" />
                                                </AvatarFallback>
                                            </Avatar>
                                            {conversation.unreadCount > 0 && (
                                                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                    {conversation.unreadCount}
                                                </div>
                                            )}
                                        </div>

                                        {/* Message Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline">
                                                <p className="font-medium text-gray-900 truncate max-w-[60%]">
                                                    {conversation.user.fullName}
                                                </p>
                                            </div>

                                            <div className="flex items-center text-sm text-gray-600 mt-1">
                                                <Home className="h-3 w-3 mr-1 flex-shrink-0" />
                                                <span className="truncate max-w-[180px]">{conversation.property.name}</span>
                                            </div>

                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                {conversation.lastMessage.content}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Dropdown Menu */}
                                    <div className="absolute top-3 right-3 z-10">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 rounded-full hover:bg-gray-200"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreVertical className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    className="text-red-600 cursor-pointer flex items-center"
                                                    onClick={(e) => handleDeleteClick(e, conversation)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete Conversation
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>

            )}

            {/* Confirmation Dialog */}
            <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete your conversation with {conversationToDelete?.userName}
                            about {conversationToDelete?.propertyName}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={handleConfirmDelete}
                            disabled={deleteConversationMutation.isPending}
                        >
                            {deleteConversationMutation.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// ======================
// UTILITIES
// ======================

// Message icon for empty state
function MessageIcon({ size = 24 }: { size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
    );
}