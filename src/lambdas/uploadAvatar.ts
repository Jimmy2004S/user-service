import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { z } from "zod";
import { badRequest, json, ok } from "../utils/http";
import { s3 } from "../clients/aws";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { setUserImage } from "../repositories/users";

const BUCKET = process.env.BUCKET_NAME!;
const region = process.env.AWS_REGION || "us-east-1";

const schema = z.object({
  image: z.string().min(10), // base64
  fileType: z.enum(["image/jpeg", "image/png", "image/jpg"]),
});

function extFromType(t: string) {
  if (t === "image/png") return "png";
  return "jpg";
}

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const user_id = event.pathParameters?.user_id;
    if (!user_id) return badRequest("Missing user_id");

    const body = event.body ? JSON.parse(event.body) : {};
    const input = schema.parse(body);

    const bytes = Buffer.from(
      input.image.replace(/^data:\w+\/\w+;base64,/, ""),
      "base64"
    );
    const key = `image/file/${user_id}-${uuidv4()}.${extFromType(
      input.fileType
    )}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: bytes,
        ContentType: input.fileType,
      })
    );

    // URL estilo S3 (el bucket está bloqueado público, pero sirve para referencia)
    const url = `https://${BUCKET}.s3.${region}.amazonaws.com/${key}`;

    const updated = await setUserImage(user_id, url); // guardamos key
    return ok({ message: "Avatar uploaded", url, user: updated });
  } catch (err: any) {
    if (err?.name === "ZodError")
      return badRequest(err.issues?.[0]?.message || "Invalid body");
    console.error(err);
    return json(500, { message: "Internal error" });
  }
};
