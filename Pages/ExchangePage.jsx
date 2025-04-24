import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ExchangeForm from "../components/ExchangeForm";
import Navbar from "../Components/Navbar";

const ExchangePage = () => {
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
        <h1 className="text-2xl font-bold mb-6">Exchange Your Book</h1>
        <ExchangeForm />
      </div>
    </>
  );
};

export default ExchangePage;