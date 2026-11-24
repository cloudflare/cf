import operation from "../../_operations/firewall/lockdowns/list.js";
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
	describe: "List Zone Lockdown rules",
	usage:
		"$0 firewall lockdowns list\n\nFetches Zone Lockdown rules. You can filter the results using several optional parameters.",
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
		"modified-on": {
			kind: "parsed",
			brief: "The timestamp of when the rule was last modified.",
			optional: true,
			parse: String,
		},
		ip: {
			kind: "parsed",
			brief: "A single IP address to search for in existing rules.",
			optional: true,
			parse: String,
		},
		priority: {
			kind: "parsed",
			brief:
				"The priority of the rule to control the processing order. A lower number indicates higher priority. If not provided, any rules with a configured priority will be processed before rules without a priority.",
			optional: true,
			parse: Number,
		},
		"uri-search": {
			kind: "parsed",
			brief:
				"A single URI to search for in the list of URLs of existing rules.",
			optional: true,
			parse: String,
		},
		"ip-range-search": {
			kind: "parsed",
			brief: "A single IP address range to search for in existing rules.",
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
		"created-on": {
			kind: "parsed",
			brief: "The timestamp of when the rule was created.",
			optional: true,
			parse: String,
		},
		"description-search": {
			kind: "parsed",
			brief: "A string to search for in the description of existing rules.",
			optional: true,
			parse: String,
		},
		"ip-search": {
			kind: "parsed",
			brief: "A single IP address to search for in existing rules.",
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
				command: "firewall lockdowns list",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					description: argv["description"],
					modified_on: argv["modified-on"],
					ip: argv["ip"],
					priority: argv["priority"],
					uri_search: argv["uri-search"],
					ip_range_search: argv["ip-range-search"],
					per_page: argv["per-page"],
					created_on: argv["created-on"],
					description_search: argv["description-search"],
					ip_search: argv["ip-search"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf firewall lockdowns list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/firewall/lockdowns`,
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
