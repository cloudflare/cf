import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/ssl.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 ssl verification edit <certificate-pack-id>\n\nEdit SSL validation method for a certificate pack. A PATCH request will request an immediate validation check on any certificate, and return the updated status. If a validation method is provided, the validation will be immediately attempted using that method."
		)
		.positional("certificate-pack-id", {
			type: "string",
			description: "Certificate Pack UUID.",
			demandOption: true,
		})
		.option("validation-method", {
			type: "string",
			description: "Desired validation method.",
			choices: ["http", "cname", "txt", "email"],
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
	SdkRequest<"ssl-verification-edit-ssl-certificate-pack-validation-method">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <certificate-pack-id>",
	describe: "Edit SSL Certificate Pack Validation Method",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ssl verification edit",
				classification: {
					safeFlags: ["validation-method", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf ssl verification edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/ssl/verification/${argv["certificate-pack-id"] == null ? "<certificate-pack-id>" : encodeURIComponent(String(argv["certificate-pack-id"]))}`,
						pathParams: {
							"certificate-pack-id": String(argv["certificate-pack-id"] ?? ""),
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										validation_method: resolveFileToken(
											argv["validation-method"] as string | undefined,
											"validation-method",
											"text"
										),
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
					const result = await withProgress(`Updating`, async () =>
						client.ssl.verification.edit({
							...bodyData,
							zone_id: zoneId,
							certificate_pack_id: argv["certificate-pack-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["validation-method"] === undefined) {
					argv["validation-method"] = await promptForRequiredEnumField(
						"validation-method",
						"Desired validation method.",
						["http", "cname", "txt", "email"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					validation_method: resolveFileToken(
						argv["validation-method"] as string | undefined,
						"validation-method",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.ssl.verification.edit({
						...bodyData,
						zone_id: zoneId,
						certificate_pack_id: argv["certificate-pack-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
