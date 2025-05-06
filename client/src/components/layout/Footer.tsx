import { Link } from "wouter";
import { 
  FacebookIcon, 
  InstagramIcon, 
  TwitterIcon, 
  LinkedinIcon 
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1 lg:col-span-1">
            <span className="text-xl font-bold text-white">HomeFinder</span>
            <p className="mt-2 text-sm text-gray-300">
              Your trusted platform for finding rental properties across Indonesia.
            </p>
            {/* <div className="flex space-x-6 mt-6">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <FacebookIcon className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Instagram</span>
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <TwitterIcon className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">LinkedIn</span>
                <LinkedinIcon className="w-5 h-5" />
              </a>
            </div> */}
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">For Tenants</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link 
                  href="/properties"
                  className="text-base text-gray-300 hover:text-white"
                >
                  Search Properties
                </Link>
              </li>
              {/* <li>
                <Link 
                  href="/favorites"
                  className="text-base text-gray-300 hover:text-white"
                >
                  Favorite Properties
                </Link>
              </li> */}
              <li>
                <Link 
                  href="/messages"
                  className="text-base text-gray-300 hover:text-white"
                >
                  Messages
                </Link>
              </li>
              {/* <li>
                <Link 
                  href="/rental-tips"
                  className="text-base text-gray-300 hover:text-white"
                >
                  Rental Tips
                </Link>
              </li> */}
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">For Property Owners</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link 
                  href="/add-property"
                  className="text-base text-gray-300 hover:text-white"
                >
                  List a Property
                </Link>
              </li>
              <li>
                <Link 
                  href="/my-properties"
                  className="text-base text-gray-300 hover:text-white"
                >
                  Manage Properties
                </Link>
              </li>
              <li>
                <Link 
                  href="/messages"
                  className="text-base text-gray-300 hover:text-white"
                >
                  Manage Inquiries
                </Link>
              </li>
              {/* <li>
                <Link 
                  href="/hosting-tips"
                  className="text-base text-gray-300 hover:text-white"
                >
                  Hosting Tips
                </Link>
              </li> */}
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link 
                  href="/about"
                  className="text-base text-gray-300 hover:text-white"
                >
                  About Us
                </Link>
              </li>
              {/* <li>
                <Link 
                  href="/team"
                  className="text-base text-gray-300 hover:text-white"
                >
                  Our Team
                </Link>
              </li> */}
              {/* <li>
                <Link 
                  href="/careers"
                  className="text-base text-gray-300 hover:text-white"
                >
                  Careers
                </Link>
              </li> */}
              {/* <li>
                <Link 
                  href="/contact"
                  className="text-base text-gray-300 hover:text-white"
                >
                  Contact Support
                </Link>
              </li> */}
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} HomeFinder. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
