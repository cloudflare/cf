import { getAuthToken } from "../../lib/auth-token.js";
import {
	fetchAuthorizedAccounts,
	getConfigPath,
	readAuthCredentials,
} from "../../lib/oauth/index.js";
import { formatOutput } from "../../lib/output.js";
import { theme } from "../../lib/ui/index.js";
import { formatScopeGroups } from "./scope-groups.js";
import type { ArgumentsCamelCase, Argv, CommandModule } from "yargs";

interface WhoamiArgs {
	product?: string;
	filter?: string;
}

const whoamiCommand: CommandModule<object, WhoamiArgs> = {
	command: "whoami",
	describe: "Show current user and authentication status",

	builder: (yargs: Argv): Argv<WhoamiArgs> => {
		return yargs
			.option("product", {
				type: "string",
				description:
					"Show granted OAuth scopes grouped by product, optionally only the products matching a search term",
			})
			.option("filter", {
				type: "string",
				description:
					"Show granted OAuth scopes grouped by product, only those whose name contains a search term",
			}) as Argv<WhoamiArgs>;
	},

	handler: async (argv: ArgumentsCamelCase<WhoamiArgs>): Promise<void> => {
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

		if (argv.product === undefined && argv.filter === undefined) {
			formatOutput(output);
			return;
		}

		printScopes(
			{ product: argv.product, filter: argv.filter },
			userEmail,
			accounts,
			envToken ? undefined : stored?.scopes
		);
	},
};

function printScopes(
	search: { product?: string; filter?: string },
	email: string | undefined,
	accounts: Array<{ name: string }>,
	scopes: string[] | undefined
): void {
	if (email) {
		console.log(`${theme.info("Email:")} ${email}`);
	}
	for (const account of accounts) {
		console.log(`${theme.info("Account:")} ${account.name}`);
	}
	console.log("");

	if (!scopes) {
		console.log(
			theme.muted(
				"No OAuth scopes: CLOUDFLARE_API_TOKEN permissions are set on the token."
			)
		);
		return;
	}

	console.log(
		formatScopeGroups(scopes, search) || theme.muted("No granted scopes match.")
	);
}

export default whoamiCommand;
