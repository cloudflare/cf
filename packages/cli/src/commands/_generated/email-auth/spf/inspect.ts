import operation from "../../_operations/email-auth/spf/inspect.js";
/**
 * inspect command
 * @generated from apis/overlays/email-auth.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "inspect",
	describe: "Inspect SPF Record",
	usage:
		"$0 email-auth spf inspect\n\nInspects a specific SPF TXT record and returns a parsed tree structure in the spflimit-worker format. The record ID must be provided via the `id` query parameter. Returns a recursive tree showing: - Parsed components with their qualifiers and types - Nested includes recursively resolved within components - Per-component and total lookup counts - Detailed error information with context",
	flags: {
		id: {
			kind: "parsed",
			brief: "DNS record ID (rec_tag) to inspect",
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
				command: "email-auth spf inspect",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					id: argv["id"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf email-auth spf inspect",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/email/auth/spf/inspect`,
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
