import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/cloudforce-one.ts
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
			"$0 cloudforce-one events dataset indicators relationships list\n\nReturns sparse relationship edges. Optionally hydrate related entities via `expand`."
		)
		.option("dataset-id", {
			type: "string",
			description: "Dataset UUID.",
			demandOption: true,
		})
		.option("indicator-id", {
			type: "string",
			description: "Indicator UUID.",
			demandOption: true,
		})
		.option("search", {
			type: "string",
			description:
				'JSON array of {field, op, value} filters, AND-combined. Fields: entityType (other-end type), type (relationship type), confidence (0–100), metadata.<key>. Example: [{"field":"type","op":"equals","value":"appears_in"},{"field":"confidence","op":"gte","value":50}]',
		})
		.option("expand", {
			type: "string",
			description:
				"Comma-separated entity types to hydrate (event, indicator, tag).",
		})
		.option("cursor", {
			type: "string",
			description: "Keyset cursor from a previous page.",
		})
		.option("page-size", {
			type: "number",
			description: "Page size (1–100, default 25).",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"get_IndicatorRelationshipsList">;
type Query = SdkQuery<"get_IndicatorRelationshipsList">;

const typedBuilder = withArgTypes<
	{
		search: Query["search"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List relationships for an indicator",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one events dataset indicators relationships list",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					search: argv["search"],
					expand: argv["expand"],
					cursor: argv["cursor"],
					pageSize: argv["page-size"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command:
							"cf cloudforce-one events dataset indicators relationships list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/dataset/${argv["dataset-id"] == null ? "<dataset-id>" : encodeURIComponent(String(argv["dataset-id"]))}/indicators/${argv["indicator-id"] == null ? "<indicator-id>" : encodeURIComponent(String(argv["indicator-id"]))}/relationships`,
						pathParams: {
							"dataset-id": String(argv["dataset-id"] ?? ""),
							"indicator-id": String(argv["indicator-id"] ?? ""),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.cloudforceOne.events.dataset.indicators.relationships.list({
						account_id: accountId,
						dataset_id: argv["dataset-id"],
						indicator_id: argv["indicator-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
