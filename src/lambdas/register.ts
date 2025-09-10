import { APIGatewayProxyHandler } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { hashPassword } from "../utils/crypto";
import { saveUser } from "../repositories/users";
import { User } from "../models/User";

import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const schema = z.object({
  name: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  document: z.string().min(5),
});

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const input = schema.parse(body);

    const uuid = uuidv4();
    const now = new Date().toISOString();
    const user: User = {
      uuid,
      name: input.name,
      lastName: input.lastName,
      email: input.email,
      password: await hashPassword(input.password),
      document: input.document,
      createdAt: now,
    };

    await saveUser(user);

    // Enviar mensaje a SQS para solicitar tarjeta
    const sqsClient = new SQSClient({});
    const queueUrl = process.env.CARD_REQUEST_QUEUE_URL;
    if (queueUrl) {
      const messageBody = JSON.stringify({
        uuid,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        document: user.document,
        createdAt: user.createdAt,
      });
      await sqsClient.send(new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: messageBody,
      }));
    }

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "User registered", uuid }),
      headers: { "Content-Type": "application/json" },
    };
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: err.issues?.[0]?.message || "Invalid body",
        }),
      };
    }
    console.error(err);
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) };
  }
};
