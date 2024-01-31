//Within here we setup our providers such as Google authentication

import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";

import User from "@models/user";
import { connectToDB } from "@utils/database";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  //Every Next.js route is a serverless route. Every time it gets call it needs to make a connection to databse.
  async session({ session }) {
    const sessionUser = await User.findOne({
      email: session.user.email,
    });
  },
  async singIn({ profile }) {
    try {
      await connectToDB();

      //check if a user already exists
      const userExists = await User.findOne({
        email: profile.email,
      });
      //if not, create a new user and save it to the databse
      if (!userExists) {
        await User.create({
          email: profile.email,
          username: profile.name.replace(" ", "").toLowerCase(),
          image: profile.picture,
        });
      }

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
});

export { handler as GET, handler as POST };
