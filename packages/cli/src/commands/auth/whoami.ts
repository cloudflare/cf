import {
	createCloudflareClientWithToken,
	fetchAuthorizedAccounts,
	getAuthToken,
	getConfigPath,
	readAuthCredentials,
} from "../../lib/auth.js";
import { formatOutput } from "../../lib/output.js";
import type { ArgumentsCamelCase, Argv, CommandModule } from "yargs";

interface WhoamiArgs {}

const whoamiCommand: CommandModule<object, WhoamiArgs> = {
	command: "whoami",
	describe: "Show current user and authentication status",

	builder: (yargs: Argv): Argv<WhoamiArgs> => {
		return yargs as Argv<WhoamiArgs>;
	},

	handler: async (_argv: ArgumentsCamelCase<WhoamiArgs>): Promise<void> => {
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
			return;
		}

		const client = createCloudflareClientWithToken({ apiToken: token });
		let userEmail: string | undefined;
		let accounts: Array<{ id: string; name: string }> = [];
		const [userResult, accountsResult] = await Promise.allSettled([
			client.user.get(),
			fetchAuthorizedAccounts(),
		]);

		if (userResult.status === "fulfilled") {
			const user = userResult.value;
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
