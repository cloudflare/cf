import { constants } from "node:os";
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

interface CodexArgs extends CommonYargsOptions {
	implArgs?: (string | number)[];
	gateway?: string;
	endpoint?: string;
}

function builder(yargs: Argv<CommonYargsOptions>): Argv<CodexArgs> {
	return yargs
		.option("gateway", {
			type: "string",
			description:
				"AI Gateway ID (defaults to the configured or account default gateway)",
		})
		.option("endpoint", {
			type: "string",
			description:
				"Access-protected AI Gateway custom domain for per-user attribution",
		})
		.positional("implArgs", {
			type: "string",
			array: true,
			describe: "Arguments forwarded to Codex",
		})
		.parserConfiguration({
			"unknown-options-as-args": true,
			"camel-case-expansion": false,
		}) as Argv<CodexArgs>;
}

function tomlString(value: string): string {
	return JSON.stringify(value);
}

function normalizedModel(model: string): string {
	return model.startsWith("openai/") ? model : `openai/${model}`;
}

function modelFromArgs(args: string[], fallback: string): string {
	const index = args.findIndex((arg) => arg === "--model" || arg === "-m");
	return normalizedModel(
		index === -1 ? fallback : (args[index + 1] ?? fallback)
	);
}

function removeModelArgs(args: string[]): string[] {
	const result = [...args];
	const index = result.findIndex((arg) => arg === "--model" || arg === "-m");
	if (index !== -1) {
		result.splice(index, 2);
	}
	return result;
}

export interface ProviderConfig {
	baseUrl: string;
	model: string;
	access?: {
		origin: string;
		/** OAuth-capable apps accept the auth command's bearer token. */
		bearer: boolean;
	};
}

export function providerArgs(config: ProviderConfig): string[] {
	const args = [
		"--model",
		config.model,
		"--config",
		'model_provider="cloudflare-ai-gateway"',
		"--config",
		`model_providers.cloudflare-ai-gateway.name=${tomlString("Cloudflare AI Gateway")}`,
		"--config",
		`model_providers.cloudflare-ai-gateway.base_url=${tomlString(config.baseUrl)}`,
		"--config",
		'model_providers.cloudflare-ai-gateway.wire_api="responses"',
	];

	if (config.access?.bearer) {
		args.push(
			"--config",
			'model_providers.cloudflare-ai-gateway.env_http_headers={"cf-aig-metadata"="CF_AIG_METADATA"}',
			"--config",
			'model_providers.cloudflare-ai-gateway.auth.command="cloudflared"',
			"--config",
			`model_providers.cloudflare-ai-gateway.auth.args=["access","token",${tomlString(`--app=${config.access.origin}`)}]`,
			"--config",
			"model_providers.cloudflare-ai-gateway.auth.timeout_ms=30000",
			"--config",
			"model_providers.cloudflare-ai-gateway.auth.refresh_interval_ms=300000"
		);
	} else if (config.access) {
		args.push(
			"--config",
			'model_providers.cloudflare-ai-gateway.env_key="CF_ACCESS_TOKEN"',
			"--config",
			'model_providers.cloudflare-ai-gateway.env_http_headers={"cf-access-token"="CF_ACCESS_TOKEN","cf-aig-metadata"="CF_AIG_METADATA"}'
		);
	} else {
		args.push(
			"--config",
			'model_providers.cloudflare-ai-gateway.env_key="CF_AIG_TOKEN"',
			"--config",
			'model_providers.cloudflare-ai-gateway.env_http_headers={"cf-aig-gateway-id"="CF_AIG_GATEWAY_ID","cf-aig-metadata"="CF_AIG_METADATA"}'
		);
	}
	return args;
}

interface ChildCredentials {
	apiToken?: string;
	accessToken?: string;
	gateway?: string;
}

function childEnvironment(credentials: ChildCredentials): NodeJS.ProcessEnv {
	const environment = { ...process.env };
	delete environment.CLOUDFLARE_API_TOKEN;
	delete environment.CLOUDFLARE_ACCESS_CLIENT_ID;
	delete environment.CLOUDFLARE_ACCESS_CLIENT_SECRET;
	return {
		...environment,
		...(credentials.apiToken ? { CF_AIG_TOKEN: credentials.apiToken } : {}),
		...(credentials.accessToken
			? { CF_ACCESS_TOKEN: credentials.accessToken }
			: {}),
		...(credentials.gateway ? { CF_AIG_GATEWAY_ID: credentials.gateway } : {}),
		CF_AIG_METADATA: JSON.stringify({ via: "cf", harness: "codex" }),
	};
}

const command: CommandModule<CommonYargsOptions, CodexArgs> = {
	command: "codex [implArgs..]",
	describe: "Run Codex through AI Gateway's REST API.",
	builder,
	handler: async (argv: ArgumentsCamelCase<CodexArgs>): Promise<void> => {
		if (argv.local) {
			throw new Error("--local is not supported by cf ai codex.");
		}

		const settings = resolveHarnessSettings("codex", argv);
		const endpoint = argv.endpoint ?? settings.endpoint;
		const protection =
			endpoint === undefined
				? undefined
				: await detectAccessProtection(endpoint);
		if (endpoint !== undefined && protection?.protected !== true) {
			throw new Error(
				`${endpoint} is not Access-protected, so AI Gateway cannot attribute requests to you. Remove --endpoint to use the account API, or protect the domain with Cloudflare Access.`
			);
		}

		const implArgs = (argv.implArgs ?? []).map(String);
		const model = modelFromArgs(implArgs, settings.model);
		let provider: ProviderConfig;
		let credentials: ChildCredentials;
		if (endpoint !== undefined) {
			const accessToken = await acquireAccessToken(endpoint);
			const claims = describeAccessToken(accessToken);
			if (claims?.email) {
				console.error(`Using Cloudflare Access identity: ${claims.email}`);
			}
			provider = {
				baseUrl: `${endpoint.replace(/\/$/, "")}/compat`,
				model,
				access: {
					origin: endpoint,
					bearer: protection?.methods.includes("oauth") === true,
				},
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
			provider = {
				// Codex 0.156 appends /responses (not /v1/responses), so the
				// account REST base must include /v1.
				baseUrl: `${apiBaseUrl.replace(/\/$/, "")}/accounts/${accountId}/ai/v1`,
				model,
			};
			credentials = {
				apiToken: childToken.value,
				gateway: argv.gateway ?? settings.gateway,
			};
		}

		const child = x(
			"codex",
			[...providerArgs(provider), ...removeModelArgs(implArgs)],
			{
				nodePath: false,
				nodeOptions: {
					stdio: "inherit",
					env: childEnvironment(credentials),
				},
			}
		);
		if (!child.process) {
			throw new Error("Unable to start Codex.");
		}
		try {
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
					"Codex is not installed. Install @openai/codex, then run cf ai codex again."
				);
			}
			throw error;
		}
	},
};

export default command;
