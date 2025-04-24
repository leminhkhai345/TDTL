// src/Components/Hero.jsx
import React from "react";

const Hero = () => {
  return (
    <div className="relative w-full h-96 bg-blue-100 overflow-hidden">
  <video
    autoPlay
    loop
    muted
    className="absolute top-0 left-0 w-full h-full object-cover "
  >
    <source src="../public/video/Hero.mp4" type="video/mp4" />
  </video>
  
</div>
  );
};

export default Hero;
