import { randomUUID } from "node:crypto";
import { setTimeout } from "node:timers/promises";
import { readBuildOutput } from "@cloudflare/build-output-utils";
import {
	getCloudflareComplianceRegion,
	openInBrowser,
} from "@cloudflare/workers-utils";
import { isConnectionBinding } from "@cloudflare/workers-utils/oidc";
import {
	privateConnectorClient,
	provisionIdentityConnectors,
} from "./provision.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { Argv, CommandModule } from "yargs";
import { runBuild } from "#commands/build/index.js";
import { resolveBuildOutputAuth } from "#lib/build-output-auth.js";
import {
	buildOutputWorkerOption,
	parseWorkerConfig,
	selectBuildOutputWorker,
	validateBuildOutputAccount,
	validateBuildOutputMode,
} from "#lib/build-output.js";
import { getComplianceRegion } from "#lib/context.js";
import { createDeployContext } from "#lib/deploy-context.js";
import { withCloudflareDotEnv } from "#lib/dotenv.js";
import { formatOutput } from "#lib/output.js";
import { log } from "#lib/ui/log.js";
function builder(args: Argv<CommonYargsOptions>) {
	return args
		.positional("binding", {
			type: "string",
			demandOption: true,
			description: "App-owned identity binding in Build Output",
		})
		.option("prebuilt", {
			type: "boolean",
			default: false,
			description: "Use existing Build Output without building",
		})
		.option("worker", buildOutputWorkerOption)
		.option("operation", {
			type: "string",
			description: "Retained setup UUID to resume after a lost response",
		})
		.option("preview-id", {
			type: "string",
			description:
				"Actual deployed Preview ID; required for Preview Build Output",
		})
		.option("state", {
			type: "string",
			default: "cloudflare.identity.json",
			description: "Retained connector infrastructure state",
		})
		.option("browser", {
			type: "boolean",
			default: true,
			description: "Open the account-authenticated hosted setup page",
		})
		.option("wait", {
			type: "boolean",
			default: true,
			description: "Wait for safe completion status",
		})
		.option("dry-run", {
			type: "boolean",
			default: false,
			description:
				"Validate without registration, consent, browser or token side effects",
		});
}
export const setupCommand: CommandModule<
	CommonYargsOptions,
	InferArgs<typeof builder>
> = {
	command: "setup <binding>",
	describe: "Add a new app-owned account through authenticated hosted consent",
	builder,
	handler: async (argv) => {
		if (argv.local) {
			throw new Error(
				"Hosted account setup uses account authentication. Use the deterministic local consent fixture with cf dev."
			);
		}
		const operationId = argv.operation ?? randomUUID();
		if (
			!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(
				operationId
			)
		) {
			throw new Error("--operation must be a UUID.");
		}
		if (!argv.prebuilt) {
			await runBuild(
				argv.mode,
				{
					worker: argv.worker,
					dryRun: argv["dry-run"],
				},
				argv["preview-id"] ? { isPreview: true } : undefined
			);
		}
		await withCloudflareDotEnv(argv, async () => {
			const { workers, rootConfig } = await readBuildOutput(process.cwd());
			validateBuildOutputAccount(
				rootConfig.accountId,
				argv["temporary-account"] === true
			);
			validateBuildOutputMode(argv.mode, rootConfig.buildContext.mode);
			if (rootConfig.buildContext.isPreview !== Boolean(argv["preview-id"])) {
				throw new Error(
					"Preview Build Output requires --preview-id from cf previews deploy; deployed Build Output must omit it."
				);
			}

			const { wranglerConfig } = parseWorkerConfig(
				selectBuildOutputWorker(workers, argv.worker),
				rootConfig
			);
			const selected = (wranglerConfig.identities ?? []).find(
				(candidate) => candidate.binding === argv.binding
			);
			if (
				!selected ||
				!isConnectionBinding(selected) ||
				selected.selection === "customer"
			) {
				throw new Error(
					"Select an app-owned saved-account identity binding. Customer consent belongs in the application session."
				);
			}
			const { accountId, authToken } = await resolveBuildOutputAuth({
				accountId: rootConfig.accountId,
				complianceRegion: getCloudflareComplianceRegion(wranglerConfig),
				isPreview: rootConfig.buildContext.isPreview,
				dryRun: argv["dry-run"],
			});
			const config = await provisionIdentityConnectors(wranglerConfig, {
				accountId,
				realm: "deployed",
				dryRun: argv["dry-run"],
				stateFile: argv.state,
			});
			if (argv["dry-run"]) {
				formatOutput(
					{ dryRun: true, binding: argv.binding, operationId },
					{ quiet: argv.quiet }
				);
				return;
			}
			if (!accountId) {
				throw new Error("Account authentication is required for app setup.");
			}
			const selectedBinding = (config.identities ?? []).find(
				(binding) => binding.binding === argv.binding
			);
			if (
				!selectedBinding ||
				!isConnectionBinding(selectedBinding) ||
				!selectedBinding.connector_id ||
				!selectedBinding.connector_revision
			) {
				throw new Error("Connector apply returned no attachment.");
			}
			const client = privateConnectorClient(accountId);
			// Report the operation before mutation so an interrupted terminal can resume it.
			log.info(
				`Account setup operation: ${operationId}`,
				`cf workers connections status ${operationId}`
			);
			const setup = await client.startAppSetup(operationId, {
				connectorId: selectedBinding.connector_id,
				revision: selectedBinding.connector_revision,
				permissions: selectedBinding,
				execution: rootConfig.buildContext.isPreview ? "preview" : "deployed",
				...(argv["preview-id"] ? { previewId: argv["preview-id"] } : {}),
			});
			log.info(`Complete account setup in your browser: ${setup.url}`);
			if (argv.browser) {
				await openInBrowser(setup.url, createDeployContext(authToken).logger);
			}
			if (!argv.wait) {
				formatOutput(
					{ ...setup, binding: argv.binding },
					{ quiet: argv.quiet }
				);
				return;
			}
			for (;;) {
				const status = await client.appSetupStatus(operationId);
				if (
					!["created", "starting", "consent"].includes(status.state) ||
					Date.now() >= setup.expiresAt
				) {
					formatOutput(status, { quiet: argv.quiet });
					return;
				}
				await setTimeout(1000);
			}
		});
	},
};
function statusBuilder(args: Argv<CommonYargsOptions>) {
	return args
		.option("dry-run", {
			type: "boolean",
			default: false,
			description:
				"Validate arguments without account authentication or status requests",
		})
		.positional("operation", {
			type: "string",
			demandOption: true,
			description: "Setup operation UUID",
		})
		.option("account-id", {
			type: "string",
			description: "Initiating Cloudflare account",
		});
}
export const statusCommand: CommandModule<
	CommonYargsOptions,
	InferArgs<typeof statusBuilder>
> = {
	command: "status <operation>",
	describe: "Read credential-free app setup status for the initiating account",
	builder: statusBuilder,
	handler: async (argv) =>
		withCloudflareDotEnv(argv, async () => {
			if (
				!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(
					argv.operation
				)
			) {
				throw new Error("Invalid setup operation ID.");
			}
			if (argv["dry-run"]) {
				formatOutput(
					{ dryRun: true, operationId: argv.operation },
					{ quiet: argv.quiet }
				);
				return;
			}
			if (argv.local) {
				throw new Error("Hosted setup status requires account authentication.");
			}
			const { accountId } = await resolveBuildOutputAuth({
				accountId: argv["account-id"],
				complianceRegion: await getComplianceRegion(),
			});
			if (!accountId) {
				throw new Error(
					"Account authentication is required for app setup status."
				);
			}
			formatOutput(
				await privateConnectorClient(accountId).appSetupStatus(argv.operation),
				{ quiet: argv.quiet }
			);
		}),
};
