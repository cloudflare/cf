import {
	buildCommand,
	configureOpenAPIForContainerPull,
	initContainersSharedContext,
} from "@cloudflare/containers-shared";
import { getCloudflareApiBaseUrl } from "@cloudflare/workers-utils";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { Argv, CommandModule } from "yargs";
import { getAuthToken } from "#lib/auth-token.js";
import { getAccountId, getComplianceRegion } from "#lib/context.js";
import { createDeployContext } from "#lib/deploy-context.js";
import { withTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.positional("path", {
			type: "string",
			demandOption: true,
			description: "Directory containing the Dockerfile to build",
		})
		.option("tag", {
			alias: "t",
			type: "string",
			demandOption: true,
			description: "Name and optional tag for the built image",
		})
		.option("push", {
			alias: "p",
			type: "boolean",
			default: false,
			description: "Push the built image to Cloudflare's managed registry",
		})
		.option("path-to-docker", {
			type: "string",
			description: "Path to the Docker binary if it is not on PATH",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "build <path>",
	describe: "Build a Container image",
	builder,
	handler: async (argv): Promise<void> => {
		if (argv.local) {
			throw new Error("--local is not supported with `cf containers build`.");
		}

		const complianceConfig = {
			compliance_region: argv.push ? await getComplianceRegion() : "public",
		};
		const authToken = argv.push ? await getAuthToken() : "";
		const deployContext = createDeployContext(authToken);
		initContainersSharedContext({
			logger: deployContext.logger,
			fetchResult: deployContext.fetchResult,
			fetchPagedListResult: deployContext.fetchPagedListResult,
		});

		if (argv.push) {
			configureOpenAPIForContainerPull(
				await getAccountId(),
				authToken,
				getCloudflareApiBaseUrl(complianceConfig)
			);
		}

		await buildCommand(
			{
				PATH: argv.path,
				tag: argv.tag,
				push: argv.push,
				pathToDocker: argv["path-to-docker"],
			},
			complianceConfig
		);
	},
};

export default withTelemetry(command, {
	command: "containers build",
	classification: {
		safeFlags: ["push"],
		shortFlagAliases: {
			p: { canonical: "push", type: "boolean" },
			t: { canonical: "tag", type: "value" },
		},
	},
});
