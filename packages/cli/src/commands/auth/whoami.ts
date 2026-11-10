import {
	getCloudflareAPITokenFromEnv,
	getCloudflareAuthProfileFromEnv,
} from "@cloudflare/workers-auth";
import { detectAgentContext } from "../../lib/agent-context.js";
import { getAuthToken } from "../../lib/auth-token.js";
import { isNonInteractiveOrCI } from "../../lib/interactive.js";
import {
	fetchAuthorizedAccounts,
	getConfigPath,
	getActiveProfile,
	getProfileStore,
	readAuthCredentials,
} from "../../lib/oauth/index.js";
import { formatOutput } from "../../lib/output.js";
import { suppressActiveProfileLine } from "../../lib/session.js";
import { hint } from "../../lib/ui/index.js";
import { printWhoamiSummary } from "./whoami-output.js";
import type { CommonYargsOptions } from "../../lib/cli-types.js";
import type { WhoamiProfile, WhoamiSnapshot } from "./whoami-output.js";
import type { Argv, CommandModule } from "yargs";

interface WhoamiArgs extends CommonYargsOptions {
	json?: boolean;
}

function selectedProfile(argv: WhoamiArgs, overridden: boolean): WhoamiProfile {
	const name = getActiveProfile();
	const source = argv.profile
		? "--profile"
		: getCloudflareAuthProfileFromEnv()
			? "CLOUDFLARE_AUTH_PROFILE"
			: getProfileStore().bindings.getProfileForDirectory(process.cwd())
				? "directory"
				: "default";
	return { name, source, overridden };
}

const whoamiCommand: CommandModule<object, WhoamiArgs> = {
	command: "whoami",
	describe: "Show current user and authentication status",

	builder: (yargs: Argv): Argv<WhoamiArgs> =>
		yargs
			.option("json", {
				type: "boolean",
				description:
					"Show full JSON (default for CI, non-interactive runs and agents; use --no-json for a summary)",
			})
			.middleware(() => suppressActiveProfileLine(), true) as Argv<WhoamiArgs>,

	handler: async (argv): Promise<void> => {
		if (argv["temporary-account"] || argv["event-code"] !== undefined) {
			throw new Error(
				"--temporary-account and --event-code are not supported by cf auth whoami."
			);
		}

		// Determine the authentication source.
		const envToken = getCloudflareAPITokenFromEnv();
		const tokenVariable = envToken
			? process.env.CLOUDFLARE_API_TOKEN
				? "CLOUDFLARE_API_TOKEN"
				: "CF_API_TOKEN"
			: undefined;
		const stored = envToken ? undefined : readAuthCredentials();
		const profile = selectedProfile(argv, Boolean(envToken));
		const json =
			argv.json ??
			(isNonInteractiveOrCI(process.stdout) || detectAgentContext().isAgentic);
		const method = envToken
			? "api-token"
			: stored?.oauth_token
				? "oauth"
				: "none";

		let authSource: string;
		if (envToken) {
			authSource = `${tokenVariable} environment variable`;
		} else if (stored?.oauth_token) {
			authSource = `OAuth token from ${getConfigPath()}`;
		} else {
			authSource = "none";
		}

		try {
			await getAuthToken();
		} catch {
			const snapshot: WhoamiSnapshot = {
				result: { authenticated: false, error: "Not logged in", profile },
				method,
				tokenVariable,
				accountsAvailable: false,
			};
			if (json) {
				formatOutput(snapshot.result, { highlight: false });
			} else {
				await printWhoamiSummary(snapshot, argv);
			}
			if (authSource === "none" && detectAgentContext().isAgentic) {
				console.error(
					hint(
						'Ask the user: "I can put this online for 60 minutes without you signing in. To keep it, complete the temporary-account claim before it expires. Would you like me to deploy it that way?" (https://developers.cloudflare.com/workers/platform/claim-deployments/) If they agree, run `cf deploy --temporary-account`.'
					)
				);
			}
			return;
		}

		const { createCommandClient } = await import("../../lib/auth.js");
		const { default: getUser } = await import("#operations/user/get.js");
		const { default: verifyToken } =
			await import("#operations/user/tokens/verify.js");
		const client = await createCommandClient(argv);
		let userEmail: string | undefined;
		let accounts: Array<{ id: string; name: string }> = [];
		const [verificationResult, userResult, accountsResult] =
			await Promise.allSettled([
				// The user-token endpoint does not verify account API tokens or OAuth tokens.
				envToken
					? (client.send(verifyToken) as Promise<{ status?: string }>)
					: Promise.resolve(undefined),
				client.send(getUser),
				fetchAuthorizedAccounts(),
			]);

		if (verificationResult.status === "rejected" && process.env.DEBUG) {
			console.error("Token verification error:", verificationResult.reason);
		}

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

		// A rejected user-token probe may belong to an account token; failed detail
		// lookups alone cannot establish that the credential is invalid.
		let tokenValid: boolean | null = null;
		if (
			verificationResult.status === "fulfilled" &&
			["active", "disabled", "expired"].includes(
				verificationResult.value?.status ?? ""
			)
		) {
			tokenValid = verificationResult.value?.status === "active";
		} else if (
			userResult.status === "fulfilled" ||
			accountsResult.status === "fulfilled"
		) {
			tokenValid = true;
		}

		const output: Extract<WhoamiSnapshot["result"], { authenticated: true }> = {
			authenticated: true,
			authSource,
			tokenValid,
			...(userEmail && { email: userEmail }),
			accounts,
			profile,
		};

		const currentCredentials = envToken ? undefined : readAuthCredentials();
		if (currentCredentials?.oauth_token) {
			output.scopes = currentCredentials.scopes;
			output.expiresAt = currentCredentials.expiration_time;
		}

		if (json) {
			formatOutput(output, { highlight: false });
		} else {
			await printWhoamiSummary(
				{
					result: output,
					method,
					tokenVariable,
					accountsAvailable: accountsResult.status === "fulfilled",
				},
				argv
			);
		}
	},
};

export default whoamiCommand;
