"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NavbarSection from "./Navbar";
import FooterSection from "./Footer";

export default function RegisterForm({ role }) {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    username: "",
    phone: "",
    address: "",
    password: "",
    country: "Bangladesh",
    image: null,
    gender: "Male",
  });
  const [msg, setMsg] = useState("");

  const router = useRouter();

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.fullname ||
      !formData.username ||
      !formData.email ||
      !formData.phone ||
      !formData.address ||
      !formData.password
    ) {
      setMsg("All fields are necessary.");
      return;
    }

    try {
      const resUserExists = await fetch(`/api/${role}/userExists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
        }),
      });

      const { user } = await resUserExists.json();

      if (user) {
        setMsg("User already exists.");
        return;
      }

      const formDataToSend = new FormData();
      for (const key in formData) {
        formDataToSend.append(key, formData[key]);
      }

      const res = await fetch(`/api/${role}/register`, {
        method: "POST",
        body: formDataToSend,
      });

      if (res.ok) {
        setFormData({
          fullname: "",
          email: "",
          username: "",
          phone: "",
          address: "",
          password: "",
          country: "Bangladesh",
          image: null,
          gender: "Male",
        });
        setMsg("");
        router.push(`/${role}/login`);
      } else {
        setMsg("User registration failed.");
      }
    } catch (error) {
      console.error("Error during registration: ", error);
      setMsg("An error occurred during registration.");
    }
  };

  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => setMsg(""), 1500);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <NavbarSection />
      <div className="flex-grow flex items-center justify-center p-10 pb-20">
        <div className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg p-8 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          <h1 className="text-3xl font-extrabold text-gray-800 text-center mb-8">
            {role === "seller" ? "Seller Registration" : "Buyer Registration"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="w-full">
              <label className="block text-xs font-medium text-gray-800 uppercase mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="fullname"
                placeholder="Full Name"
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                value={formData.fullname}
                onChange={handleChange}
              />
            </div>

            <div className="w-full">
              <label className="block text-xs font-medium text-gray-800 uppercase mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                placeholder="Username"
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div className="w-full">
              <label className="block text-xs font-medium text-gray-800 uppercase mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="w-full">
              <label className="block text-xs font-medium text-gray-800 uppercase mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="w-full">
              <label className="block text-xs font-medium text-gray-800 uppercase mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                placeholder="Address"
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="w-full">
              <label className="block text-xs font-medium text-gray-800 uppercase mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="w-full">
              <label className="block text-xs font-medium text-gray-800 uppercase mb-1">
                Gender
              </label>
              <select
                name="gender"
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div className="w-full">
              <label className="block text-xs font-medium text-gray-800 uppercase mb-1">
                Profile Image
              </label>
              <input
                type="file"
                name="image"
                accept="image/*"
                className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-full w-full hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all transform hover:scale-105"
            >
              Register
            </button>
          </form>

          {msg && (
            <div className="bg-red-500 text-white text-sm py-2 px-4 rounded-md mt-4 text-center animate-pulse">
              {msg}
            </div>
          )}

          <p className="mt-6 text-sm text-gray-600 text-center">
            Already have an account?{" "}
            <Link
              href={`/${role}/login`}
              className="font-semibold text-purple-600 hover:text-purple-800 transition-colors"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
      <div className="h-16">
        <FooterSection />
      </div>
    </div>
  );
}
