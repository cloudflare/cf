import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * get command
 * @generated from apis/overlays/dls.ts
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
		.usage("$0 dls regions get <region-id>\n\nGet a DLS region")
		.positional("region-id", {
			type: "string",
			description:
				"UUID of the region (custom or managed) or region_key of a managed region.",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"publicGetRegion">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <region-id>",
	describe: "Get a DLS region",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "dls regions get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf dls regions get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dls/regions/${argv["region-id"] == null ? "<region-id>" : encodeURIComponent(String(argv["region-id"]))}`,
						pathParams: { "region-id": String(argv["region-id"] ?? "") },
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.dls.regions.get({
						account_id: accountId,
						region_id: argv["region-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
