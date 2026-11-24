import operation from "../../../../_operations/web-assets/labels/managed/operations/update.js";
/**
 * update command
 * @generated from apis/overlays/web-assets.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <name>",
	describe: "Replace operations attached to a managed label",
	usage:
		"$0 web-assets labels managed operations update <name>\n\nReplaces the complete set of web and API operations attached to the managed label.",
	flags: {
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [{ placeholder: "name", brief: "The label name", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "web-assets labels managed operations update",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.body === undefined) {
					throw new Error(
						"--body is required for this command. Pass --body '<json>' or --body @path/to/file.json."
					);
				}
				if (argv.dryRun) {
					formatDryRun({
						command: "cf web-assets labels managed operations update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/api_gateway/labels/managed/${argv["name"] == null ? "<name>" : encodeURIComponent(String(argv["name"]))}/resources/operation`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							name: String(argv["name"] ?? ""),
						},
						bodyKind: "json",
						body: argv.body !== undefined ? parseBody(argv.body) : undefined,
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							zone_id: zoneId,
							name: argv["name"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
			}
		),
});

export default command;
