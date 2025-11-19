import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

// ============================================
// 🔐 AUTH CONFIGURATION
// ============================================

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
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

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.accessToken = user.accessToken;
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