import { useEffect } from "react";
import Navbar from "./Navbar";

const HomePage = () => {
  useEffect(() => {
    const handleSmoothScroll = (event) => {
      if (event.target.tagName === "A" && event.target.hash) {
        event.preventDefault();
        const target = document.querySelector(event.target.hash);
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    document.addEventListener("click", handleSmoothScroll);
    return () => document.removeEventListener("click", handleSmoothScroll);
  }, []);

  return (
    <div className="pt-20"> {/* Push content below navbar */}
    <Navbar />
      {/* Hero Section */}
      <section className="bg-blue-700 text-white text-center py-24">
        <h1 className="text-4xl font-bold">Welcome to Event Management</h1>
        <p className="mt-4 text-lg">Find and participate in events that matter.</p>
        <a href="/register-volunteer" className="mt-6 inline-block bg-orange-500 px-6 py-3 text-lg rounded-lg hover:bg-orange-600 transition">
          Get Started
        </a>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-16 px-8 bg-gray-100 text-center">
        <h2 className="text-3xl font-semibold">About Us</h2>
        <p className="mt-4 text-lg text-gray-600">We help NGOs and volunteers connect to organize meaningful events efficiently.</p>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-8 text-center">
        <h2 className="text-3xl font-semibold">Features</h2>
        <ul className="mt-6 space-y-3 text-lg">
          <li>🔹 <span className="font-semibold">Event Creation & Management</span></li>
          <li>🔹 <span className="font-semibold">Volunteer Sign-up & Participation</span></li>
          <li>🔹 <span className="font-semibold">Real-time Notifications</span></li>
          <li>🔹 <span className="font-semibold">Secure Authentication & Role-Based Access</span></li>
        </ul>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="py-16 px-8 bg-gray-100 text-center">
        <h2 className="text-3xl font-semibold">Contact Us</h2>
        <p className="mt-4 text-lg text-gray-600">Email: support@eventmanagement.com</p>
        <p className="mt-2 text-lg text-gray-600">Phone: +123 456 7890</p>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center py-6">
        <p className="text-sm">© 2025 Event Management. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
