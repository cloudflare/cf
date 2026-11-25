import operation from "../../../_operations/zero-trust/risk-scoring/event-clusters/list.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
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
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust risk-scoring event-clusters list\n\nLists the risk events of one user, grouped by calendar day in the requested time zone. Each cluster contains at most 25 events, oldest first. The time range is at most 30 days. The server reads risk events from at most 180 days before the current time. Returns 404 when the request reaches a server outside of the configured region of the account."
		)
		.option("user-id", {
			type: "string",
			description: "User ID (UUID v4).",
			demandOption: true,
		})
		.option("timestamp-between", {
			type: "string",
			description:
				"Time range as <start_seconds>:<end_seconds> in Unix epoch seconds. The default is the last\n7 days. The server returns 400 when the range is longer than 30 days.",
		})
		.option("time-zone", {
			type: "string",
			description:
				"IANA time zone name that sets the calendar day of each cluster.",
		})
		.option("page", {
			type: "number",
			description: "Page number, starting at 1.",
		})
		.option("per-page", {
			type: "number",
			description:
				"Number of clusters per page. The server uses 10 for a larger value.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List risk event clusters for a specific user",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust risk-scoring event-clusters list",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					"timestamp.between": argv["timestamp-between"],
					time_zone: argv["time-zone"],
					page: argv["page"],
					per_page: argv["per-page"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust risk-scoring event-clusters list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/zt_risk_scoring/${argv["user-id"] == null ? "<user-id>" : encodeURIComponent(String(argv["user-id"]))}/event_clusters`,
						pathParams: { "user-id": String(argv["user-id"] ?? "") },
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
						user_id: argv["user-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
