// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToMongoDB } from "@/lib/database";
import Buyer from "@/app/models/buyer";
import Seller from "@/app/models/seller";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        userType: { label: "User Type", type: "text" }, // To pass the user type
      },

      async authorize(credentials) {
        const { email, password, userType } = credentials;

        try {
          await connectToMongoDB();

          let UserModel;
          let user;

          // Determine the model to use based on userType
          if (userType === "buyer") {
            UserModel = Buyer;
          } else if (userType === "seller") {
            UserModel = Seller;
          } else {
            throw new Error("Invalid user type");
          }

          // Find the user in the appropriate collection
          user = await UserModel.findOne({ email });

          if (!user) {
            return null;
          }

          // Compare passwords
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (!passwordsMatch) {
            return null;
          }

          // Return user object with role
          return {
            ...user.toObject(),
            role: userType,
          };
        } catch (error) {
          console.log("Error: ", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role; // Add the role to the JWT token
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role; // Add the role to the session
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
