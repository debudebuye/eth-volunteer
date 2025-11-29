import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white py-4 px-4 md:px-8 fixed w-full top-0 z-50 shadow-lg backdrop-blur-sm bg-opacity-95">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="text-3xl transform group-hover:scale-110 transition-transform duration-300">
            🇪🇹
          </div>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
            ETH Volunteers
          </h2>
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center space-x-8">
          <li>
            <Link 
              to="/" 
              className="hover:text-orange-300 transition-colors duration-300 font-medium"
            >
              Home
            </Link>
          </li>
          <li>
            <a 
              href="#about" 
              className="hover:text-orange-300 transition-colors duration-300 font-medium"
            >
              About Us
            </a>
          </li>
          <li>
            <a 
              href="#features" 
              className="hover:text-orange-300 transition-colors duration-300 font-medium"
            >
              Features
            </a>
          </li>
          <li>
            <a 
              href="#contact" 
              className="hover:text-orange-300 transition-colors duration-300 font-medium"
            >
              Contact
            </a>
          </li>
          <li>
            <Link 
              to="/register-volunteer" 
              className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-2.5 rounded-full hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
            >
              Get Started
            </Link>
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden focus:outline-none"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pb-4 animate-slide-down">
          <ul className="flex flex-col space-y-4 px-4">
            <li>
              <Link 
                to="/" 
                className="block hover:text-orange-300 transition-colors duration-300 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <a 
                href="#about" 
                className="block hover:text-orange-300 transition-colors duration-300 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </a>
            </li>
            <li>
              <a 
                href="#features" 
                className="block hover:text-orange-300 transition-colors duration-300 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
            </li>
            <li>
              <a 
                href="#contact" 
                className="block hover:text-orange-300 transition-colors duration-300 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </a>
            </li>
            <li>
              <Link 
                to="/register-volunteer" 
                className="block bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 rounded-full hover:from-orange-600 hover:to-orange-700 transition-all duration-300 font-semibold text-center shadow-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
