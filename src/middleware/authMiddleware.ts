import { Request, Response, NextFunction } from "express";

export const verifyAccessToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let accessToken: string | undefined;

        // If cookie-parser middleware is used
        if (req.cookies && req.cookies.access_token) {
            accessToken = req.cookies.access_token;
        }
        // Fallback: manually parse req.headers.cookie
        else if (req.headers.cookie) {
            const cookies = req.headers.cookie.split(';').reduce((acc: any, cookieString) => {
                const [key, value] = cookieString.trim().split('=');
                acc[key] = value;
                return acc;
            }, {});

            // Assuming the cookie name is "access_token"
            accessToken = cookies['access_token'];
        }

        if (!accessToken) {
            res.status(401).json({ error: "Unauthorized: No access token provided in cookies" });
            return;
        }

        // Define your external verification API URL (ideally coming from .env)
        const verificationUrl = process.env.AUTH_SERVER_URL as string;

        // Send token to the external API for verification
        const authResponse = await fetch(verificationUrl, {
            method: "POST", // Adjust to GET if the external API expects a GET request
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        });

        if (authResponse.status === 200) {
            // Optionally, you can attach user data from the response to req.user here if needed
            // const userData = await authResponse.json();
            // (req as any).user = userData;

            next(); // Token verified, proceed to the actual route
        } else {
            res.status(403).json({ error: "Forbidden: Invalid or expired access token" });
        }
    } catch (error) {
        console.error("Authentication Middleware Error:", error);
        res.status(500).json({ error: "Internal server error during authentication" });
    }
};
