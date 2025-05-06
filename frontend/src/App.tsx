import React from 'react';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "././components/ui/toaster";
import { AuthProvider } from "././contexts/auth-context";
import NotFound from "././pages/not-found";
import Home from "././pages/home";
import Properties from "././pages/properties";
import PropertyDetail from "././pages/property-detail";
import MyProperties from "././pages/my-properties";
import AddProperty from "././pages/add-property";
import EditProperty from "././pages/edit-property";
import Messages from "././pages/messages";
import Profile from "././pages/profile";
import About from "././pages/about";
import Contact from "././pages/contact";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/properties" component={Properties} />
      <Route path="/properties/:id" component={PropertyDetail} />
      <Route path="/my-properties" component={MyProperties} />
      <Route path="/add-property" component={AddProperty} />
      <Route path="/edit-property/:id" component={EditProperty} />
      <Route path="/messages" component={Messages} />
      <Route path="/profile" component={Profile} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
