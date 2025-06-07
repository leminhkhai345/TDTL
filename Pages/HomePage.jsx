import React from "react";
import Navbar from "../Components/Navbar";
import Hero from "../Components/Hero";
import Banner from "../Components/Banner";
import BenefitsSection from "../Components/Benefits";
import Features from "../Components/Features";
import FeaturedBooks from "../Components/FeaturedBooks";
import Footer from "../Components/Footer";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar (giữ nguyên max-w-7xl từ component) */}
      

      {/* Hero Section (giữ nguyên từ component Hero) */}
      <section aria-label="Hero Section">
        <Hero />
      </section>

      {/* Banner Section (bóp 2 bên giống ProfilePage với max-w-6xl, bỏ padding top/bottom) */}
      <section aria-label="Banner Section">
        <div className="max-w-6xl mx-auto px-4">
          <Banner />
        </div>
      </section>

      {/* Benefits Section (bóp 2 bên giống ProfilePage với max-w-6xl, bỏ padding top/bottom) */}
      <section aria-label="Benefits Section">
        <div className="max-w-6xl mx-auto px-4">
          <BenefitsSection />
        </div>
      </section>

      {/* Features Section (bóp 2 bên giống ProfilePage với max-w-6xl, bỏ padding top/bottom) */}
      <section aria-label="Features Section">
        <div className="max-w-6xl mx-auto px-4">
          <Features />
        </div>
      </section>

      {/* Featured Books Section (bóp 2 bên giống ProfilePage với max-w-6xl, bỏ padding top/bottom) */}
      <section aria-label="Featured Books Section">
        <div className="max-w-6xl mx-auto px-4">
          <FeaturedBooks />
        </div>
      </section>

      {/* Footer Section (giữ nguyên max-w-7xl từ component) */}
      <section aria-label="Footer Section">
        <Footer />
      </section>
    </div>
  );
};

export default HomePage;