import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

const Hero = () => {
  const overlayVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <div className="relative w-full h-[500px] bg-blue-100 overflow-hidden">
      <video
        autoPlay
        loop
        muted
        poster="/images/hero-poster.jpg"
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="../public/video/Hero.mp4" type="video/mp4" />
        <img
          src="/images/hero-fallback.jpg"
          alt="BookStore Hero"
          className="w-full h-full object-cover"
        />
      </video>
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
          Discover Your Next Great Read
        </h1>
        <p className="text-lg md:text-xl mb-6 max-w-2xl">
          Buy, sell, or exchange books with book lovers worldwide. Join our community and start your reading adventure today!
        </p>
        <Link
          to="/browse"
          className="inline-flex items-center bg-yellow-500 text-white text-lg px-8 py-3 rounded-lg hover:bg-yellow-600 transition-all duration-300 shadow-md hover:shadow-xl"
        >
          <FontAwesomeIcon icon={faBookOpen} className="mr-2" />
          Browse Books
        </Link>
      </motion.div>
    </div>
  );
};

export default Hero;