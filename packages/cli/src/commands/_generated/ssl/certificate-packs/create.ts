import operation from "../../_operations/ssl/certificate-packs/create.js";
/**
 * create command
 * @generated from apis/overlays/ssl.ts
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
	command: "create",
	describe: "Order Advanced Certificate Manager Certificate Pack",
	usage:
		"$0 ssl certificate-packs create\n\nFor a given zone, order an advanced certificate pack.",
	flags: {
		"certificate-authority": {
			kind: "parsed",
			brief:
				"Certificate Authority selected for the order.  For information on any certificate authority specific details or restrictions [see this page for more details](https://developers.cloudflare.com/ssl/reference/certificate-authorities).",
			optional: true,
			choices: ["google", "lets_encrypt", "ssl_com"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "certificate-authority", "text"),
		},
		"cloudflare-branding": {
			kind: "boolean",
			brief:
				"Whether or not to add Cloudflare Branding for the order.  This will add a subdomain of sni.cloudflaressl.com as the Common Name if set to true.",
			optional: true,
		},
		hosts: {
			kind: "parsed",
			brief:
				"Comma separated list of valid host names for the certificate packs. Must contain the zone apex, may not contain more than 50 hosts, and may not be empty.",
			variadic: true,
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief: "Type of certificate pack.",
			optional: true,
			choices: ["advanced"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
		},
		"validation-method": {
			kind: "parsed",
			brief: "Validation Method selected for the order.",
			optional: true,
			choices: ["txt", "http", "email"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "validation-method", "text"),
		},
		"validity-days": {
			kind: "parsed",
			brief: "Validity Days selected for the order.",
			optional: true,
			parse: Number,
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
				command: "ssl certificate-packs create",
				classification: {
					safeFlags: [
						"certificate-authority",
						"cloudflare-branding",
						"type",
						"validation-method",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["certificate-authority"] === undefined) {
						argv["certificate-authority"] = await promptForRequiredEnumField(
							"certificate-authority",
							"Certificate Authority selected for the order.  For information on any certificate authority specific details or restrictions [see this page for more details](https://developers.cloudflare.com/ssl/reference/certificate-authorities).",
							["google", "lets_encrypt", "ssl_com"] as const
						);
					}
					if (argv["hosts"] === undefined) {
						throw new Error(
							"--hosts is required (or pass --body with this field set)."
						);
					}
					if (argv["type"] === undefined) {
						argv["type"] = await promptForRequiredEnumField(
							"type",
							"Type of certificate pack.",
							["advanced"] as const
						);
					}
					if (argv["validation-method"] === undefined) {
						argv["validation-method"] = await promptForRequiredEnumField(
							"validation-method",
							"Validation Method selected for the order.",
							["txt", "http", "email"] as const
						);
					}
					if (argv["validity-days"] === undefined) {
						throw new Error(
							"--validity-days is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					formatDryRun({
						command: "cf ssl certificate-packs create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/ssl/certificate_packs/order`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										certificate_authority: argv["certificate-authority"],
										cloudflare_branding: argv["cloudflare-branding"],
										hosts: argv["hosts"],
										type: argv["type"],
										validation_method: argv["validation-method"],
										validity_days: argv["validity-days"],
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
					certificate_authority: argv["certificate-authority"],
					cloudflare_branding: argv["cloudflare-branding"],
					hosts: argv["hosts"],
					type: argv["type"],
					validation_method: argv["validation-method"],
					validity_days: argv["validity-days"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
