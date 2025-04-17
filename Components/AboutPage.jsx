import React from 'react';

const AboutPage = () => {
  return (
    <div className="bg-gray-900 text-white">
      {/* Header Section */}
      <header className="bg-black py-6">
        <div className="container mx-auto flex justify-between items-center px-6">
          <h1 className="text-3xl text-yellow-500">Book Store</h1>
          <nav>
            <ul className="flex space-x-6">
              <li><a href="/" className="hover:text-yellow-500">Home</a></li>
              <li><a href="/about" className="hover:text-yellow-500">About</a></li>
              <li><a href="/contact" className="hover:text-yellow-500">Contact</a></li>
              <li><a href="/login" className="hover:text-yellow-500">Login</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* About Page Content */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl text-yellow-500 mb-8">About Us</h2>
          <p className="text-white text-lg mb-6">
            Welcome to Book Store! We are passionate about providing our customers with a wide range of books
            across various genres. Our mission is to create an online space where book lovers can easily browse
            and find their next great read.
          </p>
          <p className="text-white text-lg mb-6">
            We believe in the power of books to enrich lives, and we are committed to offering the best service
            possible for our readers.
          </p>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-black py-6">
        <div className="container mx-auto text-center text-gray-500">
          <p>&copy; 2025 Book Store. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
