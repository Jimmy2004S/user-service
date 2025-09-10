import bcrypt from "bcryptjs";
import { loadSecrets } from "./secrets";

const rounds = Number(process.env.BCRYPT_SALT_ROUNDS || 12);

export async function hashPassword(password: string): Promise<string> {
  const { PEPPER } = await loadSecrets();
  const salted = PEPPER ? password + PEPPER : password;
  const salt = await bcrypt.genSalt(rounds);
  return bcrypt.hash(salted, salt);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const { PEPPER } = await loadSecrets();
  const salted = PEPPER ? password + PEPPER : password;
  return bcrypt.compare(salted, hash);
}
