import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/cache.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cache origin-cloud-regions update <origin-ip>\n\nCreates a new IP-to-cloud-region mapping or replaces the existing mapping for the specified IP. PUT is idempotent — calling it repeatedly with the same body produces the same result. The IP path parameter is normalized to canonical form (RFC 5952 for IPv6) before storage. The vendor and region are validated against the list from `GET /zones/{zone_id}/origin/cloud_regions/supported_regions`. Returns 400 if the `origin_ip` in the body does not match the URL path parameter. Returns 403 (code 1164) when the zone has reached the limit of 3,500 IP mappings."
		)
		.positional("origin-ip", {
			type: "string",
			description: "Origin IP address to create or replace.",
			demandOption: true,
		})
		.option("region", {
			type: "string",
			description:
				"Cloud vendor region identifier. Must be a valid region for the specified vendor as returned by the supported_regions endpoint.",
		})
		.option("vendor", {
			type: "string",
			description:
				"Cloud vendor hosting the origin. Must be one of the supported vendors.",
			choices: ["aws", "azure", "gcp", "oci"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Request body for creating or replacing an origin cloud region mapping.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"origin-cloud-regions-v2-upsert">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <origin-ip>",
	describe: "Create or replace an origin cloud region mapping",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cache origin-cloud-regions update",
				classification: {
					safeFlags: ["vendor", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf cache origin-cloud-regions update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/origin/cloud_regions/${argv["origin-ip"] == null ? "<origin-ip>" : encodeURIComponent(String(argv["origin-ip"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"origin-ip": String(argv["origin-ip"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										region: resolveFileToken(
											argv["region"] as string | undefined,
											"region",
											"text"
										),
										vendor: resolveFileToken(
											argv["vendor"] as string | undefined,
											"vendor",
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
						client.cache.originCloudRegions.update({
							body: bodyData,
							zone_id: zoneId,
							origin_ip: argv["origin-ip"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["region"] === undefined) {
					argv["region"] = await promptForRequiredField(
						"region",
						"Cloud vendor region identifier. Must be a valid region for the specified vendor as returned by the supported_regions endpoint."
					);
				}
				if (argv["vendor"] === undefined) {
					argv["vendor"] = await promptForRequiredEnumField(
						"vendor",
						"Cloud vendor hosting the origin. Must be one of the supported vendors.",
						["aws", "azure", "gcp", "oci"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					region: resolveFileToken(
						argv["region"] as string | undefined,
						"region",
						"text"
					),
					vendor: resolveFileToken(
						argv["vendor"] as string | undefined,
						"vendor",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.cache.originCloudRegions.update({
						body: bodyData,
						zone_id: zoneId,
						origin_ip: argv["origin-ip"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
