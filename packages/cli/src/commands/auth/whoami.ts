import { detectAgentContext } from "../../lib/agent-context.js";
import { getAuthToken } from "../../lib/auth-token.js";
import {
	fetchAuthorizedAccounts,
	getConfigPath,
	readAuthCredentials,
} from "../../lib/oauth/index.js";
import { formatOutput } from "../../lib/output.js";
import { hint } from "../../lib/ui/index.js";
import type { CommandModule } from "yargs";

const whoamiCommand: CommandModule = {
	command: "whoami",
	describe: "Show current user and authentication status",

	handler: async (argv): Promise<void> => {
		if (argv["temporary-account"] || argv["event-code"] !== undefined) {
			throw new Error(
				"--temporary-account and --event-code are not supported by cf auth whoami."
			);
		}

		// Determine the authentication source.
		const envToken = process.env.CLOUDFLARE_API_TOKEN;
		const stored = readAuthCredentials();

		let authSource: string;
		if (envToken) {
			authSource = "CLOUDFLARE_API_TOKEN environment variable";
		} else if (stored?.oauth_token) {
			authSource = `OAuth token from ${getConfigPath()}`;
		} else {
			authSource = "none";
		}

		// Try to get a token and verify it.
		let token: string;
		try {
			token = await getAuthToken();
		} catch {
			formatOutput({ authenticated: false, error: "Not logged in" });
			if (authSource === "none" && detectAgentContext().isAgentic) {
				console.error(
					hint(
						'Ask the user: "I can put this online for 60 minutes without you signing in. To keep it, complete the temporary-account claim before it expires. Would you like me to deploy it that way?" (https://developers.cloudflare.com/workers/platform/claim-deployments/) If they agree, run `cf deploy --temporary-account`.'
					)
				);
			}
			return;
		}

		const { createCloudflareClientWithToken } =
			await import("../../lib/auth.js");
		const { default: getUser } = await import("#operations/user/get.js");
		const client = createCloudflareClientWithToken({ apiToken: token });
		let userEmail: string | undefined;
		let accounts: Array<{ id: string; name: string }> = [];
		const [userResult, accountsResult] = await Promise.allSettled([
			client.send(getUser),
			fetchAuthorizedAccounts(),
		]);

		if (userResult.status === "fulfilled") {
			const user = userResult.value as object | null | undefined;
			if (user && "email" in user && typeof user.email === "string") {
				userEmail = user.email;
			}
		} else if (process.env.DEBUG) {
			console.error("User lookup error:", userResult.reason);
		}

		if (accountsResult.status === "fulfilled") {
			accounts = accountsResult.value;
		} else if (process.env.DEBUG) {
			console.error("Account lookup error:", accountsResult.reason);
		}

		const tokenValid =
			userResult.status === "fulfilled" ||
			accountsResult.status === "fulfilled";

		const output: Record<string, unknown> = {
			authenticated: true,
			authSource,
			tokenValid,
			...(userEmail && { email: userEmail }),
			accounts,
		};

		if (stored?.oauth_token) {
			output.scopes = stored.scopes;
			output.expiresAt = stored.expiration_time;
		}

		formatOutput(output);
	},
};

export default whoamiCommand;
