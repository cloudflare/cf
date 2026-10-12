import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/ssl.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 ssl certificate-packs create\n\nFor a given zone, order an advanced certificate pack."
		)
		.option("certificate-authority", {
			type: "string",
			description:
				"Certificate Authority selected for the order.  For information on any certificate authority specific details or restrictions [see this page for more details](https://developers.cloudflare.com/ssl/reference/certificate-authorities).",
			choices: ["google", "lets_encrypt", "ssl_com"],
		})
		.coerce("certificate-authority", (value) =>
			resolveFileToken(value, "certificate-authority", "text")
		)
		.option("cloudflare-branding", {
			type: "boolean",
			description:
				"Whether or not to add Cloudflare Branding for the order.  This will add a subdomain of sni.cloudflaressl.com as the Common Name if set to true.",
		})
		.option("hosts", {
			type: "string",
			array: true,
			description:
				"Comma separated list of valid host names for the certificate packs. Must contain the zone apex, may not contain more than 50 hosts, and may not be empty.",
		})
		.option("type", {
			type: "string",
			description: "Type of certificate pack.",
			choices: ["advanced"],
		})
		.coerce("type", (value) => resolveFileToken(value, "type", "text"))
		.option("validation-method", {
			type: "string",
			description: "Validation Method selected for the order.",
			choices: ["txt", "http", "email"],
		})
		.coerce("validation-method", (value) =>
			resolveFileToken(value, "validation-method", "text")
		)
		.option("validity-days", {
			type: "number",
			description: "Validity Days selected for the order.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"certificate-packs-order-advanced-certificate-manager-certificate-pack">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Order Advanced Certificate Manager Certificate Pack",
	builder,
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
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
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
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.ssl.certificatePacks.create({
							...bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
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

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					certificate_authority: argv["certificate-authority"],
					cloudflare_branding: argv["cloudflare-branding"],
					hosts: argv["hosts"],
					type: argv["type"],
					validation_method: argv["validation-method"],
					validity_days: argv["validity-days"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.ssl.certificatePacks.create({
						...bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
