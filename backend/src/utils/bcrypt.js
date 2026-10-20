import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export const hashValue = (value, saltRounds = SALT_ROUNDS) =>
    bcrypt.hash(value, saltRounds);

export const compareValue = (value, hashedValue) =>
    bcrypt.compare(value, hashedValue);
