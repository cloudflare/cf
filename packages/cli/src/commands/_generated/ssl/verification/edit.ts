import operation from "../../_operations/ssl/verification/edit.js";
/**
 * edit command
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "edit <certificate-pack-id>",
	describe: "Update SSL Certificate Pack Validation Method",
	usage:
		"$0 ssl verification edit <certificate-pack-id>\n\nUpdate the configured SSL validation method for a Universal SSL certificate pack, or request another validation attempt for a pack in pending_validation. This endpoint does not change the validation method for advanced certificates. For an active certificate pack, a method-only update saves the method without rerunning validation or replacing the active certificate. For a pack pending validation, changing the method initializes validation using the requested method. Cloudflare may select a different method during automatic renewal. Omit validation_method, send an empty JSON object, or omit the request body to use the current or default method. For a pack in pending_validation, keeping the current method requests another validation attempt. Cloudflare may queue this attempt rather than complete validation before returning. For an active pack, an empty JSON object or a request without a body does not rerun DCV. The response returns the current status and does not guarantee that validation has completed. Available methods depend on the DNS setup and certificate authority. For Google Trust Services, Let's Encrypt, and SSL.com, full DNS setups support txt only, while partial DNS setups support txt or http. HTTP validation does not support wildcard certificates. This endpoint allows four PATCH requests per zone per 60 seconds.",
	flags: {
		"validation-method": {
			kind: "parsed",
			brief: "SSL validation method.",
			optional: true,
			choices: ["http", "cname", "txt", "email"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "validation-method", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"SSL validation settings. Omit validation_method to use the current or default method.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "certificate-pack-id",
			brief: "Certificate Pack UUID.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ssl verification edit",
				classification: {
					safeFlags: ["validation-method", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf ssl verification edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/ssl/verification/${argv["certificate-pack-id"] == null ? "<certificate-pack-id>" : encodeURIComponent(String(argv["certificate-pack-id"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"certificate-pack-id": String(argv["certificate-pack-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										validation_method: argv["validation-method"],
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
							certificate_pack_id: argv["certificate-pack-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					validation_method: argv["validation-method"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						zone_id: zoneId,
						certificate_pack_id: argv["certificate-pack-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
