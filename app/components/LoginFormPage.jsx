"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm({ userType }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await signIn("credentials", {
        email,
        password,
        userType,
        redirect: false,
      });

      if (res.error) {
        setMsg("Invalid Credentials");
        return;
      }

      // Redirect to the appropriate dashboard based on userType
      router.replace(`/${userType}/dashboard`);
    } catch (error) {
      console.log("Error during login: ", error);
      setMsg("An error occurred during login.");
    }
  };

  return (
    <div className="bg-cyan-100 min-h-screen flex items-center justify-center">
      <div className="bg-white shadow-lg p-8 rounded-lg max-w-md w-full border-t-4 border-green-400">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            className="px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            value={email}
          />
          <input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            value={password}
          />
          <button
            type="submit"
            className="bg-green-600 text-white font-bold py-3 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
          >
            Login
          </button>
          {msg && (
            <div className="bg-red-500 text-white text-sm py-2 px-4 rounded-md mt-4 text-center">
              {msg}
            </div>
          )}

          <Link
            className="text-sm mt-4 block text-center text-green-600 hover:underline"
            href={`/${userType}/register`}
          >
            Don't have an account? <span className="underline">Register</span>
          </Link>
        </form>
      </div>
    </div>
  );
}
