import { chmod, mkdtemp, rm, writeFile } from "node:fs/promises";
import { constants, tmpdir } from "node:os";
import { join } from "node:path";
import { getCloudflareApiBaseUrl } from "@cloudflare/workers-utils/compliance";
import { x } from "tinyexec";
import type { CommonYargsOptions } from "#lib/cli-types.js";
import type { ArgumentsCamelCase, Argv, CommandModule } from "yargs";
import {
	acquireAccessToken,
	describeAccessToken,
	detectAccessProtection,
} from "#lib/access-credentials.js";
import {
	createHarnessToken,
	resolveHarnessSettings,
} from "#lib/ai-harnesses.js";
import { getAuthToken } from "#lib/auth-token.js";
import { getAccountId, getComplianceRegion } from "#lib/auth.js";
import { CliExit } from "#lib/cli-exit.js";
import { withCloudflareDotEnv } from "#lib/dotenv.js";
import { createChildProcessController } from "#lib/process.js";

interface OpenCodeRunArgs extends CommonYargsOptions {
	prompt: string;
	gateway?: string;
	model?: string;
	endpoint?: string;
}

function builder(yargs: Argv<CommonYargsOptions>): Argv<OpenCodeRunArgs> {
	return yargs
		.positional("prompt", {
			type: "string",
			description: "Prompt to send to OpenCode",
			demandOption: true,
		})
		.option("gateway", {
			type: "string",
			description:
				"AI Gateway ID (defaults to the configured or account default gateway)",
		})
		.option("model", {
			type: "string",
			description: "Provider-prefixed AI Gateway model ID",
		})
		.option("endpoint", {
			type: "string",
			description:
				"AI Gateway custom domain. When it is Access-protected, cf sends your individual Access token so the gateway records cf.user_id",
		}) as Argv<OpenCodeRunArgs>;
}

interface ProviderRoute {
	baseUrl: string;
	/** Identity-bearing Access token, sent in cf-access-token. */
	accessToken?: string;
}

function config(route: ProviderRoute, model: string, gateway?: string): string {
	// On an Access-protected endpoint the Access token is the credential, sent
	// in cf-access-token. OpenCode always emits an Authorization header, and
	// the gateway forwards whatever it finds there to the upstream provider —
	// so a placeholder would surface as a provider auth failure. Reusing the
	// Access token keeps that header valid while Unified Billing supplies the
	// provider credentials.
	const identityAware = route.accessToken !== undefined;
	return JSON.stringify({
		$schema: "https://opencode.ai/config.json",
		share: "disabled",
		provider: {
			openai: {
				name: "OpenAI via Cloudflare AI Gateway",
				options: {
					baseURL: route.baseUrl,
					apiKey: identityAware
						? "{env:CF_ACCESS_TOKEN}"
						: "{env:CF_AIG_TOKEN}",
					headers: {
						...(identityAware
							? { "cf-access-token": "{env:CF_ACCESS_TOKEN}" }
							: {}),
						...(gateway === undefined ? {} : { "cf-aig-gateway-id": gateway }),
						"cf-aig-metadata": JSON.stringify({
							via: "cf",
							harness: "opencode",
						}),
					},
				},
				models: { [model]: { name: `${model} via Cloudflare AI Gateway` } },
			},
		},
	});
}

interface ChildCredentials {
	apiToken?: string;
	accessToken?: string;
}

function childEnvironment(
	credentials: ChildCredentials,
	configPath: string
): NodeJS.ProcessEnv {
	const environment = { ...process.env };
	delete environment.CLOUDFLARE_API_TOKEN;
	delete environment.CLOUDFLARE_ACCESS_CLIENT_ID;
	delete environment.CLOUDFLARE_ACCESS_CLIENT_SECRET;
	return {
		...environment,
		...(credentials.apiToken === undefined
			? {}
			: { CF_AIG_TOKEN: credentials.apiToken }),
		...(credentials.accessToken === undefined
			? {}
			: { CF_ACCESS_TOKEN: credentials.accessToken }),
		OPENCODE_CONFIG: configPath,
		OPENCODE_DISABLE_AUTOUPDATE: "1",
	};
}

async function writeConfig(
	route: ProviderRoute,
	model: string,
	gateway?: string
): Promise<{ directory: string; path: string }> {
	const directory = await mkdtemp(join(tmpdir(), "cf-ai-"));
	const path = join(directory, "opencode.json");
	await chmod(directory, 0o700);
	await writeFile(path, config(route, model, gateway), {
		mode: 0o600,
	});
	return { directory, path };
}

const command: CommandModule<CommonYargsOptions, OpenCodeRunArgs> = {
	command: "run <prompt>",
	describe:
		"Run OpenCode through AI Gateway's REST API with a scoped token that expires after one hour.",
	builder,
	handler: async (argv: ArgumentsCamelCase<OpenCodeRunArgs>): Promise<void> => {
		if (argv.local) {
			throw new Error("--local is not supported by cf ai opencode run.");
		}

		const settings = resolveHarnessSettings("opencode", argv);
		const endpoint = settings.endpoint;

		// An Access-protected custom domain is the only route that yields
		// per-user attribution: the gateway resolves the individual Access
		// token into cf.user_id. The account API path cannot, so it stays on a
		// scoped API token.
		const protection =
			endpoint === undefined
				? undefined
				: await detectAccessProtection(endpoint);
		if (endpoint !== undefined && protection?.protected !== true) {
			throw new Error(
				`${endpoint} is not Access-protected, so AI Gateway cannot attribute requests to you. Remove --endpoint to use the account API, or protect the domain with Cloudflare Access.`
			);
		}

		let route: ProviderRoute;
		let credentials: ChildCredentials;

		if (endpoint !== undefined) {
			const accessToken = await acquireAccessToken(endpoint);
			const claims = describeAccessToken(accessToken);
			if (claims?.email) {
				console.error(`Using Cloudflare Access identity: ${claims.email}`);
			}
			// The gateway's /compat surface takes the same provider-prefixed
			// model IDs as the account API, so a model configured for one route
			// works unchanged on the other.
			route = {
				baseUrl: `${endpoint.replace(/\/$/, "")}/compat`,
				accessToken,
			};
			credentials = { accessToken };
		} else {
			const { accountId, apiBaseUrl, parentToken } = await withCloudflareDotEnv(
				argv,
				async () => ({
					accountId: await getAccountId(),
					apiBaseUrl: getCloudflareApiBaseUrl({
						compliance_region: await getComplianceRegion(),
					}),
					parentToken: await getAuthToken(),
				})
			);
			const childToken = await createHarnessToken(
				parentToken,
				accountId,
				apiBaseUrl
			);
			route = {
				baseUrl: `${apiBaseUrl.replace(/\/$/, "")}/accounts/${accountId}/ai/v1`,
			};
			credentials = { apiToken: childToken.value };
		}

		const temporary = await writeConfig(
			route,
			settings.model,
			settings.gateway
		);

		try {
			const child = x(
				"opencode",
				["run", "--model", `openai/${settings.model}`, argv.prompt],
				{
					nodePath: false,
					nodeOptions: {
						stdio: "inherit",
						env: childEnvironment(credentials, temporary.path),
					},
				}
			);
			if (!child.process) {
				throw new Error("Unable to start OpenCode.");
			}
			const exit = await createChildProcessController(child.process, {
				forwardSignals: true,
			}).exited;
			const code =
				exit.code ??
				(exit.signal ? 128 + (constants.signals[exit.signal] ?? 1) : 1);
			throw new CliExit(code, { signal: exit.signal ?? undefined });
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === "ENOENT") {
				throw new Error(
					"OpenCode is not installed. Install it, then run cf ai opencode run again."
				);
			}
			throw error;
		} finally {
			await rm(temporary.directory, { recursive: true, force: true });
		}
	},
};

export default command;
