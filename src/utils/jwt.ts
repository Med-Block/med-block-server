import jwt from 'jsonwebtoken';
import { AuthUser } from '../models/entities/auth.user';

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRATION = process.env.JWT_EXPIRATION ?? "1d";
if(!JWT_SECRET){
    throw new Error("JWT_SECRET is not provided");
}

export const sign = (payload: AuthUser) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
}

export const verify = (token: string): AuthUser => {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
}

export const decode = (token: string) => {
    return jwt.decode(token);
}