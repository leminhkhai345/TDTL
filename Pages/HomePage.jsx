import React from "react";
import Navbar from "../Components/Navbar";
import Hero from "../Components/Hero";
import Banner from "../Components/Banner";
import BenefitsSection from "../Components/Benefits";
import Features from "../Components/Features";
import FeaturedBooks from "../Components/FeaturedBooks";
import Footer from "../Components/Footer";
import UserStatisticsPage from "./UserStatisticsPage"; // Thêm dòng này

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-100">

      {/* Hero Section */}
      <section aria-label="Hero Section" className="bg-gradient-to-r from-blue-100 via-white to-blue-100">
        <div className="max-w-6xl mx-auto px-4">
          <Hero />
        </div>
      </section>
      {/* Banner Section */}
      <section aria-label="Banner Section" className="bg-gradient-to-r from-blue-100 via-white to-blue-100">
        <div className="max-w-6xl mx-auto px-4">
          <Banner />
        </div>
      </section>
      {/* Benefits Section */}
      <section aria-label="Benefits Section" className="bg-gradient-to-r from-blue-100 via-white to-blue-100">
        <div className="max-w-6xl mx-auto px-4">
          <BenefitsSection />
        </div>
      </section>
      {/* Features Section */}
      <section aria-label="Features Section" className="bg-gradient-to-r from-blue-100 via-white to-blue-100">
        <div className="max-w-6xl mx-auto px-4">
          <Features />
        </div>
      </section>
      {/* Featured Books Section */}
      <section aria-label="Featured Books Section" className="bg-gradient-to-r from-blue-100 via-white to-blue-100">
        <div className="max-w-6xl mx-auto px-4">
          <FeaturedBooks />
        </div>
      </section>
      {/* Footer Section */}
      <section aria-label="Footer Section" className="bg-gradient-to-r from-blue-100 via-white to-blue-100">
        <Footer />
      </section>
    </div>
  );
};

export default HomePage;