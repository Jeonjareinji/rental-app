import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./../components/ui/card";
import { Separator } from "./../components/ui/separator";

export default function About() {
  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="grid gap-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">About HomeFinder</h1>
          <p className="mt-4 text-xl text-muted-foreground">
            Your ultimate destination for finding the perfect home
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Our Story</CardTitle>
            <CardDescription>How HomeFinder began</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              HomeFinder was founded in 2023 with a simple mission: to make finding
              a home as easy and stress-free as possible. We understand that finding
              the right place to live is one of life's most important decisions,
              and we're here to help you make it with confidence.
            </p>
            <p>
              Our platform connects property owners directly with potential tenants,
              eliminating middlemen and making the process more transparent and affordable
              for everyone involved. Whether you're looking for an apartment in the heart
              of the city, a cozy boarding house near campus, or a spacious family home
              in the suburbs, HomeFinder has options for every lifestyle and budget.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                We aim to revolutionize the property rental experience by creating
                a seamless platform where finding your perfect home is just a few
                clicks away. We believe that everyone deserves access to quality
                housing options without unnecessary complications.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                We envision a future where housing search is simple, transparent,
                and stress-free. By leveraging technology, we're building a community
                where property owners and tenants can connect directly, fostering
                trust and efficiency in the rental market.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Our Values</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                HomeFinder is built on the core values of transparency, accessibility,
                and community. We believe in providing honest information, making our
                platform accessible to everyone, and fostering a supportive community
                of users who share our vision.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Why Choose HomeFinder?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div>
                <h3 className="text-lg font-semibold">Wide Selection</h3>
                <p className="text-muted-foreground">
                  Browse through thousands of properties across different types,
                  locations, and price ranges to find the one that perfectly
                  matches your requirements.
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold">Direct Communication</h3>
                <p className="text-muted-foreground">
                  Our in-app messaging system allows you to communicate directly
                  with property owners, ask questions, and negotiate terms without
                  any intermediaries.
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold">User-Friendly Interface</h3>
                <p className="text-muted-foreground">
                  Our intuitive platform makes searching for properties, contacting
                  owners, and managing your listings a breeze, saving you time and
                  frustration.
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold">Verified Listings</h3>
                <p className="text-muted-foreground">
                  We verify property listings to ensure that you get accurate
                  information and a seamless experience when finding your new home.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Our Team</CardTitle>
            <CardDescription>The people behind HomeFinder</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-6">
              HomeFinder is powered by a passionate team of real estate enthusiasts,
              technology experts, and customer service professionals who are dedicated
              to revolutionizing the way people find and rent properties.
            </p>
            <p>
              Each team member brings unique expertise and perspective to the table,
              allowing us to create a platform that truly understands and addresses
              the needs of both property owners and tenants.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}