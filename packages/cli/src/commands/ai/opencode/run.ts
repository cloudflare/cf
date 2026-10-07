import { chmod, mkdtemp, rm, writeFile } from "node:fs/promises";
import { constants, tmpdir } from "node:os";
import { join } from "node:path";
import { getCloudflareApiBaseUrl } from "@cloudflare/workers-utils/compliance";
import { x } from "tinyexec";
import type { CommonYargsOptions } from "#lib/cli-types.js";
import type { ArgumentsCamelCase, Argv, CommandModule } from "yargs";
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
		}) as Argv<OpenCodeRunArgs>;
}

function config(
	apiBaseUrl: string,
	accountId: string,
	model: string,
	gateway?: string
): string {
	return JSON.stringify({
		$schema: "https://opencode.ai/config.json",
		share: "disabled",
		provider: {
			openai: {
				name: "OpenAI via Cloudflare AI Gateway",
				options: {
					baseURL: `${apiBaseUrl.replace(/\/$/, "")}/accounts/${accountId}/ai/v1`,
					apiKey: "{env:CF_AIG_TOKEN}",
					headers: {
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

function childEnvironment(
	token: string,
	configPath: string
): NodeJS.ProcessEnv {
	const environment = { ...process.env };
	delete environment.CLOUDFLARE_API_TOKEN;
	delete environment.CLOUDFLARE_ACCESS_CLIENT_ID;
	delete environment.CLOUDFLARE_ACCESS_CLIENT_SECRET;
	return {
		...environment,
		CF_AIG_TOKEN: token,
		OPENCODE_CONFIG: configPath,
		OPENCODE_DISABLE_AUTOUPDATE: "1",
	};
}

async function writeConfig(
	apiBaseUrl: string,
	accountId: string,
	model: string,
	gateway?: string
): Promise<{ directory: string; path: string }> {
	const directory = await mkdtemp(join(tmpdir(), "cf-ai-"));
	const path = join(directory, "opencode.json");
	await chmod(directory, 0o700);
	await writeFile(path, config(apiBaseUrl, accountId, model, gateway), {
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
		const temporary = await writeConfig(
			apiBaseUrl,
			accountId,
			settings.model,
			settings.gateway
		);

		try {
			const childToken = await createHarnessToken(
				parentToken,
				accountId,
				apiBaseUrl
			);
			const child = x(
				"opencode",
				["run", "--model", `openai/${settings.model}`, argv.prompt],
				{
					nodePath: false,
					nodeOptions: {
						stdio: "inherit",
						env: childEnvironment(childToken.value, temporary.path),
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
