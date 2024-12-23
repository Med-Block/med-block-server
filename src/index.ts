/*
- user
    - login
    - register
    - get sefl
    - get by id
    - update by id
    - block by id
*/
import * as dotenv from "dotenv";
dotenv.config();
import { db, init } from "./services/db";

init();