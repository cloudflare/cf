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
	assertGatewayId,
	resolveHarnessSettings,
	resolveHarnessToken,
} from "#lib/ai-harnesses.js";
import { getAuthToken } from "#lib/auth-token.js";
import { getAccountId, getComplianceRegion } from "#lib/auth.js";
import { CliExit } from "#lib/cli-exit.js";
import { withCloudflareDotEnv } from "#lib/dotenv.js";
import { createChildProcessController } from "#lib/process.js";

interface OpenCodeRunArgs extends CommonYargsOptions {
	implArgs?: (string | number)[];
	gateway?: string;
	endpoint?: string;
}

function builder(yargs: Argv<CommonYargsOptions>): Argv<OpenCodeRunArgs> {
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
			describe: "Arguments forwarded to OpenCode",
		})
		.parserConfiguration({
			"unknown-options-as-args": true,
			"camel-case-expansion": false,
		}) as Argv<OpenCodeRunArgs>;
}

interface ProviderRoute {
	baseUrl: string;
	accessToken?: string;
}

function config(route: ProviderRoute, model: string, gateway?: string): string {
	const identityAware = route.accessToken !== undefined;
	return JSON.stringify({
		$schema: "https://opencode.ai/config.json",
		share: "disabled",
		// OpenCode merges OPENCODE_CONFIG with global and project config. Pin
		// both the provider allowlist and default model for this launch so a
		// global Anthropic/Cloudflare provider cannot bypass the injected route.
		enabled_providers: ["openai"],
		model: `openai/${model}`,
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

function configuredModel(args: string[], defaultModel: string): string {
	const modelIndex = args.findIndex((arg) => arg === "--model" || arg === "-m");
	const requested = modelIndex === -1 ? undefined : args[modelIndex + 1];
	if (!requested) {
		return defaultModel;
	}
	return requested.startsWith("openai/") ? requested : `openai/${requested}`;
}

function gatewayArgs(args: string[], defaultModel: string): string[] {
	const result = [...args];
	const modelIndex = result.findIndex(
		(arg) => arg === "--model" || arg === "-m"
	);
	if (modelIndex === -1) {
		result.unshift("--model", `openai/${defaultModel}`);
		return result;
	}
	const model = result[modelIndex + 1];
	if (model && !model.startsWith("openai/")) {
		result[modelIndex + 1] = `openai/${model}`;
	} else if (
		model?.startsWith("openai/") &&
		!model.startsWith("openai/openai/")
	) {
		result[modelIndex + 1] = `openai/${model}`;
	}
	return result;
}

async function writeConfig(
	route: ProviderRoute,
	model: string,
	gateway?: string
): Promise<{ directory: string; path: string }> {
	const directory = await mkdtemp(join(tmpdir(), "cf-ai-"));
	const path = join(directory, "opencode.json");
	await chmod(directory, 0o700);
	await writeFile(path, config(route, model, gateway), { mode: 0o600 });
	return { directory, path };
}

const command: CommandModule<CommonYargsOptions, OpenCodeRunArgs> = {
	command: "opencode [implArgs..]",
	describe: "Run OpenCode through AI Gateway's REST API.",
	builder,
	handler: async (argv: ArgumentsCamelCase<OpenCodeRunArgs>): Promise<void> => {
		if (argv.local) {
			throw new Error("--local is not supported by cf ai opencode.");
		}

		assertGatewayId(argv.gateway);
		const settings = resolveHarnessSettings("opencode", argv);
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

		let route: ProviderRoute;
		let credentials: ChildCredentials;
		if (endpoint !== undefined) {
			const accessToken = await acquireAccessToken(endpoint);
			const claims = describeAccessToken(accessToken);
			if (claims?.email) {
				console.error(`Using Cloudflare Access identity: ${claims.email}`);
			}
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
			const childToken = await resolveHarnessToken(
				parentToken,
				accountId,
				apiBaseUrl
			);
			route = {
				baseUrl: `${apiBaseUrl.replace(/\/$/, "")}/accounts/${accountId}/ai/v1`,
			};
			credentials = { apiToken: childToken.value };
		}

		const implArgs = (argv.implArgs ?? []).map(String);
		const model = configuredModel(implArgs, settings.model);
		const temporary = await writeConfig(
			route,
			model,
			argv.gateway ?? settings.gateway
		);
		try {
			const child = x("opencode", gatewayArgs(implArgs, settings.model), {
				nodePath: false,
				nodeOptions: {
					stdio: "inherit",
					env: childEnvironment(credentials, temporary.path),
				},
			});
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
					"OpenCode is not installed. Install it, then run cf ai opencode again."
				);
			}
			throw error;
		} finally {
			await rm(temporary.directory, { recursive: true, force: true });
		}
	},
};

export default command;
