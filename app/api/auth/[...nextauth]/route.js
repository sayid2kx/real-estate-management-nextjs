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
        usernameOrEmail: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
        userType: { label: "User Type", type: "text" },
      },

      async authorize(credentials) {
        const { usernameOrEmail, password, userType } = credentials;

        try {
          await connectToMongoDB();

          let UserModel;
          let user;

          if (userType === "buyer") {
            UserModel = Buyer;
          } else if (userType === "seller") {
            UserModel = Seller;
          } else {
            throw new Error("Invalid user type");
          }

          user = await UserModel.findOne({
            $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
          });

          if (!user) {
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (!passwordsMatch) {
            return null;
          }

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
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
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
