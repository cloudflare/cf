import operation from "../../../_operations/zero-trust/dex/warp-change-events/list.js";
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
			"$0 zero-trust dex warp-change-events list\n\nList WARP configuration and enablement toggle change events by device."
		)
		.option("page", {
			type: "number",
			description: "Page number of paginated results.",
			demandOption: true,
		})
		.option("per-page", {
			type: "number",
			description: "Number of results per page.",
			demandOption: true,
		})
		.option("from", {
			type: "string",
			description:
				"Start time for the query in ISO (RFC3339 - ISO 8601) format.",
			demandOption: true,
		})
		.option("to", {
			type: "string",
			description: "End time for the query in ISO (RFC3339 - ISO 8601) format.",
			demandOption: true,
		})
		.option("type", {
			type: "string",
			description: "Filter events by type 'config' or 'toggle'.",
			choices: ["config", "toggle"],
		})
		.option("toggle", {
			type: "string",
			description:
				"Filter events by type toggle value. Applicable to type='toggle' events only.",
			choices: ["on", "off"],
		})
		.option("config-name", {
			type: "string",
			description:
				"Filter events by WARP configuration name changed from or to. Applicable to type='config' events only.",
		})
		.option("account-name", {
			type: "string",
			description: "Filter events by account name.",
		})
		.option("sort-order", {
			type: "string",
			description: "Sort response by event timestamp.",
			choices: ["ASC", "DESC"],
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
	describe: "List WARP change events.",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust dex warp-change-events list",
				classification: {
					safeFlags: ["type", "toggle", "sort-order", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					per_page: argv["per-page"],
					from: argv["from"],
					to: argv["to"],
					type: argv["type"],
					toggle: argv["toggle"],
					config_name: argv["config-name"],
					account_name: argv["account-name"],
					sort_order: argv["sort-order"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dex warp-change-events list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dex/warp-change-events`,
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
