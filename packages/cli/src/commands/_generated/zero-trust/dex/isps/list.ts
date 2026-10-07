import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust dex isps list\n\nList ISP information observed for a specific device during traceroute tests."
		)
		.option("device-id", {
			type: "string",
			description: "Device-specific ID, given as UUID.",
			demandOption: true,
		})
		.option("page", {
			type: "number",
			description:
				"Page number of paginated results. Mutually exclusive with cursor.",
		})
		.option("per-page", {
			type: "number",
			description: "Number of items per page",
			demandOption: true,
		})
		.option("cursor", {
			type: "string",
			description:
				"Cursor for cursor-based pagination. Mutually exclusive with page.",
		})
		.option("sort-by", {
			type: "string",
			description: "The field to sort results by.",
			choices: ["time_start"],
		})
		.option("sort-order", {
			type: "string",
			description: "The order to sort results.",
			choices: ["ASC", "DESC"],
		})
		.option("from", {
			type: "string",
			description: "Start time for the query in ISO 8601 format.",
		})
		.option("to", {
			type: "string",
			description: "End time for the query in ISO 8601 format.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"dex-endpoints-list-device-isps">;
type Query = SdkQuery<"dex-endpoints-list-device-isps">;

const typedBuilder = withArgTypes<
	{
		"sort-by": Query["sort_by"];
		"sort-order": Query["sort_order"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List device ISPs",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust dex isps list",
				classification: {
					safeFlags: ["sort-by", "sort-order", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					page: argv["page"],
					per_page: argv["per-page"],
					cursor: argv["cursor"],
					sort_by: argv["sort-by"],
					sort_order: argv["sort-order"],
					from: argv["from"],
					to: argv["to"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dex isps list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dex/devices/${argv["device-id"] == null ? "<device-id>" : encodeURIComponent(String(argv["device-id"]))}/isps`,
						pathParams: { "device-id": String(argv["device-id"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.zeroTrust.dex.isps.list({
						account_id: accountId,
						device_id: argv["device-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, {
					successLabel: `Loaded`,
					paginationQuery: queryParams,
				});
			}
		),
};

export default command;
