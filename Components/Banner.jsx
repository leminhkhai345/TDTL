import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

const Banner = () => {
  const bannerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        ease: "easeOut",
        staggerChildren: 0.3,
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="relative w-full h-80 bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <img
          src="https://via.placeholder.com/1920x400.png?text=Book+Background"
          alt="Banner Background"
          className="w-full h-full object-cover"
        />
      </div>
      <motion.div
        className="relative z-10 text-center text-white py-12 px-4"
        variants={bannerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          variants={childVariants}
          className="text-3xl md:text-5xl font-bold mb-4 tracking-wide"
        >
          Your Gateway to Endless Stories
        </motion.h1>
        <motion.p
          variants={childVariants}
          className="text-base md:text-lg mb-6 max-w-3xl mx-auto"
        >
          <FontAwesomeIcon icon={faBookOpen} className="mr-2 text-yellow-300" />
          Explore thousands of books, from bestsellers to rare finds, and connect with a global community of readers.
        </motion.p>
        <motion.div variants={childVariants}>
          <Link
            to="/browse"
            className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-base px-6 py-3 rounded-lg hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 ease-in-out shadow-md hover:shadow-xl transform hover:scale-105"
          >
            <FontAwesomeIcon icon={faBookOpen} className="mr-2" />
            Start Exploring
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Banner;