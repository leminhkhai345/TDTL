

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate to navigate to OTP page
import axios from 'axios';  // Import axios for API calls

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSignUp, setShowSignUp] = useState(false); // State to toggle between Login and Sign Up
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // State for confirm password
  const navigate = useNavigate();  // Initialize navigate

  // Handle Login (navigate to OTP page)
  const handleLogin = (e) => {
    e.preventDefault();
    if (email && password) {
      // After successful login, navigate to OTP page
      navigate('/otp');  // Navigate to OTP page
    } else {
      alert('Please fill in both fields');
    }
  };

  // Handle Sign-Up (API call integration)
  const handleSignUp = async (e) => {
    e.preventDefault();
    
    // Basic form validation
    if (email && password  && fullName && phoneNumber) {
      // Prepare the data to be sent to the API
      const userData = {
        email,
        password,
        confirmPassword,
        fullName,
        phoneNumber
        
      };

      try {
        // API request for registration
        const response = await axios.post('http://192.168.56.1:5000/api/account/Register', userData);  // Replace with your actual API URL
          // Replace with your actual API URL
        console.log('API Response:', response.data);
        // Check if the registration was successful
        if (response.status === 200) {
          console.log('Registration successful:', response.data); // Log the response from the API
          alert('Registration successful!');
          setShowSignUp(false); // Hide the sign-up form after successful registration
        }
      } catch (error) {
        // Handle error if the registration fails
        console.error('Error during registration:', error);
        alert('Registration failed. Please try again.');

        // Reset all form fields on failure
        setEmail('');
        setPassword('');
        // setConfirmPassword('');
        setFullName('');
        setPhoneNumber('');
      }
    } else {
      alert('Please fill in all fields');
    }
  };

  return (
    <div className="bg-gray-900 text-white">
      {/* Header Section */}
      <header className="bg-black py-6">
        <div className="container mx-auto flex justify-between items-center px-6">
          <h1 className="text-3xl text-yellow-500">Book Store</h1>
          <nav>
            <ul className="flex space-x-6">
              <li><a href="/" className="hover:text-yellow-500">Home</a></li>
              <li><a href="/about" className="hover:text-yellow-500">About</a></li>
              <li><a href="/contact" className="hover:text-yellow-500">Contact</a></li>
              <li><a href="/login" className="hover:text-yellow-500">Login</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Login Form Section */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto">
          <h2 className="text-3xl text-yellow-500 mb-8 text-center">{showSignUp ? 'Sign Up' : 'Login to Your Account'}</h2>

          {/* Login Form */}
          {!showSignUp ? (
            <form onSubmit={handleLogin} className="max-w-lg mx-auto bg-gray-700 p-6 rounded-lg">
              <div className="mb-4">
                <label htmlFor="email" className="block text-white mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-2 bg-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="password" className="block text-white mb-2">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-2 bg-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-yellow-500 text-gray-800 p-3 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-2"
              >
                Login
              </button>
              <div className="signup-link text-center">
                <p>Don't have an account? <button onClick={() => setShowSignUp(true)} className="text-yellow-500 hover:underline">Sign up</button></p>
              </div>
            </form>
          ) : (
            // Sign-Up Form
            <form onSubmit={handleSignUp} className="max-w-lg mx-auto bg-gray-700 p-6 rounded-lg">
              <div className="mb-4">
                <label htmlFor="email" className="block text-white mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-2 bg-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="block text-white mb-2">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-2 bg-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              {/* <div className="mb-4">
                <label htmlFor="confirmpassword" className="block text-white mb-2">confirmpassword</label>
                <input
                  type="confirmpassword"
                  id="confirmpassword"
                  value={confirmpassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full p-2 bg-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div> */}
              <div className="mb-4">
                <label htmlFor="fullName" className="block text-white mb-2">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full p-2 bg-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="phoneNumber" className="block text-white mb-2">Phone Number</label>
                <input
                  type="text"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="w-full p-2 bg-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-yellow-500 text-gray-800 p-3 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 mb-2"
              >
                Sign Up
              </button>
              <div className="signup-link text-center">
                <p>Already have an account? <button onClick={() => setShowSignUp(false)} className="text-yellow-500 hover:underline">Login</button></p>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-black py-6">
        <div className="container mx-auto text-center text-gray-500">
          <p>&copy; 2025 Book Store. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
