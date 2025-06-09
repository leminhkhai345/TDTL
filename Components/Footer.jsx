import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPhone, faMapMarkerAlt, faBookOpen } from "@fortawesome/free-solid-svg-icons";
import { faFacebookF, faInstagram, faTwitter } from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  const [email, setEmail] = useState("");
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    alert(`Subscribed with ${email}`);
    setEmail("");
  };

  return (
    <footer className="bg-gradient-to-r from-blue-700 to-blue-900 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row md:justify-between gap-8">
        {/* Logo & Mission */}
        <div className="flex-1 flex flex-col items-center md:items-start">
          <Link to="/" className="flex items-center gap-2 mb-2">
            <FontAwesomeIcon icon={faBookOpen} className="text-yellow-400 text-2xl" />
            <span className="text-xl font-bold tracking-wide">Book Exchange</span>
          </Link>
          <p className="text-gray-200 max-w-xs text-center md:text-left mb-2 text-sm">
            Discover, exchange, and give books a second life. Join our community of passionate readers!
          </p>
          <div className="flex gap-3 mt-2">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-yellow-400 transition">
              <FontAwesomeIcon icon={faFacebookF} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-yellow-400 transition">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-yellow-400 transition">
              <FontAwesomeIcon icon={faTwitter} />
            </a>
          </div>
        </div>
        {/* Quick Links */}
        <div className="flex-1 flex flex-col gap-2 items-center md:items-start">
          <h3 className="font-semibold text-lg mb-2 text-yellow-400">Quick Links</h3>
          <Link to="/about" className="hover:text-yellow-400 transition text-gray-200 text-sm">About</Link>
          <Link to="/features" className="hover:text-yellow-400 transition text-gray-200 text-sm">Features</Link>
          <Link to="/contact" className="hover:text-yellow-400 transition text-gray-200 text-sm">Contact</Link>
          <Link to="/faq" className="hover:text-yellow-400 transition text-gray-200 text-sm">FAQ</Link>
        </div>
        {/* Newsletter */}
        <div className="flex-1 flex flex-col items-center md:items-end">
          <h3 className="font-semibold text-lg mb-2 text-yellow-400">Subscribe for Updates</h3>
          <form onSubmit={handleSubscribe} className="flex w-full max-w-xs">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="rounded-l-lg px-4 py-2 text-gray-800 focus:outline-none w-full"
              required
              aria-label="Email address"
            />
            <button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-semibold px-4 py-2 rounded-r-lg transition"
              aria-label="Subscribe"
            >
              Subscribe
            </button>
          </form>
          <span className="text-xs text-gray-300 mt-2 text-right block">
            Get news, book deals, and community stories.
          </span>
          <div className="flex flex-col gap-1 mt-4 text-gray-300 text-xs">
            <span><FontAwesomeIcon icon={faEnvelope} className="text-yellow-300 mr-1" />support@bookexchange.com</span>
            <span><FontAwesomeIcon icon={faPhone} className="text-yellow-300 mr-1" />+84 123 456 789</span>
            <span><FontAwesomeIcon icon={faMapMarkerAlt} className="text-yellow-300 mr-1" />Hanoi, Vietnam</span>
          </div>
        </div>
      </div>
      <div className="border-t border-blue-800 text-center py-3 text-gray-300 text-xs bg-blue-900 bg-opacity-80">
        &copy; {new Date().getFullYear()} Book Exchange. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;