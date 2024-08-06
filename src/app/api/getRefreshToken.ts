import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET; // Ensure you have a secret defined in your environment variables

export default async (req: NextApiRequest, res: NextApiResponse) => {
    const token = await getToken({ req, secret });

    if (token) {
        res.status(200).json({ refreshToken: token.refreshToken });
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};
