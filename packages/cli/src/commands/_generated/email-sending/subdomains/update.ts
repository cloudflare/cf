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
 * update command
 * @generated from apis/overlays/email-sending.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 email-sending subdomains update <subdomain-id>\n\nUpdates the activity-log preview preference for a sending subdomain."
		)
		.positional("subdomain-id", {
			type: "string",
			description: "Sending subdomain identifier.",
			demandOption: true,
		})
		.option("drop-suppressed-recipients", {
			type: "boolean",
			description:
				"Whether a send request that includes a recipient suppressed on\nthis subdomain drops that recipient and still delivers to the\nrest, instead of failing the entire request.\n",
		})
		.option("preview-enabled", {
			type: "boolean",
			description:
				"Whether sent messages from this subdomain can be previewed in the activity log.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"At least one of \`preview_enabled\` or \`drop_suppressed_recipients\` must be provided. A field omitted from the request body is left unchanged. ",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"email-sending-subdomains-update-sending-subdomain">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <subdomain-id>",
	describe: "Update a sending subdomain",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-sending subdomains update",
				classification: {
					safeFlags: [
						"drop-suppressed-recipients",
						"preview-enabled",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf email-sending subdomains update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/email/sending/subdomains/${argv["subdomain-id"] == null ? "<subdomain-id>" : encodeURIComponent(String(argv["subdomain-id"]))}`,
						pathParams: {
							"subdomain-id": String(argv["subdomain-id"] ?? ""),
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										drop_suppressed_recipients:
											argv["drop-suppressed-recipients"],
										preview_enabled: argv["preview-enabled"],
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
						client.emailSending.subdomains.update({
							body: bodyData,
							zone_id: zoneId,
							subdomain_id: argv["subdomain-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					drop_suppressed_recipients: argv["drop-suppressed-recipients"],
					preview_enabled: argv["preview-enabled"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.emailSending.subdomains.update({
						body: bodyData,
						zone_id: zoneId,
						subdomain_id: argv["subdomain-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
