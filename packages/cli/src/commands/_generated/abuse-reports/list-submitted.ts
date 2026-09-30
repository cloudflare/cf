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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list-submitted command
 * @generated from apis/overlays/abuse-reports.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 abuse-reports list-submitted\n\nList abuse reports submitted by the account."
		)
		.option("page", {
			type: "number",
			description: "Page of submitted reports to return.",
		})
		.option("per-page", {
			type: "number",
			description: "Number of submitted reports per page.",
		})
		.check((argv) => {
			if (argv["per-page"] !== undefined && !Number.isFinite(argv["per-page"]))
				throw new Error("--per-page must be a number");
			return true;
		})
		.option("sort", {
			type: "string",
			description:
				"A property and direction to sort by (id, cdate, domain, type, status).",
		})
		.option("id", { type: "string", description: "Filter by report code." })
		.option("domain", {
			type: "string",
			description:
				"Filter by reported domain. This parameter can be specified multiple times.",
		})
		.option("created-before", {
			type: "string",
			description: "Return reports submitted before this time.",
		})
		.option("created-after", {
			type: "string",
			description: "Return reports submitted after this time.",
		})
		.option("status", {
			type: "string",
			description:
				"Filter by submitter-facing status. This parameter can be specified multiple times.",
		})
		.option("type", {
			type: "string",
			description:
				"Filter by report type. This parameter can be specified multiple times.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"ListSubmittedAbuseReports">;
type Query = SdkQuery<"ListSubmittedAbuseReports">;

const typedBuilder = withArgTypes<
	{
		status: Query["status"];
		type: Query["type"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list-submitted",
	describe: "List submitted abuse reports",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "abuse-reports list-submitted",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					page: argv["page"],
					per_page: argv["per-page"],
					sort: argv["sort"],
					id: argv["id"],
					domain: argv["domain"],
					created_before: argv["created-before"],
					created_after: argv["created-after"],
					status: argv["status"],
					type: argv["type"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf abuse-reports list-submitted",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/abuse-reports/submitted`,
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
					client.abuseReports.listSubmitted({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
