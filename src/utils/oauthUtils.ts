// src/utils/oauthUtils.ts
import { AuthConfig } from '@auth/core';
import fetch from 'node-fetch';

export async function getAuthConfig(baseUrl: string): Promise<AuthConfig> {
    const googleConfig = await fetch(`${baseUrl}/api/v1/apps/google`);
    const facebookConfig = await fetch(`${baseUrl}/api/v1/apps/facebook`);
    const twitterConfig = await fetch(`${baseUrl}/api/v1/apps/twitter`);

    // Construct Auth.js configuration based on fetched data
    const config: AuthConfig = {
        providers: [
            {
                id: 'google',
                name: 'Google',
                type: 'oauth',
                authorization: {
                    url: 'https://accounts.google.com/o/oauth2/auth',
                    params: {
                        response_type: 'code',
                        scope: 'openid profile email',
                        redirect_uri: `${baseUrl}/api/auth/callback/google`,
                        client_id: process.env.GOOGLE_CLIENT_ID,
                        client_secret: process.env.GOOGLE_CLIENT_SECRET,
                    },
                },
                token: 'https://oauth2.googleapis.com/token',
                userinfo: 'https://www.googleapis.com/oauth2/v3/userinfo',
                profile: (data: any) => ({
                    id: data.sub,
                    name: data.name,
                    email: data.email,
                }),
            },
            // Configure other providers similarly (Facebook, Twitter, etc.)
        ],
        callbacks: {
            async jwt({ token, account, profile }) {
                token.access_token = account?.access_token;
                token.profile = profile;
                return token;
            },
        },
        secret: process.env.JWT_SECRET || 'default_secret',
    };

    return config;
}
