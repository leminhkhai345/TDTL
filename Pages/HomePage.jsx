// src/pages/HomePage.jsx
import React from "react";

import Banner from "../Components/Banner";
import FeaturedBooks from "../Components/FeaturedBooks";
import Footer from "../Components/Footer";
import Hero from "../Components/Hero";
import Features from "../Components/Features";
import BenefitsSection from "../Components/Benifits";
const HomePage = () => {
  return (
    <div className="bg-gray-50">
        
        <Hero />
        <Banner /> {/* Phần Banner */}
        
        <BenefitsSection /> {/* Phần Benefits */}
        {/* <Features /> */}

        <FeaturedBooks /> {/* Sách nổi bật */}
        <Footer /> {/* Footer */}
    </div>
  );
};

export default HomePage;
