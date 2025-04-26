import React, { useState, useEffect } from "react";
import { useAuth } from "../src/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");
  const [profile, setProfile] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
  });
  const [sellItems, setSellItems] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setError("Please log in to view your profile.");
      setLoading(false);
      return;
    }

    const fetchProfileData = async () => {
      try {
        // Lấy thông tin người dùng
        const userResponse = await fetch(`https://680d2126c47cb8074d8fa188.mockapi.io/users/${user.id}`);
        if (!userResponse.ok) throw new Error("Failed to fetch user profile");
        const userData = await userResponse.json();
        setProfile({
          fullName: userData.fullName || "",
          phoneNumber: userData.phoneNumber || "",
          address: userData.address || "",
        });

        // Lấy bán sách
        const sellResponse = await fetch(
          `https://680d2126c47cb8074d8fa188.mockapi.io/sell?userId=${user.id}`
        );
        if (!sellResponse.ok) throw new Error("Failed to fetch sell items");
        const sellData = await sellResponse.json();
        setSellItems(sellData);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        toast.error(err.message);
      }
    };

    fetchProfileData();
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    if (!profile.fullName) newErrors.fullName = "Full name is required";
    if (profile.phoneNumber && !/^\d{10}$/.test(profile.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be 10 digits";
    }
    return newErrors;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await fetch(`https://680d2126c47cb8074d8fa188.mockapi.io/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, email: user.email }),
      });
      if (!response.ok) throw new Error("Failed to update profile");
      const updatedUser = await response.json();

      // Cập nhật AuthContext
      setUser(updatedUser);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCancelSell = async (sellId) => {
    try {
      const response = await fetch(`https://680d2126c47cb8074d8fa188.mockapi.io/sell/${sellId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Cancelled" }),
      });
      if (!response.ok) throw new Error("Failed to cancel sell item");
      setSellItems((prev) =>
        prev.map((item) => (item.id === sellId ? { ...item, status: "Cancelled" } : item))
      );
      toast.success("Sell item cancelled successfully!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 text-center">
        <p className="text-red-600">Please log in to view your profile.</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Log In
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-6">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 py-6">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

      {/* Header với avatar và thông tin cơ bản */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-semibold text-gray-600">
          {profile.fullName ? profile.fullName[0].toUpperCase() : user.email[0].toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-semibold">{profile.fullName || user.email}</h2>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-gray-600">{profile.phoneNumber || "No phone number"}</p>
          <p className="text-gray-600">{profile.address || "No address"}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <nav className="flex flex-wrap space-x-4">
          {["info", "sell"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-4 font-semibold ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              {tab === "info" && "Personal Info"}
              {tab === "sell" && "Sell History"}
            </button>
          ))}
        </nav>
      </div>

      {/* Nội dung tab */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === "info" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
              <div>
                <label className="block font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.fullName && <p className="text-red-600 text-sm">{errors.fullName}</p>}
              </div>
              <div>
                <label className="block font-medium mb-1">Phone Number</label>
                <input
                  type="text"
                  value={profile.phoneNumber}
                  onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.phoneNumber && <p className="text-red-600 text-sm">{errors.phoneNumber}</p>}
              </div>
              <div>
                <label className="block font-medium mb-1">Address</label>
                <input
                  type="text"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update Profile
              </button>
            </form>
          </div>
        )}

        {activeTab === "sell" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Sell History</h2>
            {sellItems.length === 0 ? (
              <p className="text-gray-600">No sell items found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Book Title</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Author</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Condition</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Price</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Created At</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sellItems.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="px-6 py-4 text-sm text-gray-900">{item.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{item.author}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{item.condition}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">${item.price.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              item.status === "Listed"
                                ? "bg-blue-100 text-blue-800"
                                : item.status === "Sold"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {item.status === "Listed" && (
                            <button
                              onClick={() => handleCancelSell(item.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;