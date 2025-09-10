import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { z } from "zod";
import { badRequest, json, ok } from "../utils/http";
import { updateUserByUuid } from "../repositories/users";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const schema = z.object({
  address: z.string().min(2).optional(),
  phone: z.string().min(5).optional(),
});

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const user_id = event.pathParameters?.user_id;
    if (!user_id) return badRequest("Missing user_id");

    const body = event.body ? JSON.parse(event.body) : {};
    const input = schema.parse(body);

    const updated = await updateUserByUuid(user_id, {
      address: input.address,
      phone: input.phone,
    });

    const sqsClient = new SQSClient({});
    const notificationsQueueUrl = process.env.NOTIFICATIONS_QUEUE_URL;
    // Enviar notificación USER.UPDATE
    if (notificationsQueueUrl) {
      const updateMessage = JSON.stringify({
        type: "USER.UPDATE",
        data: {
          date: new Date().toISOString(),
        },
      });

      await sqsClient.send(
        new SendMessageCommand({
          QueueUrl: notificationsQueueUrl,
          MessageBody: updateMessage,
        })
      );
    }

    return ok({ message: "Profile updated", user: updated });
  } catch (err: any) {
    if (err?.name === "ZodError")
      return badRequest(err.issues?.[0]?.message || "Invalid body");
    console.error(err);
    return json(500, { message: "Internal error" });
  }
};
