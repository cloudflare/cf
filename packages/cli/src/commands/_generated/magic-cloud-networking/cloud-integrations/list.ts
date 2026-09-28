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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/magic-cloud-networking.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 magic-cloud-networking cloud-integrations list\n\nList Cloud Integrations (Closed Beta)."
		)
		.option("status", { type: "boolean", description: "Status" })
		.option("order-by", {
			type: "string",
			description: 'One of ["updated_at", "id", "cloud_type", "name"].',
		})
		.option("desc", { type: "boolean", description: "Desc" })
		.option("cloudflare", { type: "boolean", description: "Cloudflare" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"providers-list">;
type Query = SdkQuery<"providers-list">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List Cloud Integrations",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-cloud-networking cloud-integrations list",
				classification: {
					safeFlags: ["status", "desc", "cloudflare", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					status: argv["status"],
					order_by: argv["order-by"],
					desc: argv["desc"],
					cloudflare: argv["cloudflare"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf magic-cloud-networking cloud-integrations list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/cloud/providers`,
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
					client.magicCloudNetworking.cloudIntegrations.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
