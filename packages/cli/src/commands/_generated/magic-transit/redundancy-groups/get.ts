import operation from "../../_operations/magic-transit/redundancy-groups/get.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * get command
 * @generated from apis/overlays/magic-transit.ts
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
			"$0 magic-transit redundancy-groups get <redundancy-group-id>\n\nGets details for a specific redundancy group, including full member tunnel data."
		)
		.positional("redundancy-group-id", {
			type: "string",
			description: "Identifier",
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
	command: "get <redundancy-group-id>",
	describe: "Get Redundancy Group Details",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-transit redundancy-groups get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf magic-transit redundancy-groups get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/redundancy_groups/${argv["redundancy-group-id"] == null ? "<redundancy-group-id>" : encodeURIComponent(String(argv["redundancy-group-id"]))}`,
						pathParams: {
							"redundancy-group-id": String(argv["redundancy-group-id"] ?? ""),
						},
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
						redundancy_group_id: argv["redundancy-group-id"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
