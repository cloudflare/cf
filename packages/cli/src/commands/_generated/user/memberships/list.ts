import operation from "../../_operations/user/memberships/list.js";
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
	describe: "List Memberships",
	usage:
		"$0 user memberships list\n\nList memberships of accounts the user can access.",
	flags: {
		"account-name": {
			kind: "parsed",
			brief: "Account name",
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of memberships per page.",
			optional: true,
			parse: Number,
		},
		order: {
			kind: "enum",
			brief: "Field to order memberships by.",
			values: ["id", "account.name", "status"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "Direction to order memberships.",
			values: ["asc", "desc"],
			optional: true,
		},
		name: {
			kind: "parsed",
			brief: "Account name",
			optional: true,
			parse: String,
		},
		status: {
			kind: "enum",
			brief: "Status of this membership.",
			values: ["accepted", "pending", "rejected"],
			optional: true,
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
				command: "user memberships list",
				classification: {
					safeFlags: ["order", "direction", "status", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					"account.name": argv["account-name"],
					page: argv["page"],
					per_page: argv["per-page"],
					order: argv["order"],
					direction: argv["direction"],
					name: argv["name"],
					status: argv["status"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf user memberships list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/memberships`,
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
