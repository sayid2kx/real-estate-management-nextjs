"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NavbarSection from "./Navbar";
import FooterSection from "./Footer";

export default function RegisterForm({ role }) {
  const [fullname, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullname || !username || !email || !phone || !address || !password) {
      setMsg("All fields are necessary.");
      return;
    }

    try {
      const resUserExists = await fetch(`/api/${role}/userExists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username }),
      });

      const { user } = await resUserExists.json();

      if (user) {
        setMsg("User already exists.");
        return;
      }

      // Register new user
      const res = await fetch(`/api/${role}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullname,
          username,
          email,
          phone,
          address,
          password,
        }),
      });

      if (res.ok) {
        setFullName("");
        setUsername("");
        setEmail("");
        setPhone("");
        setAddress("");
        setPassword("");
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
    <div className="bg-green-100 min-h-screen flex flex-col">
      <NavbarSection />
      <div className="flex-grow flex flex-col items-center justify-center py-12">
        <h1 className="text-3xl font-bold mb-6 text-green-800">
          {role === "buyer" ? "Buyer Register Page" : "Seller Register Page"}
        </h1>
        <div className="bg-white p-6 rounded-lg shadow-md max-w-sm w-full">
          <h2 className="text-xl font-bold mb-4 text-center">
            Register Your Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
                <input
                  type="text"
                  name="fullname"
                  className="mt-1 p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={fullname}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
                <input
                  type="text"
                  name="username"
                  className="mt-1 p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
                <input
                  type="email"
                  name="email"
                  className="mt-1 p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
                <input
                  type="tel"
                  name="phone"
                  className="mt-1 p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
                <input
                  type="password"
                  name="password"
                  className="mt-1 p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address
                <input
                  type="text"
                  name="address"
                  className="mt-1 p-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </label>
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white font-bold py-2 px-4 rounded-md w-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            >
              Register
            </button>
          </form>

          {msg && (
            <div className="bg-red-500 text-white text-sm py-2 px-4 rounded-md mt-4 text-center">
              {msg}
            </div>
          )}

          <p className="mt-4 text-sm text-gray-600 text-center">
            Already have an account?{" "}
            <Link
              href={`/${role}/login`}
              className="underline text-green-600 text-xl hover:text-green-800"
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
