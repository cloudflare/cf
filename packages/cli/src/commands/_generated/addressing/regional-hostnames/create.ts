import operation from "../../_operations/addressing/regional-hostnames/create.js";
/**
 * create command
 * @generated from apis/overlays/addressing.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Create Regional Hostname",
	usage:
		"$0 addressing regional-hostnames create\n\nCreate a new Regional Hostname entry. Cloudflare will only use data centers that are physically located within the chosen region to decrypt and service HTTPS traffic. Learn more about [Regional Services](https://developers.cloudflare.com/data-localization/regional-services/get-started/).",
	flags: {
		hostname: {
			kind: "parsed",
			brief:
				"DNS hostname to be regionalized, must be a subdomain of the zone. Wildcards are supported for one level, e.g `*.example.com`",
			optional: true,
			parse: String,
		},
		"region-key": {
			kind: "parsed",
			brief: "Identifying key for the region",
			optional: true,
			parse: String,
		},
		routing: {
			kind: "parsed",
			brief: "Configure which routing method to use for the regional hostname",
			default: "dns",
			parse: String,
		},
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
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "addressing regional-hostnames create",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["hostname"] === undefined) {
						argv["hostname"] = await promptForRequiredField(
							"hostname",
							"DNS hostname to be regionalized, must be a subdomain of the zone. Wildcards are supported for one level, e.g \`*.example.com\`"
						);
					}
					if (argv["region-key"] === undefined) {
						argv["region-key"] = await promptForRequiredField(
							"region-key",
							"Identifying key for the region"
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					formatDryRun({
						command: "cf addressing regional-hostnames create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/addressing/regional_hostnames`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										hostname: resolveFileToken(
											argv["hostname"] as string | undefined,
											"hostname",
											"text"
										),
										region_key: resolveFileToken(
											argv["region-key"] as string | undefined,
											"region-key",
											"text"
										),
										routing: resolveFileToken(
											argv["routing"] as string | undefined,
											"routing",
											"text"
										),
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
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, zone_id: zoneId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					hostname: resolveFileToken(
						argv["hostname"] as string | undefined,
						"hostname",
						"text"
					),
					region_key: resolveFileToken(
						argv["region-key"] as string | undefined,
						"region-key",
						"text"
					),
					routing: resolveFileToken(
						argv["routing"] as string | undefined,
						"routing",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
