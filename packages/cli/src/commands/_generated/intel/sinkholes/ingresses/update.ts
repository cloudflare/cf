import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/intel.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 intel sinkholes ingresses update <ingress-id>\n\nReplaces the specified ingress rule. The sinkhole must belong to the same account as the zone."
		)
		.positional("ingress-id", {
			type: "string",
			description: "The unique identifier for the ingress rule.",
			demandOption: true,
		})
		.option("sinkhole-id", {
			type: "string",
			description: "The unique identifier for the sinkhole.",
			demandOption: true,
		})
		.option("cidr", {
			type: "string",
			description:
				"The CIDR block for the ingress rule in IPv4 or IPv6 notation (e.g., 192.0.2.0/24). Provide a Cloudflare BYOIP CIDR that your account owns.",
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

type Request = SdkRequest<"sinkhole-config-update-ingress">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <ingress-id>",
	describe: "Update an ingress rule",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "intel sinkholes ingresses update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf intel sinkholes ingresses update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/intel/sinkholes/${argv["sinkhole-id"] == null ? "<sinkhole-id>" : encodeURIComponent(String(argv["sinkhole-id"]))}/ingresses/${argv["ingress-id"] == null ? "<ingress-id>" : encodeURIComponent(String(argv["ingress-id"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"sinkhole-id": String(argv["sinkhole-id"] ?? ""),
							"ingress-id": String(argv["ingress-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										cidr: resolveFileToken(
											argv["cidr"] as string | undefined,
											"cidr",
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
						client.intel.sinkholes.ingresses.update({
							body: bodyData,
							zone_id: zoneId,
							sinkhole_id: argv["sinkhole-id"],
							ingress_id: argv["ingress-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["cidr"] === undefined) {
					argv["cidr"] = await promptForRequiredField(
						"cidr",
						"The CIDR block for the ingress rule in IPv4 or IPv6 notation (e.g., 192.0.2.0/24). Provide a Cloudflare BYOIP CIDR that your account owns."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					cidr: resolveFileToken(
						argv["cidr"] as string | undefined,
						"cidr",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.intel.sinkholes.ingresses.update({
						body: bodyData,
						zone_id: zoneId,
						sinkhole_id: argv["sinkhole-id"],
						ingress_id: argv["ingress-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
