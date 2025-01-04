import { UserAttributes } from "../models/db/user";

export class UserResponse {
    public id: number = 0;
    public email: string = '';
    public firstName: string = '';
    public lastName: string = '';
    public role: string = '';
    public position?: string = undefined;
    public isBlocked: boolean = false;
    constructor(user: UserAttributes){
        this.id = user.id;
        this.email = user.email;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.role = user.role;
        this.position = user.position;
        this.isBlocked = user.isBlocked || false;
    }
}