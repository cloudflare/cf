import { getAccountId, getAuthToken, getComplianceRegion } from "#lib/auth.js";
import { createDeployContext } from "#lib/deploy-context.js";
import { getDefaultHeaders } from "#lib/request-headers.js";
import { withTelemetry } from "#lib/telemetry/index.js";
import {
	configureOpenAPIForContainerPull,
	containersSshOptions,
	initContainersSharedContext,
	OpenAPI,
	shouldUseStdio,
	sshCommand,
} from "@cloudflare/containers-shared";
import { getCloudflareApiBaseUrl } from "@cloudflare/workers-utils";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.positional("id", {
			type: "string",
			demandOption: true,
			description: "ID of the container instance",
		})
		.positional("ssh-command", {
			type: "string",
			array: true,
			description: "Command and arguments to run in the container",
		})
		.options(containersSshOptions)
		.middleware((argv) => {
			// Proxy mode must suppress cf's startup decoration as well as the
			// shared transport's spinner, including automatic stdio detection.
			if (shouldUseStdio(argv)) {
				argv.quiet = true;
			}
		}, true)
		.parserConfiguration({
			"populate--": true,
			"unknown-options-as-args": true,
			"parse-positional-numbers": false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "ssh <id> [ssh-command..]",
	describe: "SSH into a container",
	builder,
	handler: async (argv): Promise<void> => {
		if (argv.local) {
			throw new Error("--local is not supported with `cf containers ssh`.");
		}
		const authToken = await getAuthToken();
		const accountId = await getAccountId();
		const complianceConfig = { compliance_region: await getComplianceRegion() };
		const context = createDeployContext(authToken);
		initContainersSharedContext({
			logger: context.logger,
			fetchResult: context.fetchResult,
		});
		OpenAPI.HEADERS = getDefaultHeaders();
		configureOpenAPIForContainerPull(
			accountId,
			authToken,
			getCloudflareApiBaseUrl(complianceConfig)
		);
		await sshCommand({
			...argv,
			id: argv.id,
			command: [
				...(argv["ssh-command"] ?? []),
				...(Array.isArray(argv["--"]) ? argv["--"].map(String) : []),
			],
		});
	},
};

const commandWithTelemetry = withTelemetry(command, {
	command: "containers ssh",
	// SSH accepts arbitrary remote arguments after `--`; none are safe to record.
	recordArgs: false,
});

export default {
	...commandWithTelemetry,
	// Stdio mode is a transparent proxy. Skip telemetry so it cannot touch
	// persisted state or write DEBUG diagnostics into the proxied stream.
	handler: async (argv: Parameters<typeof command.handler>[0]) => {
		if (shouldUseStdio(argv)) {
			const { markCommandReported } = await import("#lib/telemetry/index.js");
			markCommandReported();
			return command.handler(argv);
		}
		return commandWithTelemetry.handler(argv);
	},
};
