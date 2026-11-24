import operation from "../../_operations/organizations/members/list.js";
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
	describe: "List organization members",
	usage:
		"$0 organizations members list\n\nList memberships for an Organization.",
	flags: {
		"organization-id": {
			kind: "parsed",
			brief: "Organization ID",
			parse: String,
		},
		status: {
			kind: "parsed",
			brief:
				"Filter the list of memberships by membership status. Defaults to `active`, `pending`, and `rejected`; pass `canceled` explicitly to include canceled memberships.",
			variadic: true,
			optional: true,
			choices: ["active", "pending", "rejected", "canceled"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
		},
		"user-email": {
			kind: "parsed",
			brief: "Filter the list of memberships for a specific email.",
			optional: true,
			parse: String,
		},
		"user-email-contains": {
			kind: "parsed",
			brief:
				"Filter the list of memberships for a specific email that contains a substring.",
			optional: true,
			parse: String,
		},
		"user-email-starts-with": {
			kind: "parsed",
			brief:
				"Filter the list of memberships for a specific email that starts with a substring.",
			optional: true,
			parse: String,
		},
		"user-email-ends-with": {
			kind: "parsed",
			brief:
				"Filter the list of memberships for a specific email that ends with a substring.",
			optional: true,
			parse: String,
		},
		"page-token": {
			kind: "parsed",
			brief:
				"An opaque token returned from the last list response that when\nprovided will retrieve the next page.\n\nParameters used to filter the retrieved list must remain in subsequent\nrequests with a page token.",
			optional: true,
			parse: String,
		},
		"page-size": {
			kind: "parsed",
			brief: "The amount of items to return. Defaults to 10.",
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
				command: "organizations members list",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					status: argv["status"],
					"user.email": argv["user-email"],
					"user.email.contains": argv["user-email-contains"],
					"user.email.startsWith": argv["user-email-starts-with"],
					"user.email.endsWith": argv["user-email-ends-with"],
					page_token: argv["page-token"],
					page_size: argv["page-size"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf organizations members list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/organizations/${argv["organization-id"] == null ? "<organization-id>" : encodeURIComponent(String(argv["organization-id"]))}/members`,
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
