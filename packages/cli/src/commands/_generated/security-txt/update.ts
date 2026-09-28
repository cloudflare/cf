import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/security-txt.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 security-txt update\n\nUpdates the security.txt file configuration for a zone, which provides security researchers with vulnerability reporting information."
		)
		.option("acknowledgments", {
			type: "string",
			array: true,
			description: "The acknowledgments field",
		})
		.option("canonical", {
			type: "string",
			array: true,
			description: "The canonical field",
		})
		.option("contact", {
			type: "string",
			array: true,
			description: "The contact field",
		})
		.option("enabled", { type: "boolean", description: "The enabled field" })
		.option("encryption", {
			type: "string",
			array: true,
			description: "The encryption field",
		})
		.option("expires", { type: "string", description: "The expires field" })
		.option("hiring", {
			type: "string",
			array: true,
			description: "The hiring field",
		})
		.option("policy", {
			type: "string",
			array: true,
			description: "The policy field",
		})
		.option("preferred-languages", {
			type: "string",
			description: "The preferred_languages field",
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

type Request = SdkRequest<"update-security-txt">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update",
	describe: "Updates security.txt",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "security-txt update",
				classification: {
					safeFlags: ["enabled", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf security-txt update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/security-center/securitytxt`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										acknowledgments: argv["acknowledgments"],
										canonical: argv["canonical"],
										contact: argv["contact"],
										enabled: argv["enabled"],
										encryption: argv["encryption"],
										expires: resolveFileToken(
											argv["expires"] as string | undefined,
											"expires",
											"text"
										),
										hiring: argv["hiring"],
										policy: argv["policy"],
										preferred_languages: resolveFileToken(
											argv["preferred-languages"] as string | undefined,
											"preferred-languages",
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
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.securityTxt.update({
							body: bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					acknowledgments: argv["acknowledgments"],
					canonical: argv["canonical"],
					contact: argv["contact"],
					enabled: argv["enabled"],
					encryption: argv["encryption"],
					expires: resolveFileToken(
						argv["expires"] as string | undefined,
						"expires",
						"text"
					),
					hiring: argv["hiring"],
					policy: argv["policy"],
					preferred_languages: resolveFileToken(
						argv["preferred-languages"] as string | undefined,
						"preferred-languages",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.securityTxt.update({
						body: bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
