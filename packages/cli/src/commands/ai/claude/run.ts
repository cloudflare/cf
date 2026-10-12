import { constants } from "node:os";
import { x } from "tinyexec";
import type { CommonYargsOptions } from "#lib/cli-types.js";
import type { ArgumentsCamelCase, Argv, CommandModule } from "yargs";
import {
	acquireAccessToken,
	describeAccessToken,
	detectAccessProtection,
} from "#lib/access-credentials.js";
import { resolveHarnessSettings } from "#lib/ai-harnesses.js";
import { CliExit } from "#lib/cli-exit.js";
import { createChildProcessController } from "#lib/process.js";

interface ClaudeArgs extends CommonYargsOptions {
	implArgs?: (string | number)[];
	endpoint?: string;
}

function builder(yargs: Argv<CommonYargsOptions>): Argv<ClaudeArgs> {
	return yargs
		.option("endpoint", {
			type: "string",
			description: "Access-protected AI Gateway custom domain",
		})
		.positional("implArgs", {
			type: "string",
			array: true,
			describe: "Arguments forwarded to Claude Code",
		})
		.parserConfiguration({
			"unknown-options-as-args": true,
			"camel-case-expansion": false,
		}) as Argv<ClaudeArgs>;
}

function nativeModel(model: string): string {
	return model.startsWith("anthropic/")
		? model.slice("anthropic/".length)
		: model;
}

export function claudeArgs(args: string[], defaultModel: string): string[] {
	const result = [...args];
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

function childEnvironment(endpoint: string, token: string): NodeJS.ProcessEnv {
	const environment = { ...process.env };
	delete environment.ANTHROPIC_API_KEY;
	delete environment.CLAUDE_CODE_OAUTH_TOKEN;
	delete environment.CLOUDFLARE_API_TOKEN;
	delete environment.CLOUDFLARE_ACCESS_CLIENT_ID;
	delete environment.CLOUDFLARE_ACCESS_CLIENT_SECRET;
	return {
		...environment,
		ANTHROPIC_BASE_URL: `${endpoint.replace(/\/$/, "")}/anthropic`,
		ANTHROPIC_AUTH_TOKEN: token,
		ANTHROPIC_CUSTOM_HEADERS: [
			`cf-access-token: ${token}`,
			'cf-aig-metadata: {"via":"cf","harness":"claude-code"}',
		].join("\n"),
		CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1",
	};
}

const command: CommandModule<CommonYargsOptions, ClaudeArgs> = {
	command: "claude [implArgs..]",
	describe: "Run Claude Code through an Access-protected AI Gateway.",
	builder,
	handler: async (argv: ArgumentsCamelCase<ClaudeArgs>): Promise<void> => {
		if (argv.local) {
			throw new Error("--local is not supported by cf ai claude.");
		}
		const settings = resolveHarnessSettings("claude-code", argv);
		const endpoint = argv.endpoint ?? settings.endpoint;
		if (!endpoint) {
			throw new Error(
				"cf ai claude currently requires --endpoint because Claude Code sends request fields that the account REST Messages endpoint rejects."
			);
		}
		const protection = await detectAccessProtection(endpoint);
		if (!protection.protected) {
			throw new Error(
				`${endpoint} is not Access-protected, so AI Gateway cannot attribute requests to you.`
			);
		}
		const token = await acquireAccessToken(endpoint);
		const claims = describeAccessToken(token);
		if (claims?.email) {
			console.error(`Using Cloudflare Access identity: ${claims.email}`);
		}

		const child = x(
			"claude",
			claudeArgs((argv.implArgs ?? []).map(String), settings.model),
			{
				nodePath: false,
				nodeOptions: {
					stdio: "inherit",
					env: childEnvironment(endpoint, token),
				},
			}
		);
		if (!child.process) {
			throw new Error("Unable to start Claude Code.");
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
					"Claude Code is not installed. Install @anthropic-ai/claude-code, then run cf ai claude again."
				);
			}
			throw error;
		}
	},
};

export default command;
