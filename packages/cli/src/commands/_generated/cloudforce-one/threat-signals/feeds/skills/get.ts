import operation from "../../../../_operations/cloudforce-one/threat-signals/feeds/skills/get.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * get command
 * @generated from apis/overlays/cloudforce-one.ts
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
			"$0 cloudforce-one threat-signals feeds skills get <feed-id>\n\nRetrieves active non-IOC-context Managed Default Skills followed by active Custom Skills assigned to the feed, with each entry's source. Free Threat Signals accounts receive only those Managed Default Skills."
		)
		.positional("feed-id", {
			type: "string",
			description: "UUID of the Threat Signals feed",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <feed-id>",
	describe: "Get Threat Signals feed skills",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-signals feeds skills get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one threat-signals feeds skills get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/threat-signals/feeds/${argv["feed-id"] == null ? "<feed-id>" : encodeURIComponent(String(argv["feed-id"]))}/skills`,
						pathParams: { "feed-id": String(argv["feed-id"] ?? "") },
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						account_id: accountId,
						feed_id: argv["feed-id"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
