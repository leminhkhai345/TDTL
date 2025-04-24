// src/components/BenefitsSection.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoneyBillWave, faLeaf, faHandshake, faBookOpen } from "@fortawesome/free-solid-svg-icons";

const benefits = [
  {
    icon: faMoneyBillWave,
    title: "Tiết kiệm chi phí",
    description: "Mua sách với giá rẻ hơn và bán lại sách cũ để tiết kiệm.",
  },
  {
    icon: faLeaf,
    title: "Bảo vệ môi trường",
    description: "Tái sử dụng sách giúp giảm lượng rác thải và bảo vệ môi trường.",
  },
  {
    icon: faHandshake,
    title: "Trao đổi dễ dàng",
    description: "Kết nối với những người có nhu cầu trao đổi sách nhanh chóng.",
  },
  {
    icon: faBookOpen,
    title: "Kho sách phong phú",
    description: "Tìm thấy đủ loại sách học tập, kỹ năng, tiểu thuyết,...",
  },
];

const BenefitsSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-12">Lợi ích khi sử dụng BookStore</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition"
            >
              <FontAwesomeIcon icon={benefit.icon} className="text-4xl text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800">{benefit.title}</h3>
              <p className="mt-2 text-gray-600 text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
