import { constants } from "node:os";
import { getCloudflareApiBaseUrl } from "@cloudflare/workers-utils/compliance";
import { x } from "tinyexec";
import type { CommonYargsOptions } from "#lib/cli-types.js";
import type { ArgumentsCamelCase, Argv, CommandModule } from "yargs";
import {
	resolveHarnessSettings,
	resolveHarnessToken,
} from "#lib/ai-harnesses.js";
import { getAuthToken } from "#lib/auth-token.js";
import { getAccountId, getComplianceRegion } from "#lib/auth.js";
import { CliExit } from "#lib/cli-exit.js";
import { withCloudflareDotEnv } from "#lib/dotenv.js";
import { createChildProcessController } from "#lib/process.js";

interface PiArgs extends CommonYargsOptions {
	implArgs?: (string | number)[];
	gateway?: string;
}

function builder(yargs: Argv<CommonYargsOptions>): Argv<PiArgs> {
	return yargs
		.option("gateway", {
			type: "string",
			description:
				"AI Gateway ID (defaults to the configured or account default gateway)",
		})
		.positional("implArgs", {
			type: "string",
			array: true,
			describe: "Arguments forwarded to Pi",
		})
		.parserConfiguration({
			"unknown-options-as-args": true,
			"camel-case-expansion": false,
		}) as Argv<PiArgs>;
}

function nativeModel(model: string): string {
	const slash = model.indexOf("/");
	return slash === -1 ? model : model.slice(slash + 1);
}

export function piArgs(args: string[], defaultModel: string): string[] {
	const result = [...args];
	const providerIndex = result.findIndex((arg) => arg === "--provider");
	if (providerIndex === -1) {
		result.unshift("--provider", "cloudflare-ai-gateway");
	} else {
		result[providerIndex + 1] = "cloudflare-ai-gateway";
	}
	const modelIndex = result.findIndex((arg) => arg === "--model");
	if (modelIndex === -1) {
		result.unshift("--model", nativeModel(defaultModel));
	} else {
		const requested = result[modelIndex + 1];
		if (requested) {
			result[modelIndex + 1] = nativeModel(requested);
		}
	}
	return result;
}

function childEnvironment(
	token: string,
	accountId: string,
	gateway: string
): NodeJS.ProcessEnv {
	const environment = { ...process.env };
	delete environment.CLOUDFLARE_ACCESS_CLIENT_ID;
	delete environment.CLOUDFLARE_ACCESS_CLIENT_SECRET;
	delete environment.CLOUDFLARE_API_TOKEN;
	return {
		...environment,
		CLOUDFLARE_API_KEY: token,
		CLOUDFLARE_ACCOUNT_ID: accountId,
		CLOUDFLARE_GATEWAY_ID: gateway,
		PI_SKIP_VERSION_CHECK: "1",
		PI_TELEMETRY: "0",
	};
}

const command: CommandModule<CommonYargsOptions, PiArgs> = {
	command: "pi [implArgs..]",
	describe: "Run Pi through AI Gateway's REST API.",
	builder,
	handler: async (argv: ArgumentsCamelCase<PiArgs>): Promise<void> => {
		if (argv.local) {
			throw new Error("--local is not supported by cf ai pi.");
		}
		const settings = resolveHarnessSettings("pi", argv);
		if (settings.endpoint) {
			throw new Error(
				"cf ai pi does not inject arbitrary Access endpoints. Configure the @cf-internal/pi-plugin gateway with `/cf auth add <endpoint> --direct`, then run Pi with that registered provider."
			);
		}
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
		const gateway = argv.gateway ?? settings.gateway ?? "default";
		const child = x(
			"pi",
			piArgs((argv.implArgs ?? []).map(String), settings.model),
			{
				nodePath: false,
				nodeOptions: {
					stdio: "inherit",
					env: childEnvironment(childToken.value, accountId, gateway),
				},
			}
		);
		if (!child.process) {
			throw new Error("Unable to start Pi.");
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
					"Pi is not installed. Install @earendil-works/pi-coding-agent, then run cf ai pi again."
				);
			}
			throw error;
		}
	},
};

export default command;
