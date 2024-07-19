import { AuthConfig } from "@auth/core";
import Credentials from "@auth/core/providers/credentials";
import User from "./models/User";
import jwt from "jsonwebtoken";
// Configuration for OAuth providers

const JWT_SECRET = process.env.JWT_SECRET!;

interface Credential {
    email?: string;
    password?: string;
}

const authConfig: AuthConfig = {
    providers: [
       Credentials({
        credentials: {
            email: {label: "Email", type: "text"},
            password: {label: "Password", type: "password"},
        },
        authorize: async (credentials: Credential) => {
            const { email, password } = credentials;
            try {

                if(!email || !password) {
                    return { message: "Missing email or password" };
                }
                const user = await User
                    .findOne({ email })
                    .select('+password')
                    .exec();
                if (!user) {
                    return { message: "Invalid email or password" };
                }
                const isMatch = await user.comparePassword(password);
                if (!isMatch) {
                    return { message: "Invalid email or password" };
                }
                const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
                    expiresIn: "1h"
                });
                return {
                    token,
                    user: {
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        role: user.role
                    }
                };
            } catch (error) {
                return { message: "Server error" };
                // throw error;
            }
        }
       })
    ],
    callbacks: {
        async jwt({ token, user, account, profile, isNewUser }) {
            if (user) {
                token.access_token = account?.access_token;
                token.profile = profile;
            }
            return token;
        }
    },
    secret: process.env.AUTH_SECRET!,
    pages: {
        signIn: '/auth/signin',
        signOut: '/auth/signout',
        error: '/auth/error'
    }
};

export default authConfig;

// {
//     id: "google",
//     name: "Google",
//     type: "oauth",
//     authorization: {
//         url: "https://accounts.google.com/o/oauth2/v2/auth",
//         params: {
//             response_type: "code",
//             scope: "profile email"
//         }
//     },
//     token: "https://oauth2.googleapis.com/token",
//     clientId: process.env.GOOGLE_CLIENT_ID!,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     userinfo: "https://www.googleapis.com/oauth2/v3/userinfo",
//     profile: (data: any) => ({
//         id: data.sub,
//         name: data.name,
//         email: data.email,
//         image: data.picture
//     })
// },
// {
//     id: "facebook",
//     name: "Facebook",
//     type: "oauth",
//     authorization: {
//         url: "https://www.facebook.com/v10.0/dialog/oauth",
//         params: {
//             response_type: "code",
//             scope: "email public_profile"
//         }
//     },
//     token: "https://graph.facebook.com/v10.0/oauth/access_token",
//     clientId: process.env.FACEBOOK_CLIENT_ID!,
//     clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
//     userinfo: "https://graph.facebook.com/me?fields=id,name,email,picture",
//     profile: (data: any) => ({
//         id: data.id,
//         name: data.name,
//         email: data.email,
//         image: data.picture.data.url
//     })
// },
// {
//     id: "twitter",
//     name: "Twitter",
//     type: "oauth",
//     authorization: {
//         url: "https://api.twitter.com/oauth2/authorize",
//         params: {
//             response_type: "code",
//             scope: "read"
//         }
//     },
//     token: "https://api.twitter.com/oauth2/token",
//     clientId: process.env.TWITTER_CLIENT_ID!,
//     clientSecret: process.env.TWITTER_CLIENT_SECRET!,
//     userinfo: "https://api.twitter.com/2/users/me",
//     profile: (data: any) => ({
//         id: data.data.id,
//         name: data.data.name,
//         username: data.data.username
//     })
// },