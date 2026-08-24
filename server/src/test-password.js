import { hashPassword, comparePassword } from "./utils/password.js";

const password = "secret123";

const hash = await hashPassword(password);

console.log("Hash:", hash);

const correct = await comparePassword(password, hash);
console.log("Correct password:", correct);

const wrong = await comparePassword("wrongpassword", hash);
console.log("Wrong password:", wrong);