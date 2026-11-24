import operation from "../../../_operations/user/billing/history/list.js";
/**
 * list command
 * @generated from apis/overlays/user.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "list",
	describe: "Billing History Details",
	usage:
		"$0 user billing history list\n\nAccesses your billing history object.",
	flags: {
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of items per page.",
			optional: true,
			parse: Number,
		},
		order: {
			kind: "enum",
			brief: "Field to order billing history by.",
			values: ["type", "occurred_at", "action"],
			optional: true,
		},
		"occurred-at": {
			kind: "parsed",
			brief: "When the billing item was created.",
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief: "The billing item type.",
			optional: true,
			parse: String,
		},
		action: {
			kind: "parsed",
			brief: "The billing item action.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "user billing history list",
				classification: {
					safeFlags: ["order", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					per_page: argv["per-page"],
					order: argv["order"],
					occurred_at: argv["occurred-at"],
					type: argv["type"],
					action: argv["action"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf user billing history list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/user/billing/history`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, queryParams)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
