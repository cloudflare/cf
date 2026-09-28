import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust dex devices list\n\nList details of devices using WARP."
		)
		.option("to", {
			type: "string",
			description:
				"End of the time range to query. Timestamp can be provided in ISO 8601 datetime format or milliseconds since epoch.",
			demandOption: true,
		})
		.option("from", {
			type: "string",
			description:
				"Start of the time range to query. Timestamp can be provided in ISO 8601 datetime format or milliseconds since epoch.",
			demandOption: true,
		})
		.option("page", {
			type: "number",
			description: "Page number of paginated results.",
			demandOption: true,
		})
		.option("per-page", {
			type: "number",
			description: "Number of results per page.",
			demandOption: true,
		})
		.option("sort-by", {
			type: "string",
			description: "Dimension to sort results by.",
			choices: [
				"colo",
				"device_id",
				"mode",
				"platform",
				"status",
				"timestamp",
				"version",
			],
		})
		.option("colo", {
			type: "string",
			description: "Cloudflare colo airport code.",
		})
		.option("device-id", {
			type: "string",
			description: "Device-specific ID, given as UUID.",
		})
		.option("device-mode", {
			type: "string",
			description: "The mode under which the WARP client is run.",
		})
		.option("status", { type: "string", description: "Network status." })
		.option("platform", { type: "string", description: "Operating system." })
		.option("warp-version", {
			type: "string",
			description: "WARP client version.",
		})
		.option("source", {
			type: "string",
			description:
				"Source:\n  * `hourly` - device details aggregated hourly, up to 7 days prior\n  * `last_seen` - device details, up to 60 minutes prior. Time windows exceeding 60 minutes will be rejected from June 1st, 2026. Please use 'hourly' or 'raw' instead for longer time ranges.\n  * `raw` - device details, up to 7 days prior",
			choices: ["last_seen", "hourly", "raw"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"dex-fleet-status-devices">;
type Query = SdkQuery<"dex-fleet-status-devices">;

const typedBuilder = withArgTypes<
	{
		"sort-by": Query["sort_by"];
		source: Query["source"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List details of devices using WARP.",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust dex devices list",
				classification: {
					safeFlags: ["sort-by", "source", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					to: argv["to"],
					from: argv["from"],
					page: argv["page"],
					per_page: argv["per-page"],
					sort_by: argv["sort-by"],
					colo: argv["colo"],
					device_id: argv["device-id"],
					mode: argv["device-mode"],
					status: argv["status"],
					platform: argv["platform"],
					version: argv["warp-version"],
					source: argv["source"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dex devices list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dex/fleet-status/devices`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.zeroTrust.dex.devices.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
