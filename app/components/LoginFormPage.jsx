"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NavbarSection from "./Navbar";
import FooterSection from "./Footer";

export default function LoginForm({ userType }) {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await signIn("credentials", {
        usernameOrEmail,
        password,
        userType,
        redirect: false,
      });

      if (res.error) {
        setMsg("Invalid credentials. Please try again.");
        return;
      }

      router.replace(`/${userType}/dashboard`);
    } catch (error) {
      console.log("Error during login: ", error);
      setMsg("An error occurred during login.");
    }
  };

  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => setMsg(""), 1500);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  return (
    <div className="bg-cyan-50 min-h-screen flex flex-col">
      <NavbarSection />
      <div className="flex-grow flex flex-col items-center justify-center py-12 px-4">
        <h1 className="text-3xl lg:text-4xl font-bold mb-8 text-gray-600">
          {userType === "buyer" ? "Buyer Login" : "Seller Login"}
        </h1>
        <div className="bg-white shadow-lg p-8 rounded-lg w-full max-w-md border-t-4 border-green-400">
          <h2 className="text-2xl font-semibold mb-6 text-center text-gray-700">
            Login to Your Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Username or Email
              </label>
              <input
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                type="text"
                placeholder="Username or Email"
                className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={usernameOrEmail}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Password
              </label>
              <input
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={password}
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white font-bold py-3 rounded-md w-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            >
              Login
            </button>
            {msg && (
              <div className="bg-red-500 text-white text-sm py-2 px-4 rounded-md mt-4 text-center">
                {msg}
              </div>
            )}

            <p className="mt-6 text-sm text-gray-800 text-center">
              Don't have an account?{" "}
              <Link
                href={`/${userType}/register`}
                className="underline text-green-600 text-lg hover:text-green-800"
              >
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
      <div className="h-20">
        <FooterSection />
      </div>
    </div>
  );
}
