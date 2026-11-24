import operation from "../../_operations/user/audit-logs/list.js";
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
	describe: "Get user audit logs",
	usage:
		"$0 user audit-logs list\n\nGets a list of audit logs for a user account. Can be filtered by who made the change, on which zone, and the timeframe of the change.",
	flags: {
		id: {
			kind: "parsed",
			brief: "Finds a specific log by its ID.",
			optional: true,
			parse: String,
		},
		export: {
			kind: "boolean",
			brief: "Indicates that this request is an export of logs in CSV format.",
			optional: true,
		},
		"action-type": {
			kind: "parsed",
			brief: "Filters by the action type.",
			optional: true,
			parse: String,
		},
		"actor-ip": {
			kind: "parsed",
			brief:
				"Filters by the IP address of the request that made the change by specific IP address or valid CIDR Range.",
			optional: true,
			parse: String,
		},
		"actor-email": {
			kind: "parsed",
			brief: "Filters by the email address of the actor that made the change.",
			optional: true,
			parse: String,
		},
		since: { kind: "parsed", brief: "Since", optional: true, parse: String },
		before: { kind: "parsed", brief: "Before", optional: true, parse: String },
		"zone-name": {
			kind: "parsed",
			brief: "Filters by the name of the zone associated to the change.",
			optional: true,
			parse: String,
		},
		direction: {
			kind: "enum",
			brief: "Changes the direction of the chronological sorting.",
			values: ["desc", "asc"],
			optional: true,
		},
		"per-page": {
			kind: "parsed",
			brief: "Sets the number of results to return per page.",
			optional: true,
			parse: Number,
		},
		page: {
			kind: "parsed",
			brief: "Defines which page of results to return.",
			optional: true,
			parse: Number,
		},
		"hide-user-logs": {
			kind: "boolean",
			brief: "Indicates whether or not to hide user level audit logs.",
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
				command: "user audit-logs list",
				classification: {
					safeFlags: ["export", "direction", "hide-user-logs", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					id: argv["id"],
					export: argv["export"],
					"action.type": argv["action-type"],
					"actor.ip": argv["actor-ip"],
					"actor.email": argv["actor-email"],
					since: argv["since"],
					before: argv["before"],
					"zone.name": argv["zone-name"],
					direction: argv["direction"],
					per_page: argv["per-page"],
					page: argv["page"],
					hide_user_logs: argv["hide-user-logs"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf user audit-logs list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/user/audit_logs`,
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
