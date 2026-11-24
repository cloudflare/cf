import operation from "../../_operations/client-side-security/scripts/get.js";
/**
 * get command
 * @generated from apis/overlays/client-side-security.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "get <script-id>",
	describe: "Get a detected script",
	usage:
		"$0 client-side-security scripts get <script-id>\n\nReturns a script detected on the zone by script ID.",
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "script-id", brief: "Identifier", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "client-side-security scripts get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf client-side-security scripts get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/page_shield/scripts/${argv["script-id"] == null ? "<script-id>" : encodeURIComponent(String(argv["script-id"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"script-id": String(argv["script-id"] ?? ""),
						},
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
					client.send(operation, {
						zone_id: zoneId,
						script_id: argv["script-id"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
