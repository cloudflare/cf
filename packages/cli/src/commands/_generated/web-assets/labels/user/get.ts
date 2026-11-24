import operation from "../../../_operations/web-assets/labels/user/get.js";
/**
 * get command
 * @generated from apis/overlays/web-assets.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "get <name>",
	describe: "Get a user-defined operation label",
	usage:
		"$0 web-assets labels user get <name>\n\nReturns a user-defined label and the web and API operations associated with it.",
	flags: {
		"with-mapped-resource-counts": {
			kind: "boolean",
			brief: "Include `mapped_resources` for each label",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "name", brief: "The label name", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "web-assets labels user get",
				classification: {
					safeFlags: ["with-mapped-resource-counts", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					with_mapped_resource_counts: argv["with-mapped-resource-counts"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf web-assets labels user get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/api_gateway/labels/user/${argv["name"] == null ? "<name>" : encodeURIComponent(String(argv["name"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							name: String(argv["name"] ?? ""),
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
					client.send(operation, {
						zone_id: zoneId,
						name: argv["name"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
