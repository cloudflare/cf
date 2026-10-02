/**
 * `cf containers push` uploads an existing local Docker image to Cloudflare's
 * managed registry. This has no OpenAPI operation: the shared Containers
 * helper obtains registry credentials and performs the Docker login/tag/push
 * sequence, so the command is spliced into the generated Containers tree.
 */
import {
	configureOpenAPIForContainerPull,
	initContainersSharedContext,
	pushCommand,
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
		.option("tag", {
			alias: "t",
			type: "string",
			demandOption: true,
			description: "Tag of the local image to push",
		})
		.option("path-to-docker", {
			type: "string",
			description: "Path to the Docker binary if it is not on PATH",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "push",
	describe: "Push a local image to the Cloudflare managed registry",
	builder,
	handler: async (argv): Promise<void> => {
		if (argv.local) {
			throw new Error("--local is not supported with `cf containers push`.");
		}

		const authToken = await getAuthToken();
		const accountId = await getAccountId();
		const complianceConfig = {
			compliance_region: await getComplianceRegion(),
		};
		const deployContext = createDeployContext(authToken);
		initContainersSharedContext({
			logger: deployContext.logger,
			fetchResult: deployContext.fetchResult,
			fetchPagedListResult: deployContext.fetchPagedListResult,
		});
		configureOpenAPIForContainerPull(
			accountId,
			authToken,
			getCloudflareApiBaseUrl(complianceConfig)
		);

		await pushCommand(
			{ TAG: argv.tag, pathToDocker: argv["path-to-docker"] },
			accountId,
			complianceConfig
		);
	},
};

export default withTelemetry(command, {
	command: "containers push",
	classification: {
		safeFlags: [],
		shortFlagAliases: {
			t: { canonical: "tag", type: "value" },
		},
	},
});
