export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: "Search Properties",
      description: "Browse our extensive collection of rental listings with detailed filters to find what suits your needs."
    },
    {
      number: 2,
      title: "Contact Owner",
      description: "Directly message property owners through our secure messaging system to arrange viewings or ask questions."
    },
    {
      number: 3,
      title: "Move In",
      description: "Finalize rental details directly with the property owner and move into your new home."
    }
  ];
  
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary font-semibold tracking-wide uppercase">How It Works</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Simple steps to find your next home
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Our platform makes finding and renting properties easy and hassle-free.
          </p>
        </div>

        <div className="mt-10">
          <div className="md:grid md:grid-cols-3 md:gap-8">
            {steps.map((step) => (
              <div key={step.number} className="md:col-span-1 mt-10 md:mt-0 first:mt-0">
                <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-white text-2xl font-bold">
                    {step.number}
                  </div>
                  <h3 className="mt-6 text-xl font-medium text-gray-900 text-center">{step.title}</h3>
                  <p className="mt-2 text-base text-gray-500 text-center">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
