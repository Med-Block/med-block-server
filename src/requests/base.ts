import { Request } from "express";
import { AuthUser } from "../models/entities";

export interface MedBlockRequest extends Request {
    user?: AuthUser;
    token?: string;
}