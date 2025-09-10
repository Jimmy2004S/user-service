import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { json, badRequest, unauthorized, ok } from "../utils/http";
import { z } from "zod";
import { findUserByEmail } from "../repositories/users";
import { verifyPassword } from "../utils/crypto";
import { signJwt } from "../utils/jwt";
import "dotenv/config";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const input = schema.parse(body);

    const user = await findUserByEmail(input.email.toLowerCase());
    if (!user) return unauthorized("Credenciales inválidas");

    const okPwd = await verifyPassword(input.password, user.password);
    if (!okPwd) return unauthorized("Credenciales inválidas");

    const token = await signJwt(user.uuid);
    return ok({ token });
  } catch (err: any) {
    if (err?.name === "ZodError")
      return badRequest(err.issues?.[0]?.message || "Invalid body");
    console.error(err);
    return json(500, { message: "Internal error" });
  }
};
