import React from "react";
import { motion } from 'framer-motion';

const Features = () => {
  // Hiệu ứng animation cho section
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
      title: "Save Money",
      description: "Buy used books at affordable prices or exchange them with others.",
    },
    {
      title: "Discover Rare Books",
      description: "Find limited editions and out-of-print titles from fellow readers.",
    },
    {
      title: "Community Driven",
      description: "Join a community of book lovers who care about reading and sharing.",
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-gray-100 to-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold text-center text-blue-800 mb-10 bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent"
        >
          Why Use Library Exchange?
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
              className="bg-white p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <h3 className="text-xl font-semibold text-blue-600 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;