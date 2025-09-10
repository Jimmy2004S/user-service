import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { badRequest, json, ok } from "../utils/http";
import { findUserByUuid } from "../repositories/users";

const BUCKET = process.env.BUCKET_NAME!;
const region = process.env.AWS_REGION || "us-east-1";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const user_id = event.pathParameters?.user_id;
    if (!user_id) return badRequest("Missing user_id");

    const user = await findUserByUuid(user_id);
    if (!user) return json(404, { message: "User not found" });

    const response: any = { ...user };
    if (user.image) {
      response.image = `https://${BUCKET}.s3.${region}.amazonaws.com/${user.image}`;
    }
    return ok(response);
  } catch (err: any) {
    console.error(err);
    return json(500, { message: "Internal error" });
  }
};
