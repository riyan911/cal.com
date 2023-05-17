import { google } from "googleapis";
import { z } from "zod";

import getAppKeysFromSlug from "@calcom/app-store/_utils/getAppKeysFromSlug";
import { prisma } from "@calcom/prisma";

import type { TrpcSessionUser } from "../../../trpc";

type CheckForGCalOptions = {
  ctx: {
    user: NonNullable<TrpcSessionUser>;
  };
};

const credentialsSchema = z.object({
  refresh_token: z.string().optional(),
  expiry_date: z.number().optional(),
  access_token: z.string().optional(),
  token_type: z.string().optional(),
  id_token: z.string().optional(),
  scope: z.string().optional(),
});

export const checkForGWorkspace = async ({ ctx }: CheckForGCalOptions) => {
  const gWorkspacePresent = await prisma.credential.findFirst({
    where: {
      type: "google_workspace_directory",
      userId: ctx.user.id,
    },
  });

  return { id: gWorkspacePresent?.id };
};
let client_id = "";
let client_secret = "";

export const getUsersFromGWorkspace = async ({ ctx }: CheckForGCalOptions) => {
  const appKeys = await getAppKeysFromSlug("google-calendar");
  if (typeof appKeys.client_id === "string") client_id = appKeys.client_id;
  if (typeof appKeys.client_secret === "string") client_secret = appKeys.client_secret;
  if (!client_id) return new Error("Google client_id missing.");
  if (!client_secret) new Error("Google client_secret missing.");

  const hasExistingCredentials = await prisma.credential.findFirst({
    where: {
      type: "google_workspace_directory",
    },
  });
  if (!hasExistingCredentials) {
    throw new Error("No workspace credentials found");
  }

  const credentials = credentialsSchema.parse(hasExistingCredentials.key);

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret);

  // Set users credentials instead of our app credentials - allowing us to make requests on their behalf
  oAuth2Client.setCredentials(credentials);

  // Create a new instance of the Admin SDK directory API
  const directory = google.admin({ version: "directory_v1", auth: oAuth2Client });

  const { data } = await directory.users.list({
    maxResults: 200, // Up this if we ever need to get more than 200 users
    customer: "my_customer", // This only works for single domain setups - we'll need to change this if we ever support multi-domain setups (unlikely we'll ever need to)
  });

  // We only want their email addresses
  const emails = data.users?.map((user) => user.primaryEmail as string) ?? ([] as string[]);
  return emails;
};
