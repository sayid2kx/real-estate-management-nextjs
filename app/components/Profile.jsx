"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";

const Profile = () => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (session?.user) {
      const fetchUserData = async () => {
        try {
          const encodedEmail = encodeURIComponent(session.user.email);
          const res = await fetch(
            `/api/${session.user.role}/profile/${encodedEmail}`
          );
          if (res.ok) {
            const data = await res.json();
            setUser(data);
          } else {
            console.error("Error fetching user data", res.status);
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      };

      fetchUserData();
    }
  }, [session]);

  if (status === "loading") {
    return <p className="text-center mt-4 text-lg text-gray-600">Loading...</p>;
  }

  if (!user) {
    return (
      <p className="text-center mt-4 text-lg text-gray-600">
        No user data found
      </p>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-r from-blue-50 to-white border-4 border-cyan-300 rounded-lg shadow-xl mt-8 mb-8">
      <div className="flex flex-col sm:flex-row items-center sm:items-start">
        {user.image && (
          <Image
            src={user.image}
            alt={`${user.fullname}'s profile picture`}
            width={180}
            height={180}
            className="rounded-full mb-4 sm:mb-0 sm:mr-8 border-4 border-blue-600 shadow-lg"
          />
        )}
        <div className="text-center sm:text-left">
          <h2 className="text-3xl font-semibold mb-3 text-gray-800">
            {user.fullname}
          </h2>
          <p className="text-gray-600 text-lg">{user.email}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
        <div className="space-y-3">
          <p className="text-gray-700 text-lg">
            <strong className="font-semibold">Username:</strong> {user.username}
          </p>
          <p className="text-gray-700 text-lg">
            <strong className="font-semibold">Phone:</strong> {user.phone}
          </p>
          <p className="text-gray-700 text-lg">
            <strong className="font-semibold">Address:</strong> {user.address}
          </p>
          <p className="text-gray-700 text-lg">
            <strong className="font-semibold">Gender:</strong> {user.gender}
          </p>
        </div>
        <div className="space-y-3">
          <p className="text-gray-700 text-lg">
            <strong className="font-semibold">Country:</strong> {user.country}
          </p>
          <p className="text-gray-700 text-lg">
            <strong className="font-semibold">Joined:</strong>{" "}
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
