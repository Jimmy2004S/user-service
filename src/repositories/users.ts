import { ddb } from "../clients/aws";
import { PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { User } from "../models/User";

const TABLE_NAME = process.env.TABLE_NAME!;
const GSI_EMAIL = "email-index";
const GSI_UUID = "uuid-index";

/** Devuelve el usuario por email usando GSI */
export async function findUserByEmail(email: string): Promise<User | null> {
  const res = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: GSI_EMAIL,
      KeyConditionExpression: "#e = :email",
      ExpressionAttributeNames: { "#e": "email" },
      ExpressionAttributeValues: { ":email": email },
      Limit: 1,
    })
  );
  return (res.Items?.[0] as User) || null;
}

/** Devuelve el usuario por uuid usando GSI (no conocemos 'document') */
export async function findUserByUuid(uuid: string): Promise<User | null> {
  const res = await ddb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: GSI_UUID,
      KeyConditionExpression: "#u = :uuid",
      ExpressionAttributeNames: { "#u": "uuid" },
      ExpressionAttributeValues: { ":uuid": uuid },
      Limit: 1,
    })
  );
  return (res.Items?.[0] as User) || null;
}

/** Inserta usuario validando unicidad por email */
export async function saveUser(user: User): Promise<void> {
  const exists = await findUserByEmail(user.email);
  if (exists) {
    throw new Error("Email already registered");
  }

  await ddb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: user,
      ConditionExpression: "attribute_not_exists(#u)",
      ExpressionAttributeNames: { "#u": "uuid" },
    })
  );
}

/** Actualiza address/phone conociendo solo uuid */
export async function updateUserByUuid(
  uuid: string,
  patch: { address?: string; phone?: string }
): Promise<User> {
  const current = await findUserByUuid(uuid);
  if (!current) throw new Error("User not found");

  const updates: string[] = [];
  const names: Record<string, string> = {};
  const values: Record<string, any> = {};

  if (patch.address !== undefined) {
    updates.push("#a = :a");
    names["#a"] = "address";
    values[":a"] = patch.address;
  }
  if (patch.phone !== undefined) {
    updates.push("#p = :p");
    names["#p"] = "phone";
    values[":p"] = patch.phone;
  }
  if (updates.length === 0) return current;

  const res = await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { uuid: current.uuid, document: current.document },
      UpdateExpression: "SET " + updates.join(", "),
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ReturnValues: "ALL_NEW",
    })
  );

  return res.Attributes as User;
}

/** Actualiza imagen (S3 key o URL) conociendo solo uuid */
export async function setUserImage(uuid: string, image: string): Promise<User> {
  const current = await findUserByUuid(uuid);
  if (!current) throw new Error("User not found");

  const res = await ddb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { uuid: current.uuid, document: current.document },
      UpdateExpression: "SET #img = :img",
      ExpressionAttributeNames: { "#img": "image" },
      ExpressionAttributeValues: { ":img": image },
      ReturnValues: "ALL_NEW",
    })
  );
  return res.Attributes as User;
}
