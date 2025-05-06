import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function PropertyTypes() {
  const propertyTypes = [
    {
      type: "apartment",
      title: "Apartments",
      description: "Modern living spaces in urban areas",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      linkTo: "/properties?type=apartment"
    },
    {
      type: "house",
      title: "Houses",
      description: "Spacious homes for families and groups",
      image: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      linkTo: "/properties?type=house"
    },
    {
      type: "kost",
      title: "Kost",
      description: "Affordable rooms for students and professionals",
      image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      linkTo: "/properties?type=kost"
    }
  ];
  
  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Property Types</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Find the perfect space for your needs
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Explore our variety of rental property types to match your lifestyle.
          </p>
        </div>

        <div className="mt-10">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {propertyTypes.map((item) => (
              <div key={item.type} className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all">
                <div className="relative h-64 w-full overflow-hidden">
                  <img 
                    className="h-full w-full object-cover transform group-hover:scale-105 transition duration-300" 
                    src={item.image} 
                    alt={`${item.title} category image`} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black opacity-60"></div>
                  <div className="absolute bottom-0 left-0 p-6">
                    <h3 className="text-2xl font-bold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm text-gray-200">{item.description}</p>
                    <div className="mt-4">
                      <Link href={item.linkTo}>
                        <Button className="bg-primary bg-opacity-80 hover:bg-opacity-100">
                          Browse {item.title}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
