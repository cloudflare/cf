import operation from "../_operations/url-normalization/update.js";
/**
 * update command
 * @generated from apis/overlays/url-normalization.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update",
	describe: "Update URL Normalization settings",
	usage:
		"$0 url-normalization update\n\nUpdates the URL Normalization settings.",
	flags: {
		scope: {
			kind: "parsed",
			brief: "The scope of the URL normalization.",
			optional: true,
			choices: ["incoming", "both", "none"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "scope", "text"),
		},
		type: {
			kind: "parsed",
			brief: "The type of URL normalization performed by Cloudflare.",
			optional: true,
			choices: ["cloudflare", "rfc3986"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "A URL Normalization object.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "url-normalization update",
				classification: {
					safeFlags: ["scope", "type", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["scope"] === undefined) {
						argv["scope"] = await promptForRequiredEnumField(
							"scope",
							"The scope of the URL normalization.",
							["incoming", "both", "none"] as const
						);
					}
					if (argv["type"] === undefined) {
						argv["type"] = await promptForRequiredEnumField(
							"type",
							"The type of URL normalization performed by Cloudflare.",
							["cloudflare", "rfc3986"] as const
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					formatDryRun({
						command: "cf url-normalization update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/url_normalization`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										scope: argv["scope"],
										type: argv["type"],
									}),
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
						client.send(operation, { body: bodyData, zone_id: zoneId })
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					scope: argv["scope"],
					type: argv["type"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
