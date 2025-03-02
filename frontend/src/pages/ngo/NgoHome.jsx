import { Link } from "react-router-dom";

const NgoHome = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ✅ Navbar */}
      <nav className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">NGO Name</h1>
          <div className="space-x-6">
            <a href="#about" className="hover:underline">About Us</a>
            <a href="#features" className="hover:underline">Features</a>
            <a href="#contact" className="hover:underline">Contact Us</a>
            <Link to="/register-ngo" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">Register</Link>
          </div>
        </div>
      </nav>

      {/* ✅ Hero Section */}
      <header className="bg-gray-100 py-20 text-center">
        <h2 className="text-4xl font-bold text-blue-600">Making a Difference in the Community</h2>
        <p className="text-lg text-gray-600 mt-4">Join us in creating a better future.</p>
      </header>

      {/* ✅ About Us */}
      <section id="about" className="container mx-auto my-16 px-6">
        <h2 className="text-3xl font-semibold text-blue-600">About Us</h2>
        <p className="mt-4 text-gray-700">
          We are a non-profit organization dedicated to supporting communities through various initiatives. Our mission is to bring positive change to society by providing education, healthcare, and community development programs.
        </p>
      </section>

      {/* ✅ Features */}
      <section id="features" className="bg-gray-100 py-16 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl font-semibold text-blue-600 text-center">Our Features</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-8">
            <div className="bg-white p-6 shadow-md rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800">Education Programs</h3>
              <p className="text-gray-600 mt-2">We provide free education and training to underprivileged children and adults.</p>
            </div>
            <div className="bg-white p-6 shadow-md rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800">Healthcare Initiatives</h3>
              <p className="text-gray-600 mt-2">We organize free medical camps and provide essential healthcare services.</p>
            </div>
            <div className="bg-white p-6 shadow-md rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800">Community Support</h3>
              <p className="text-gray-600 mt-2">We support communities with food distribution, shelter, and vocational training.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ Contact Us */}
      <section id="contact" className="container mx-auto my-16 px-6">
        <h2 className="text-3xl font-semibold text-blue-600">Contact Us</h2>
        <p className="mt-4 text-gray-700">Have questions or want to collaborate? Reach out to us!</p>
        <div className="mt-6">
          <p><strong>Email:</strong> contact@ngo.org</p>
          <p><strong>Phone:</strong> +123 456 7890</p>
          <p><strong>Address:</strong> 123 NGO Street, City, Country</p>
        </div>
      </section>

      {/* ✅ Footer */}
      <footer className="bg-blue-600 text-white py-6 mt-auto">
        <div className="container mx-auto text-center">
          <p>&copy; 2025 NGO Name. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default NgoHome;
