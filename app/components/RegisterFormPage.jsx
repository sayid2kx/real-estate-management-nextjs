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
    <div className="bg-green-50 min-h-screen flex flex-col">
      <NavbarSection />
      <div className="flex-grow flex flex-col items-center justify-center py-12 px-4">
        <h1 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-600">
          {role === "buyer" ? "Buyer Registration" : "Seller Registration"}
        </h1>
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md sm:max-w-lg">
          <h2 className="text-2xl font-semibold mb-6 text-center text-gray-700">
            Create Your Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:space-x-4">
              <div className="w-full sm:w-1/2">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullname"
                  placeholder="Full Name"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.fullname}
                  onChange={handleChange}
                />
              </div>
              <div className="w-full sm:w-1/2 mt-4 sm:mt-0">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:space-x-4">
              <div className="w-full sm:w-1/2">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="w-full sm:w-1/2 mt-4 sm:mt-0">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:space-x-4">
              <div className="w-full sm:w-1/2">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              <div className="w-full sm:w-1/2 mt-4 sm:mt-0">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Country
                </label>
                <select
                  name="country"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.country}
                  onChange={handleChange}
                >
                  <option value="Bangladesh">Bangladesh</option>
                  <option value="India">India</option>
                  <option value="Pakistan">Pakistan</option>
                  <option value="Nepal">Nepal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                placeholder="Address"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Profile Image
              </label>
              <input
                type="file"
                name="image"
                accept="image/*"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white font-bold py-3 px-4 rounded-md w-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            >
              Register
            </button>
          </form>

          {msg && (
            <div className="bg-red-500 text-white text-sm py-2 px-4 rounded-md mt-4 text-center">
              {msg}
            </div>
          )}

          <p className="mt-6 text-sm text-gray-600 text-center">
            Already have an account?{" "}
            <Link
              href={`/${role}/login`}
              className="underline text-green-600 text-lg hover:text-green-800"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
      <div className="h-20">
        <FooterSection />
      </div>
    </div>
  );
}
