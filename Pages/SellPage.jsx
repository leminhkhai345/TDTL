import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import SellForm from "../Components/SellForm";
import Navbar from "../Components/Navbar";

const SellPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = !!localStorage.getItem("user");
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <>

      <div className="max-w-3xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Sell Your Book</h1>
          <Link
            to="/sell-history"
            className="text-blue-600 hover:underline"
          >
            View Sell History
          </Link>
        </div>
        <SellForm />
      </div>
    </>
  );
};

export default SellPage;