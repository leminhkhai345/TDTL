import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Features = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.3,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: i * 0.2,
        ease: "easeOut",
      },
    }),
  };

  const features = [
    {
      title: "Affordable Prices",
      description: "Get used books at a fraction of the cost or exchange with others for free.",
      link: "/browse",
      linkText: "Shop Now",
    },
    {
      title: "Rare Finds",
      description: "Uncover limited editions and out-of-print books from our community.",
      link: "/browse",
      linkText: "Discover Now",
    },
    {
      title: "Book Lovers' Community",
      description: "Connect with readers worldwide to share stories and recommendations.",
      link: "/signup",
      linkText: "Join Now",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold text-center text-blue-800 mb-10"
        >
          What Makes Us Special?
        </motion.h2>
        <motion.div
          className="grid md:grid-cols-3 gap-8"
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={cardVariants}
              className="bg-gray-50 p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <h3 className="text-xl font-semibold text-blue-600 mb-2">{feature.title}</h3>
              <p className="text-gray-600 mb-4">{feature.description}</p>
              <Link
                to={feature.link}
                className="inline-flex items-center bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
              >
                {feature.linkText}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;