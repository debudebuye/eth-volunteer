import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-blue-700 text-white py-4 px-8 fixed w-full top-0 z-50 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h2 className="text-2xl font-bold">Event Management</h2>
        <ul className="flex space-x-6">
          <li><Link to="/" className="hover:text-gray-300">Home</Link></li>
          <li><a href="#about" className="hover:text-gray-300">About Us</a></li>
          <li><a href="#features" className="hover:text-gray-300">Features</a></li>
          <li><a href="#contact" className="hover:text-gray-300">Contact Us</a></li>
          <li><Link to="/register-volunteer" className="bg-orange-500 px-4 py-2 rounded-lg hover:bg-orange-600 transition">Register</Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
