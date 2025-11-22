import NextAuth from "next-auth";
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials";
import { loginUser } from "./backend_actions/auth";


export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "Enter your email",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Enter your password",
        },
        accessToken: { label: "Access Token", type: "text" },
        userId: { label: "User ID", type: "text" },
      },
      authorize: async (credentials) => {
        if (!credentials || typeof credentials.email !== "string") {
          return null;
        }

        if (
          credentials.accessToken &&
          typeof credentials.accessToken === "string" &&
          credentials.userId &&
          typeof credentials.userId === "string"
        ) {
          return {
            id: credentials.userId,
            email: credentials.email,
            accessToken: credentials.accessToken,
          };
        }

        if (credentials.password && typeof credentials.password === "string") {
          const res = /* await loginUser(credentials.email, credentials.password); */ {
            success: true,
            data: {
              user: { _id: "12345", email: credentials.email },
              accessToken: "mocked_access_token",
            },
          }; // Mocked response for demonstration
          if (!res || !res.success) return null;

          const data = res.data;

          return {
            id: data.user._id,
            email: data.user.email,
            accessToken: data.accessToken,
          };
        }

        return null;
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {

    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        if (!profile?.email) return false;

        // Call backend login logic for Google user
        const res = await loginUser(profile.email);


        if (!res?.success) {
          console.error("❌ Google login failed for:", profile.email);
          return false; // Stop login if backend fails
        }

        // Temporarily attach backend response to account
        // (used later in jwt callback)
        account.backendData = res.data;
        console.log(" Google login succeeded for:", account);
      }

      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.accessToken = user.accessToken;
      }

      // -- Google login --
      if (account?.provider === "google" && account.backendData) {
        token.id = account.backendData.user.id;
        token.email = account.backendData.user.email;
        token.accessToken = account.backendData.token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.accessToken = token.accessToken;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
});