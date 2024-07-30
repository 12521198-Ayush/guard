import jwt, { JwtPayload } from "jsonwebtoken";

interface SignOption {
  expiresIn?: string | number;
}

const DEFAULT_SIGN_OPTION: SignOption = {
  expiresIn: "1h",
};

export function signJwtAccessToken(payload: JwtPayload, options: SignOption = DEFAULT_SIGN_OPTION) {
  const secretKey = process.env.SECRET_KEY;
  if (!secretKey) {
    throw new Error("SECRET_KEY is not defined in environment variables");
  }
  const token = jwt.sign(payload, secretKey, options);
  return token;
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
      throw new Error("SECRET_KEY is not defined in environment variables");
    }
    const decoded = jwt.verify(token, secretKey);
    return decoded as JwtPayload;
  } catch (error) {
    console.error(error);
    return null;
  }
}
