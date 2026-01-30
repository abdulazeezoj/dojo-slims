import { createAuthClient } from "better-auth/client";
import { magicLinkClient, usernameClient } from "better-auth/client/plugins";
import { clientConfig } from "./config-client";

export const authClient = createAuthClient({
  baseURL: clientConfig.APP_URL,
  plugins: [magicLinkClient(), usernameClient()],
});
