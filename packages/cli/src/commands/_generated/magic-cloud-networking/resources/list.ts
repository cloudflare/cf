import operation from "../../_operations/magic-cloud-networking/resources/list.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * list command
 * @generated from apis/overlays/magic-cloud-networking.ts
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
			"$0 magic-cloud-networking resources list\n\nList resources in the Resource Catalog (Closed Beta)."
		)
		.option("provider-id", { type: "string", description: "Provider ID" })
		.option("resource-type", { type: "string", description: "Resource type" })
		.option("resource-id", { type: "string", description: "Resource ID" })
		.option("region", { type: "string", description: "Region" })
		.option("resource-group", { type: "string", description: "Resource group" })
		.option("managed", { type: "boolean", description: "Managed" })
		.option("search", { type: "string", description: "Search" })
		.option("order-by", {
			type: "string",
			description: 'One of ["id", "resource_type", "region"].',
		})
		.option("desc", { type: "boolean", description: "Desc" })
		.option("per-page", { type: "number", description: "Per page" })
		.option("page", { type: "number", description: "Page" })
		.option("cloudflare", { type: "boolean", description: "Cloudflare" })
		.option("v2", { type: "boolean", description: "V2" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List Resources",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-cloud-networking resources list",
				classification: {
					safeFlags: ["managed", "desc", "cloudflare", "v2", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					provider_id: argv["provider-id"],
					resource_type: argv["resource-type"],
					resource_id: argv["resource-id"],
					region: argv["region"],
					resource_group: argv["resource-group"],
					managed: argv["managed"],
					search: argv["search"],
					order_by: argv["order-by"],
					desc: argv["desc"],
					per_page: argv["per-page"],
					page: argv["page"],
					cloudflare: argv["cloudflare"],
					v2: argv["v2"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf magic-cloud-networking resources list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/cloud/resources`,
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
					client.send(operation, { account_id: accountId, ...queryParams })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
