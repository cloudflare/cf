import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/workflows.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 workflows instances list\n\nLists all instances of a workflow with their execution status."
		)
		.option("workflow-name", {
			type: "string",
			description: "Workflow name",
			demandOption: true,
		})
		.option("page", {
			type: "number",
			description: "Deprecated: use `cursor` for pagination instead.",
		})
		.option("per-page", { type: "number", description: "Per page" })
		.option("cursor", {
			type: "string",
			description:
				"Opaque token for cursor-based pagination. Mutually exclusive with `page`.",
		})
		.option("direction", {
			type: "string",
			description: "Defines the direction for cursor-based pagination.",
			choices: ["asc", "desc"],
		})
		.option("status", {
			type: "string",
			description: "Status",
			choices: [
				"queued",
				"running",
				"paused",
				"errored",
				"terminated",
				"complete",
				"waitingForPause",
				"waiting",
				"rollingBack",
			],
		})
		.option("start", {
			type: "string",
			description: "Accepts ISO 8601 with no timezone offsets and in UTC.",
		})
		.option("end", {
			type: "string",
			description: "Accepts ISO 8601 with no timezone offsets and in UTC.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"wor-list-workflow-instances">;
type Query = SdkQuery<"wor-list-workflow-instances">;

const typedBuilder = withArgTypes<
	{
		direction: Query["direction"];
		status: Query["status"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List of workflow instances",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "workflows instances list",
				classification: {
					safeFlags: ["direction", "status", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					page: argv["page"],
					per_page: argv["per-page"],
					cursor: argv["cursor"],
					direction: argv["direction"],
					status: argv["status"],
					date_start: argv["start"],
					date_end: argv["end"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf workflows instances list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workflows/${argv["workflow-name"] == null ? "<workflow-name>" : encodeURIComponent(String(argv["workflow-name"]))}/instances`,
						pathParams: {
							"workflow-name": String(argv["workflow-name"] ?? ""),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.workflows.instances.list({
						account_id: accountId,
						workflow_name: argv["workflow-name"],
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
