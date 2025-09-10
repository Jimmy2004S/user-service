import jwt from "jsonwebtoken";
import { loadSecrets } from "./secrets";

const expHours = Number(process.env.JWT_EXP_HOURS || 12);

export async function signJwt(sub: string) {
  const { JWT_SECRET } = await loadSecrets();
  return jwt.sign({ sub }, JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: `${expHours}h`,
  });
}

export async function verifyJwt(token: string): Promise<{ sub: string }> {
  const { JWT_SECRET } = await loadSecrets();
  const decoded = jwt.verify(token, JWT_SECRET) as any;
  return { sub: decoded.sub };
}
