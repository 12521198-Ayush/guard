import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const refreshTokenApiCall = async (refreshToken) => {
    console.log("refreshTokenApiCall called with:", refreshToken);

    
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    console.log(formattedTime);


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
            session.user.email = token.email; 
        
            if (session.accessToken) {
                const url = 'http://139.84.166.124:8060/order-service/create';
                try {
                    const response = await fetch(url, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token.accessToken}`,
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            order_type: "user"
                        })
                    });
        
                    if (response.ok) {
                        const responseData = await response.json();
                        session.user = {
                            ...session.user,
                            email: responseData.data.email,
                            role: responseData.data.role,
                        };
                    } else {
                        console.error("Failed to fetch user details:", await response.text());
                    }
                } catch (error) {
                    console.error("Error fetching user details:", error);
                }
            }
        
            console.log("Session object:", session); 
            console.log("----ends here----"); 
            
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
