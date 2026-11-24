import operation from "../../_operations/firewall/ua-rules/list.js";
/**
 * list command
 * @generated from apis/overlays/firewall.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "list",
	describe: "List User Agent Blocking rules",
	usage:
		"$0 firewall ua-rules list\n\nFetches User Agent Blocking rules in a zone. You can filter the results using several optional parameters.",
	flags: {
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
			optional: true,
			parse: Number,
		},
		description: {
			kind: "parsed",
			brief: "A string to search for in the description of existing rules.",
			optional: true,
			parse: String,
		},
		"per-page": {
			kind: "parsed",
			brief:
				"The maximum number of results per page. You can only set the value to `1` or to a multiple of 5 such as `5`, `10`, `15`, or `20`.",
			optional: true,
			parse: Number,
		},
		"user-agent": {
			kind: "parsed",
			brief:
				"A string to search for in the user agent values of existing rules.",
			optional: true,
			parse: String,
		},
		paused: {
			kind: "boolean",
			brief: "When true, indicates that the rule is currently paused.",
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
				command: "firewall ua-rules list",
				classification: {
					safeFlags: ["paused", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					description: argv["description"],
					per_page: argv["per-page"],
					user_agent: argv["user-agent"],
					paused: argv["paused"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf firewall ua-rules list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/firewall/ua_rules`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { zone_id: zoneId, ...queryParams })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
