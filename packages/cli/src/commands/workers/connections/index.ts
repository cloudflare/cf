import { readBuildOutput } from "@cloudflare/build-output-utils";
import { getCloudflareComplianceRegion } from "@cloudflare/workers-utils";
import { isConnectionBinding } from "@cloudflare/workers-utils/oidc";
import { provisionIdentityConnectors } from "./provision.js";
import { setupCommand, statusCommand } from "./setup.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
import type { CommandModule } from "yargs";
import { runBuild } from "#commands/build/index.js";
import { resolveBuildOutputAuth } from "#lib/build-output-auth.js";
import {
	buildOutputWorkerOption,
	parseWorkerConfig,
	selectBuildOutputWorker,
	validateBuildOutputAccount,
	validateBuildOutputMode,
} from "#lib/build-output.js";
import { withCloudflareDotEnv } from "#lib/dotenv.js";
import { formatOutput } from "#lib/output.js";
import { withTelemetry } from "#lib/telemetry/index.js";

const command: CommandModule<CommonYargsOptions, CommonYargsOptions> = {
	command: "connections",
	describe:
		"Apply private draft identity connectors from a project's Build Output",
	builder: (yargs) =>
		yargs
			.command(
				withTelemetry(
					{
						command: "apply",
						describe:
							"Create or reconcile account-owned connectors without uploading a Worker",
						builder: (args) =>
							args
								.option("prebuilt", {
									type: "boolean",
									default: false,
									description:
										"Use existing Build Output Specification files without building",
								})
								.option("worker", buildOutputWorkerOption)
								.option("state", {
									type: "string",
									requiresArg: true,
									default: "cloudflare.identity.json",
									description:
										"Durable connector state to retain with infrastructure configuration",
								})
								.option("dry-run", {
									type: "boolean",
									default: false,
									description:
										"Validate configuration without provisioning, registration, consent or tokens",
								}),
						handler: async (argv) => {
							if (argv.local) {
								throw new Error(
									"Use cf dev for isolated local identity services."
								);
							}
							if (!argv.prebuilt) {
								await runBuild(argv.mode, {
									worker: argv.worker,
									dryRun: argv["dry-run"],
								});
							}
							await withCloudflareDotEnv(argv, async () => {
								const { workers, rootConfig } = await readBuildOutput(
									process.cwd()
								);
								validateBuildOutputMode(
									argv.mode,
									rootConfig.buildContext.mode
								);
								validateBuildOutputAccount(
									rootConfig.accountId,
									argv["temporary-account"] === true
								);
								const { wranglerConfig } = parseWorkerConfig(
									selectBuildOutputWorker(workers, argv.worker),
									rootConfig
								);
								const { accountId } = await resolveBuildOutputAuth({
									accountId: rootConfig.accountId,
									complianceRegion:
										getCloudflareComplianceRegion(wranglerConfig),
									dryRun: argv["dry-run"],
									isPreview: rootConfig.buildContext.isPreview,
								});
								const result = await provisionIdentityConnectors(
									wranglerConfig,
									{
										accountId,
										realm: "deployed",
										dryRun: argv["dry-run"],
										stateFile: argv.state,
									}
								);
								formatOutput(
									{
										dryRun: argv["dry-run"],
										state: argv.state,
										connectors: (result.identities ?? [])
											.filter(isConnectionBinding)
											.map((binding) => ({
												binding: binding.binding,
												connectorId: binding.connector_id,
												connectorRevision: binding.connector_revision,
											})),
									},
									{ quiet: argv.quiet }
								);
							});
						},
					},
					{
						command: "workers connections apply",
						classification: { safeFlags: ["dry-run", "prebuilt"] },
					}
				)
			)
			.command(
				withTelemetry(setupCommand, {
					command: "workers connections setup",
					classification: {
						safeFlags: ["prebuilt", "dry-run", "browser", "wait"],
					},
				})
			)
			.command(
				withTelemetry(statusCommand, {
					command: "workers connections status",
					classification: { safeFlags: [] },
				})
			)
			.demandCommand(1, "Please specify a subcommand"),
	handler: () => {},
};
export default command;
