import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/zones.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zones aegis edit\n\nAegis provides dedicated egress IPs (from Cloudflare to your origin) for your layer 7 WAF and CDN services. The egress IPs are reserved exclusively for your account so that you can increase your origin security by only allowing traffic from a small list of IP addresses."
		)
		.option("value-enabled", {
			type: "boolean",
			description: "Whether the feature is enabled or not.",
		})
		.option("value-pool-id", {
			type: "string",
			description:
				"Egress pool id which refers to a grouping of dedicated egress IPs through which Cloudflare will connect to origin.",
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

type Request = SdkRequest<"zone-cache-settings-change-aegis-setting">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit",
	describe: "Change aegis setting",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zones aegis edit",
				classification: {
					safeFlags: ["value-enabled", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf zones aegis edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/settings/aegis`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										value: {
											enabled: argv["value-enabled"],
											pool_id: resolveFileToken(
												argv["value-pool-id"] as string | undefined,
												"value-pool-id",
												"text"
											),
										},
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
						client.zones.aegis.edit({
							...bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					value: {
						enabled: argv["value-enabled"],
						pool_id: resolveFileToken(
							argv["value-pool-id"] as string | undefined,
							"value-pool-id",
							"text"
						),
					},
				});
				const result = await withProgress(`Updating`, async () =>
					client.zones.aegis.edit({
						...bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
