import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/basin-catalog.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 basin-catalog namespaces list\n\nReturns a list of namespaces in the specified Basin Catalog. Supports hierarchical filtering and pagination for efficient traversal of large namespace hierarchies."
		)
		.option("bucket-name", {
			type: "string",
			description: "Specifies the R2 bucket name.",
			demandOption: true,
		})
		.option("page-token", {
			type: "string",
			description:
				"Opaque pagination token from a previous response.\nUse this to fetch the next page of results.",
		})
		.option("page-size", {
			type: "number",
			description:
				"Maximum number of namespaces to return per page.\nDefaults to 100, maximum 1000.",
		})
		.option("parent", {
			type: "string",
			description:
				'Parent namespace to filter by. Only returns direct children of this namespace.\nFor nested namespaces, use %1F as separator (e.g., "bronze%1Fanalytics").\nOmit this parameter to list top-level namespaces.',
		})
		.option("return-uuids", {
			type: "boolean",
			description:
				"Whether to include namespace UUIDs in the response.\nSet to true to receive the namespace_uuids array.",
		})
		.option("return-details", {
			type: "boolean",
			description:
				"Whether to include additional metadata (timestamps).\nWhen true, response includes created_at and updated_at arrays.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"basin-list-namespaces">;
type Query = SdkQuery<"basin-list-namespaces">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List namespaces in catalog",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "basin-catalog namespaces list",
				classification: {
					safeFlags: ["return-uuids", "return-details", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					page_token: argv["page-token"],
					page_size: argv["page-size"],
					parent: argv["parent"],
					return_uuids: argv["return-uuids"],
					return_details: argv["return-details"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf basin-catalog namespaces list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/basin-catalog/${argv["bucket-name"] == null ? "<bucket-name>" : encodeURIComponent(String(argv["bucket-name"]))}/namespaces`,
						pathParams: { "bucket-name": String(argv["bucket-name"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.basinCatalog.namespaces.list({
						account_id: accountId,
						bucket_name: argv["bucket-name"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
