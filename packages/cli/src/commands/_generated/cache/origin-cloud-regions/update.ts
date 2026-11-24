import operation from "../../_operations/cache/origin-cloud-regions/update.js";
/**
 * update command
 * @generated from apis/overlays/cache.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <origin-ip>",
	describe: "Create or replace an origin cloud region mapping",
	usage:
		"$0 cache origin-cloud-regions update <origin-ip>\n\nCreates a new IP-to-cloud-region mapping or replaces the existing mapping for the specified IP. PUT is idempotent — calling it repeatedly with the same body produces the same result. The IP path parameter is normalized to canonical form (RFC 5952 for IPv6) before storage. The vendor and region are validated against the list from `GET /zones/{zone_id}/origin/cloud_regions/supported_regions`. Returns 400 if the `origin_ip` in the body does not match the URL path parameter. Returns 403 (code 1164) when the zone has reached the limit of 3,500 IP mappings.",
	flags: {
		region: {
			kind: "parsed",
			brief:
				"Cloud vendor region identifier. Must be a valid region for the specified vendor as returned by the supported_regions endpoint.",
			optional: true,
			parse: String,
		},
		vendor: {
			kind: "parsed",
			brief:
				"Cloud vendor hosting the origin. Must be one of the supported vendors.",
			optional: true,
			choices: ["aws", "azure", "gcp", "oci"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "vendor", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"Request body for creating or replacing an origin cloud region mapping.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "origin-ip",
			brief: "Origin IP address to create or replace.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cache origin-cloud-regions update",
				classification: {
					safeFlags: ["vendor", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["region"] === undefined) {
						argv["region"] = await promptForRequiredField(
							"region",
							"Cloud vendor region identifier. Must be a valid region for the specified vendor as returned by the supported_regions endpoint."
						);
					}
					if (argv["vendor"] === undefined) {
						argv["vendor"] = await promptForRequiredEnumField(
							"vendor",
							"Cloud vendor hosting the origin. Must be one of the supported vendors.",
							["aws", "azure", "gcp", "oci"] as const
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					formatDryRun({
						command: "cf cache origin-cloud-regions update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/origin/cloud_regions/${argv["origin-ip"] == null ? "<origin-ip>" : encodeURIComponent(String(argv["origin-ip"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"origin-ip": String(argv["origin-ip"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										region: resolveFileToken(
											argv["region"] as string | undefined,
											"region",
											"text"
										),
										vendor: argv["vendor"],
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
						client.send(operation, {
							body: bodyData,
							zone_id: zoneId,
							origin_ip: argv["origin-ip"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					region: resolveFileToken(
						argv["region"] as string | undefined,
						"region",
						"text"
					),
					vendor: argv["vendor"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						zone_id: zoneId,
						origin_ip: argv["origin-ip"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
