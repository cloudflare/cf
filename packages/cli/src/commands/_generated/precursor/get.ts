/**
 * get command
 * @generated from apis/overlays/precursor.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId, requestApi } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "get",
	describe: "Get Zone Precursor Config",
	usage:
		"$0 precursor get\n\nRetrieve a zone's Precursor configuration: the detection `mode`, whether to `show_interstitial`, and the ordered list of `rules`.",
	flags: {
		"cloudflare-version": {
			kind: "parsed",
			brief: "Selects the split Precursor API schema.",
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
				command: "precursor get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const headers: Record<string, string> = {};
				if (argv["cloudflare-version"] !== undefined)
					headers["Cloudflare-Version"] = String(argv["cloudflare-version"]);
				if (argv.dryRun) {
					formatDryRun({
						command: "cf precursor get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/precursor`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
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
					requestApi<unknown>(
						client,
						"GET",
						`/zones/${argv.zoneId}/precursor`,
						{ headers: Object.keys(headers).length > 0 ? headers : undefined }
					)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
