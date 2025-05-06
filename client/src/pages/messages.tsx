import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { MessageList, MessageForm } from "@/components/messages/Messages";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { AlertCircle, User, ArrowLeft, Home } from "lucide-react";

interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  read: boolean;
  createdAt: string;
  sender: {
    id: number;
    fullName: string;
  };
  receiver: {
    id: number;
    fullName: string;
  };
}

export default function Messages() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [currentChat, setCurrentChat] = useState<{
    userId: number;
    propertyId: number;
    propertyName: string;
    userName: string;
  } | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showMessagesList, setShowMessagesList] = useState(true);
  
  // Reference to scroll viewport
  const scrollRef = useRef<HTMLDivElement>(null);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Update UI based on selected conversation
  useEffect(() => {
    if (currentChat && isMobileView) {
      setShowMessagesList(false);
    }
  }, [currentChat, isMobileView]);

  // Fetch conversation messages if a conversation is selected
  const { data: conversationData, isLoading: conversationLoading } = useQuery<{ messages: Message[] }>({
    queryKey: [
      `/api/messages/conversation/${currentChat?.userId}/${currentChat?.propertyId}`,
    ],
    enabled: !!currentChat && isAuthenticated,
  });

  const messages = conversationData?.messages || [];
  
  // Scroll to bottom when messages change
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    };
    
    if (messages.length > 0) {
      // Try multiple times with increasing delays to ensure scroll works
      scrollToBottom(); // immediate attempt
      setTimeout(scrollToBottom, 100); // short delay
      setTimeout(scrollToBottom, 300); // medium delay
      setTimeout(scrollToBottom, 500); // longer delay
    }
  }, [messages.length, currentChat]);

  const handleSelectConversation = (
    userId: number,
    propertyId: number,
    propertyName: string,
    userName: string
  ) => {
    setCurrentChat({
      userId,
      propertyId,
      propertyName,
      userName,
    });
  };

  const handleBackToList = () => {
    setShowMessagesList(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h1>
              <p className="text-gray-600 mb-6">
                You need to log in to access your messages.
              </p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="md:grid md:grid-cols-3 md:divide-x h-[70vh]">
              {/* Conversations List */}
              {(!isMobileView || showMessagesList) && (
                <div className="md:col-span-1 h-full">
                  <MessageList onSelectConversation={handleSelectConversation} />
                </div>
              )}

              {/* Conversation Detail */}
              {(!isMobileView || !showMessagesList) && (
                <div className="md:col-span-2 flex flex-col h-full relative overflow-hidden">
                  {!currentChat ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-500">
                      <div className="mb-4 text-gray-400">
                        <MessageBubbleIcon size={48} />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
                      <p>Select a conversation from the list to view messages</p>
                    </div>
                  ) : (
                    <>
                      {/* Conversation Header */}
                      <div className="p-4 border-b flex items-center sticky top-0 bg-white z-10">
                        {isMobileView && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleBackToList}
                            className="mr-2"
                          >
                            <ArrowLeft className="h-5 w-5" />
                          </Button>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 truncate">{currentChat.userName}</h3>
                          <div className="flex items-center text-sm text-gray-500">
                            <Home className="h-3 w-3 mr-1 flex-shrink-0" />
                            <p className="truncate">{currentChat.propertyName}</p>
                          </div>
                        </div>
                      </div>

                      {/* Messages */}
                      <div 
                        ref={scrollRef} 
                        className="flex-1 p-4 pb-20 overflow-y-auto overflow-x-hidden h-[calc(70vh-140px)] md:h-[calc(70vh-120px)]"
                      >
                        {conversationLoading ? (
                          <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[70%] ${i % 2 === 0 ? 'mr-auto' : 'ml-auto'}`}>
                                  <Skeleton className="h-12 w-64 rounded-lg" />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : messages.length === 0 ? (
                          <div className="text-center py-10 text-gray-500">
                            <p>No messages yet. Start the conversation!</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {messages.map((message: Message) => (
                              <div
                                key={message.id}
                                className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                              >
                                {message.senderId !== user?.id && (
                                  <div className="flex h-8 w-8 rounded-full bg-gray-200 mr-2 items-center justify-center flex-shrink-0">
                                    <User className="h-4 w-4 text-gray-500" />
                                  </div>
                                )}
                                <div className={`max-w-[70%] ${message.senderId === user?.id ? 'ml-auto' : 'mr-auto'}`}>
                                  <div
                                    className={`px-4 py-2 rounded-lg ${
                                      message.senderId === user?.id
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}
                                  >
                                    <p className="break-words">{message.content}</p>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {format(new Date(message.createdAt), 'MMM d, yyyy h:mm a')}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Message Form */}
                      <div className="p-4 border-t bg-white absolute bottom-0 left-0 right-0">
                        <MessageForm
                          receiverId={currentChat.userId}
                          propertyId={currentChat.propertyId}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Message bubble icon for empty state
function MessageBubbleIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}