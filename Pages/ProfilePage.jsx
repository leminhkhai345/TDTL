import React from "react";

const ProfilePage = () => {
  // Giả lập thông tin người dùng
  const user = {
    name: "Test User",
    email: "testuser@example.com"
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Profile</h2>
        <p><strong>Name:</strong> {user.name}</p>
        <p className="mt-2"><strong>Email:</strong> {user.email}</p>
      </div>
    </div>
  );
};

export default ProfilePage;
