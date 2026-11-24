import operation from "../../../_operations/api-security/token-validation/rules/list.js";
/**
 * list command
 * @generated from apis/overlays/api-security.ts
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
	describe: "List token validation rules",
	usage:
		"$0 api-security token-validation rules list\n\nLists token validation rules for the zone, with filters for configuration, action, state, ID, and host.",
	flags: {
		"per-page": {
			kind: "parsed",
			brief: "Maximum number of results per page.",
			optional: true,
			parse: Number,
		},
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
			optional: true,
			parse: Number,
		},
		"token-configuration": {
			kind: "parsed",
			brief: "Select rules using any of these token configurations.",
			variadic: true,
			optional: true,
			parse: String,
		},
		action: {
			kind: "enum",
			brief:
				"Action to take on requests that match operations included in `selector` and fail `expression`.",
			values: ["log", "block"],
			optional: true,
		},
		enabled: {
			kind: "boolean",
			brief: "Toggle rule on or off.",
			optional: true,
		},
		id: {
			kind: "parsed",
			brief: "Select rules with these IDs.",
			optional: true,
			parse: String,
		},
		"rule-id": {
			kind: "parsed",
			brief: "Select rules with these IDs.",
			optional: true,
			parse: String,
		},
		host: {
			kind: "parsed",
			brief: "Select rules with this host in `include`.",
			optional: true,
			parse: String,
		},
		hostname: {
			kind: "parsed",
			brief: "Select rules with this host in `include`.",
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
				command: "api-security token-validation rules list",
				classification: {
					safeFlags: ["action", "enabled", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					per_page: argv["per-page"],
					page: argv["page"],
					token_configuration: argv["token-configuration"],
					action: argv["action"],
					enabled: argv["enabled"],
					id: argv["id"],
					rule_id: argv["rule-id"],
					host: argv["host"],
					hostname: argv["hostname"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf api-security token-validation rules list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/token_validation/rules`,
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
