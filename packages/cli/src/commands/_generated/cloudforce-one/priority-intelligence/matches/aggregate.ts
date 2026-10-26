import operation from "../../../_operations/cloudforce-one/priority-intelligence/matches/aggregate.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * aggregate command
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
			"$0 cloudforce-one priority-intelligence matches aggregate <priority-id>\n\nCounts the PIR's matches by tag, attacker, attacker country, target industry, primary indicator, or indicator type: the top values, the number of distinct values, and the matches without a value. Covers the same matches as the matches list, in datasets the account can read now. Tags are grouped case-insensitively and shown with their most common spelling; an event counts once for each of its tags. `indicator` is the first indicator each event was created with. Field values are copied when an event matches; matches still being copied are reported in `matches.pending` and not counted, and matches whose event was already gone when its fields were copied in `matches.missing`. Counts keep the copied values, so an event deleted later stays counted. Requires the Threat Events entitlement."
		)
		.positional("priority-id", {
			type: "string",
			description: "Priority ID",
			demandOption: true,
		})
		.option("aggregate-by", {
			type: "string",
			description:
				"Comma-separated fields to count: tags, attacker, attacker_country, target_industry, indicator, indicator_type. `indicator` is each event's primary indicator, the first one it was created with.",
			demandOption: true,
		})
		.option("limit", {
			type: "number",
			description: "Top values returned per field.",
		})
		.option("since", {
			type: "string",
			description: "Only matches first matched at or after this ISO 8601 time.",
		})
		.option("triage-state", {
			type: "string",
			description: "Only matches in this triage state.",
			choices: ["new", "relevant", "not_relevant"],
		})
		.option("include-backfill", {
			type: "string",
			description:
				"Include matches from the 30 days before activation. Defaults to true.",
			choices: ["true", "false"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "aggregate <priority-id>",
	describe: "Count a priority intelligence requirement's matched events",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one priority-intelligence matches aggregate",
				classification: {
					safeFlags: ["triage-state", "include-backfill", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					aggregate_by: argv["aggregate-by"],
					limit: argv["limit"],
					since: argv["since"],
					triage_state: argv["triage-state"],
					include_backfill: argv["include-backfill"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command:
							"cf cloudforce-one priority-intelligence matches aggregate",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/priority-intelligence/${argv["priority-id"] == null ? "<priority-id>" : encodeURIComponent(String(argv["priority-id"]))}/matches/aggregate`,
						pathParams: { "priority-id": String(argv["priority-id"] ?? "") },
						query: queryParams,
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
						priority_id: argv["priority-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
