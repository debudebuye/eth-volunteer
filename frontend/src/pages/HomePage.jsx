import { useEffect } from "react";
import { Link } from "react-router-dom";
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

  const features = [
    {
      icon: "📅",
      title: "Event Creation & Management",
      description: "Create and manage volunteer events with ease. Track participants and measure impact."
    },
    {
      icon: "👥",
      title: "Volunteer Sign-up & Participation",
      description: "Join events that match your interests and make a difference in your community."
    },
    {
      icon: "🔔",
      title: "Real-time Notifications",
      description: "Stay updated with instant notifications about event approvals and updates."
    },
    {
      icon: "🔒",
      title: "Secure Authentication",
      description: "Role-based access control ensures data security and proper authorization."
    }
  ];

  const stats = [
    { number: "500+", label: "Active Volunteers" },
    { number: "150+", label: "NGO Partners" },
    { number: "1000+", label: "Events Organized" },
    { number: "50+", label: "Cities Covered" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section with Gradient */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight animate-fade-in">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">ETH Volunteers</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto animate-fade-in-delay">
            Connect with NGOs and participate in meaningful events that create lasting impact in Ethiopian communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delay-2">
            <Link 
              to="/register-volunteer" 
              className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <span className="relative z-10">Get Started as Volunteer</span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link 
              to="/register-ngo" 
              className="px-8 py-4 bg-white text-blue-700 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-white hover:bg-blue-50"
            >
              Register as NGO
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center transform hover:scale-110 transition-transform duration-300"
              >
                <div className="text-4xl md:text-5xl font-bold text-blue-700 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About <span className="text-blue-700">ETH Volunteers</span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            We are a comprehensive platform connecting Ethiopian volunteers with NGOs and charitable organizations. 
            Our mission is to facilitate meaningful community engagement and create lasting social impact across Ethiopia.
          </p>
          <div className="mt-12 grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Our Mission</h3>
              <p className="text-gray-600">Empower communities through organized volunteer efforts and NGO collaboration.</p>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-yellow-50 hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl mb-4">👁️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Our Vision</h3>
              <p className="text-gray-600">A connected Ethiopia where every volunteer opportunity creates meaningful change.</p>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Our Values</h3>
              <p className="text-gray-600">Transparency, community impact, and sustainable social development.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Powerful <span className="text-blue-700">Features</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to organize, participate, and track volunteer events efficiently.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-8 bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of volunteers and NGOs creating positive change in Ethiopia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register-volunteer" 
              className="px-8 py-4 bg-white text-blue-700 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Join as Volunteer
            </Link>
            <Link 
              to="/register-ngo" 
              className="px-8 py-4 bg-orange-500 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:bg-orange-600"
            >
              Register Your NGO
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Get in <span className="text-blue-700">Touch</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Email Us</h3>
              <a href="mailto:support@ethvolunteers.org" className="text-blue-700 hover:text-blue-800 font-medium">
                support@ethvolunteers.org
              </a>
            </div>
            <div className="p-8 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl hover:shadow-lg transition-shadow duration-300">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Call Us</h3>
              <a href="tel:+251911234567" className="text-blue-700 hover:text-blue-800 font-medium">
                +251 911 234 567
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">
                ETH Volunteers
              </h3>
              <p className="text-gray-400">
                Connecting volunteers with opportunities to make a difference.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">For Volunteers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/register-volunteer" className="hover:text-white transition-colors">Register</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/events" className="hover:text-white transition-colors">Browse Events</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">For NGOs</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/register-ngo" className="hover:text-white transition-colors">Register</Link></li>
                <li><Link to="/login-ngo" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/create-event" className="hover:text-white transition-colors">Create Event</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2025 ETH Volunteers Platform. All rights reserved.</p>
            <p className="mt-2 text-sm">Made with ❤️ for the Ethiopian community</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
