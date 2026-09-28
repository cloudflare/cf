import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/client-certificates.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 client-certificates edit <client-certificate-id>\n\nIf a API Shield mTLS Client Certificate is in a pending_revocation state, you may reactivate it with this endpoint."
		)
		.positional("client-certificate-id", {
			type: "string",
			description: "Client Certificate Tag",
			demandOption: true,
		})
		.option("reactivate", {
			type: "boolean",
			description: "The reactivate field",
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
	SdkRequest<"client-certificate-for-a-zone-edit-client-certificate">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <client-certificate-id>",
	describe: "Reactivate Client Certificate",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "client-certificates edit",
				classification: {
					safeFlags: ["reactivate", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf client-certificates edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/client_certificates/${argv["client-certificate-id"] == null ? "<client-certificate-id>" : encodeURIComponent(String(argv["client-certificate-id"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"client-certificate-id": String(
								argv["client-certificate-id"] ?? ""
							),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										reactivate: argv["reactivate"],
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
						client.clientCertificates.edit({
							...bodyData,
							zone_id: zoneId,
							client_certificate_id: argv["client-certificate-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					reactivate: argv["reactivate"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.clientCertificates.edit({
						...bodyData,
						zone_id: zoneId,
						client_certificate_id: argv["client-certificate-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
