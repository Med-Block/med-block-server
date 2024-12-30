import * as crypto from 'crypto';

const SALT_LENGTH = parseInt(process.env.SALT_LENGTH ?? '16');
const HASH_ITERATIONS = parseInt(process.env.HASH_ITERATIONS ?? '10000');
const HASH_KEY_LENGTH = parseInt(process.env.HASH_KEY_LENGTH ?? '64');
const HASH_ALGORITHM = process.env.HASH_ALGORITHM ?? 'sha512';

export function calculate(password: string): string {
    const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEY_LENGTH, HASH_ALGORITHM).toString('hex');
    return salt + hash;
}

export function verify(password: string, hash: string): boolean {
    const salt = hash.substring(0, SALT_LENGTH * 2);
    const expectedHash = hash.substring(SALT_LENGTH * 2);
    const actualHash = crypto.pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEY_LENGTH, HASH_ALGORITHM).toString('hex');
    return actualHash === expectedHash;
}