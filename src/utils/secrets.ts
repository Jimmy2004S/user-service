import { GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { secrets } from "../clients/aws";

type SecretShape = { JWT_SECRET: string; PEPPER?: string };

let cache: SecretShape | undefined;

export async function loadSecrets(
  secretId = process.env.SECRET_ID!
): Promise<SecretShape> {
  if (cache) return cache;
  if (!secretId) throw new Error("SECRET_ID env var is required");

  const res = await secrets.send(
    new GetSecretValueCommand({ SecretId: secretId })
  );
  const raw =
    res.SecretString || Buffer.from(res.SecretBinary as any).toString("utf8");

  const parsed = JSON.parse(raw) as Partial<SecretShape>;
  if (!parsed.JWT_SECRET) throw new Error("JWT_SECRET missing in secret JSON");

  cache = { JWT_SECRET: parsed.JWT_SECRET, PEPPER: parsed.PEPPER };
  return cache;
}
