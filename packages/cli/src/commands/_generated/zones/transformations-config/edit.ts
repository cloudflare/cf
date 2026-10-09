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
			"$0 zones transformations-config edit\n\nUpdates one or more fields of the combined Transformations configuration for a zone. Omitted fields are left unchanged. The response always returns the full current state of all three sub-settings."
		)
		.option("value-allowed-origins", {
			type: "string",
			description:
				'Comma-separated list of allowed origin domains for image and video transformations.\nUse "*" to allow all origins (default).\n',
		})
		.option("value-c2pa", {
			type: "string",
			description: "Whether C2PA signing is enabled for image transformations.",
			choices: ["off", "on"],
		})
		.coerce("value-c2pa", (value) =>
			resolveFileToken(value, "value-c2pa", "text")
		)
		.option("value-transformations", {
			type: "string",
			description:
				'Controls Image Transformations behavior:\n- "off": Feature disabled.\n- "on": Transformations enabled for same-zone images only.\n- "open": Transformations enabled for images from any origin.\n- "latest": Transformations enabled using the latest version.\n',
			choices: ["off", "on", "open", "latest"],
		})
		.coerce("value-transformations", (value) =>
			resolveFileToken(value, "value-transformations", "text")
		)
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

type Request = SdkRequest<"zone-settings-change-transformations-config">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit",
	describe: "Change Transformations configuration",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zones transformations-config edit",
				classification: {
					safeFlags: ["value-c2pa", "value-transformations", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf zones transformations-config edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/settings/transformations_config`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										value: {
											allowed_origins: resolveFileToken(
												argv["value-allowed-origins"] as string | undefined,
												"value-allowed-origins",
												"text"
											),
											c2pa: argv["value-c2pa"],
											transformations: argv["value-transformations"],
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
						client.zones.transformationsConfig.edit({
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
						allowed_origins: resolveFileToken(
							argv["value-allowed-origins"] as string | undefined,
							"value-allowed-origins",
							"text"
						),
						c2pa: argv["value-c2pa"],
						transformations: argv["value-transformations"],
					},
				});
				const result = await withProgress(`Updating`, async () =>
					client.zones.transformationsConfig.edit({
						...bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
