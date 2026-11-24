import operation from "../../_operations/organizations/shares/list.js";
/**
 * list command
 * @generated from apis/overlays/organizations.ts
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
	describe: "List organization shares",
	usage: "$0 organizations shares list\n\nLists all organization shares.",
	flags: {
		"organization-id": {
			kind: "parsed",
			brief: "Organization identifier.",
			parse: String,
		},
		status: {
			kind: "enum",
			brief: "Filter shares by status.",
			values: ["active", "deleting", "deleted"],
			optional: true,
		},
		order: {
			kind: "enum",
			brief: "Order shares by values in the given field.",
			values: ["name", "created"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "Direction to sort objects.",
			values: ["asc", "desc"],
			optional: true,
		},
		page: {
			kind: "parsed",
			brief: "Page number. Defaults to `1` when omitted.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief:
				"Number of objects to return per page. Defaults to `20` when omitted.",
			optional: true,
			parse: Number,
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
				command: "organizations shares list",
				classification: {
					safeFlags: ["status", "order", "direction", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					status: argv["status"],
					order: argv["order"],
					direction: argv["direction"],
					page: argv["page"],
					per_page: argv["per-page"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf organizations shares list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/organizations/${argv["organization-id"] == null ? "<organization-id>" : encodeURIComponent(String(argv["organization-id"]))}/shares`,
						pathParams: {
							"organization-id": String(argv["organization-id"] ?? ""),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						organization_id: argv["organization-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
