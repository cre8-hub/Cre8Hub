
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gray-900/95 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="ml-2 text-xl font-bold text-white">CRE8HUB</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="#features" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
                Features
              </a>
              <a href="#pricing" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
                Pricing
              </a>
              <a href="#about" className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">
                About
              </a>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/signin">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90">
                Get Started
              </Button>
            </Link>
          </div>
          
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-900/95 border-t border-white/10">
              <a href="#features" className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium">
                Features
              </a>
              <a href="#pricing" className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium">
                Pricing
              </a>
              <a href="#about" className="text-gray-300 hover:text-white block px-3 py-2 text-base font-medium">
                About
              </a>
              <div className="flex flex-col space-y-2 pt-4">
                <Link to="/signin">
                  <Button variant="ghost" className="w-full text-white hover:bg-white/10">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
