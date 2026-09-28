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
 * get command
 * @generated from apis/overlays/magic-cloud-networking.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 magic-cloud-networking on-ramps get <onramp-id>\n\nRead an On-ramp (Closed Beta)."
		)
		.positional("onramp-id", {
			type: "string",
			description: "Onramp ID",
			demandOption: true,
		})
		.option("status", { type: "boolean", description: "Status" })
		.option("vpcs", { type: "boolean", description: "Vpcs" })
		.option("post-apply-resources", {
			type: "boolean",
			description: "Post apply resources",
		})
		.option("planned-resources", {
			type: "boolean",
			description: "Planned resources",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"onramps-read">;
type Query = SdkQuery<"onramps-read">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <onramp-id>",
	describe: "Read On-ramp",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-cloud-networking on-ramps get",
				classification: {
					safeFlags: [
						"status",
						"vpcs",
						"post-apply-resources",
						"planned-resources",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					status: argv["status"],
					vpcs: argv["vpcs"],
					post_apply_resources: argv["post-apply-resources"],
					planned_resources: argv["planned-resources"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf magic-cloud-networking on-ramps get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/cloud/onramps/${argv["onramp-id"] == null ? "<onramp-id>" : encodeURIComponent(String(argv["onramp-id"]))}`,
						pathParams: { "onramp-id": String(argv["onramp-id"] ?? "") },
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.magicCloudNetworking.onRamps.get({
						account_id: accountId,
						onramp_id: argv["onramp-id"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
