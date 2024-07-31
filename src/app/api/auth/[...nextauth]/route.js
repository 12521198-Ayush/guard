import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const refreshTokenApiCall = async (refreshToken) => {
    console.log("refreshTokenApiCall called with:", refreshToken); 
    const url = 'http://139.84.166.124:8060/user-service/user/token';
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ token: refreshToken }) 
    });

    if (res.ok) {
        const data = await res.json();
        console.log("Received data from refreshTokenApiCall:", data); 
        return {
            accessToken: data.data.accessToken,
            refreshToken: refreshToken,
            expiresIn: Date.now() + 10000
        };
    } else {
        console.error("Error in refreshTokenApiCall:", res.statusText); 
        return {
            error: "RefreshTokenError"
        };
    }
};

const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            async authorize(credentials) {
                const url = 'http://139.84.166.124:8060/user-service/user/login';
                const formData = new URLSearchParams();
                
                formData.append('email', credentials.email);
                formData.append('password', credentials.password);
                
                const res = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: formData
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.error === null) {
                        return {
                            email: credentials.email,
                            accessToken: data.data.accessToken,
                            refreshToken: data.data.refreshToken
                        };
                    }
                }
                
                console.error("Error in authorize:", res.statusText); 
                return null;
            }
        })
    ],
    
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.email = user.email; 
                token.accessToken = user.accessToken;
                token.refreshToken = user.refreshToken;
                token.expiresIn = Date.now() + 10000; 
                console.log("JWT callback - user:", user); 
            }
            
            console.log("JWT callback - token before expiry check:", token); 
            console.log("User Object:", user); 
             
            if (Date.now() < token.expiresIn) {
                return token;
            }

            console.log("Token expired, calling refreshTokenApiCall with:", token.refreshToken); 
            const newTokens = await refreshTokenApiCall(token.refreshToken);

            if (newTokens.error) {
                console.error("Error in refreshTokenApiCall:", newTokens.error); 
                return {
                    ...token,
                    error: newTokens.error
                };
            }

            return {
                ...token,
                accessToken: newTokens.accessToken,
                refreshToken: newTokens.refreshToken,
                expiresIn: newTokens.expiresIn
            };
        },

        async session({ session, token }) {
            session.accessToken = token.accessToken;
            session.refreshToken = token.refreshToken;
            session.user.email = token.email; // Add email to session user object
            
            console.log(token);
            if (session.accessToken) {
                const url = process.env.NEXT_PUBLIC_API_URL + '/users/me';
                try {
                    const userRes = await fetch(url, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token.accessToken}`
                        }
                    });

                    if (userRes.ok) {
                        const userDetails = await userRes.json();
                        session.user = {
                            ...userDetails,
                            name: `${userDetails.first_name} ${userDetails.last_name}`
                        };
                    } else {
                        // console.error("Failed to fetch user details:", await userRes.text());
                    }
                } catch (error) {
                    console.error("Error fetching user details:", error);
                }
            }
            return session;
        }
    },
    
    pages: {
        signIn: '/auth/login',
        newUser: '/auth/register'
    }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
