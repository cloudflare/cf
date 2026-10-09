import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/o11y.ts
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
			"$0 o11y tracing settings update\n\nUpdate the zone-level Cloudflare Traces settings."
		)
		.option("destinations", {
			type: "string",
			array: true,
			description:
				"Up to 100 OpenTelemetry destination identifiers that receive traces.",
		})
		.option("enabled", {
			type: "boolean",
			description: "Whether Cloudflare Traces is enabled for the zone.",
		})
		.option("forward-context", {
			type: "boolean",
			description:
				"Whether trace context is sent externally or across a zone boundary.",
		})
		.option("persist", {
			type: "boolean",
			description: "Whether traces are persisted in Cloudflare.",
		})
		.option("propagation-policy", {
			type: "string",
			description:
				"When inbound trace context may be continued. Authenticated propagation is not supported yet.",
			choices: ["accept", "authenticated", "reject"],
		})
		.coerce("propagation-policy", (value: string | undefined) =>
			resolveFileToken(value, "propagation-policy", "text")
		)
		.option("sampling-ratio", {
			type: "number",
			description: "The ratio of requests sampled for tracing, from 0 to 1.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Update zone tracing settings",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"zone.observability.tracing.settings.update">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update",
	describe: "Update zone tracing settings",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "o11y tracing settings update",
				classification: {
					safeFlags: [
						"enabled",
						"forward-context",
						"persist",
						"propagation-policy",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf o11y tracing settings update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/observability/tracing/settings`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										destinations: argv["destinations"],
										enabled: argv["enabled"],
										forward_context: argv["forward-context"],
										persist: argv["persist"],
										propagation_policy: argv["propagation-policy"],
										sampling_ratio: argv["sampling-ratio"],
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
						client.observability.tracing.settings.update({
							...bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					destinations: argv["destinations"],
					enabled: argv["enabled"],
					forward_context: argv["forward-context"],
					persist: argv["persist"],
					propagation_policy: argv["propagation-policy"],
					sampling_ratio: argv["sampling-ratio"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.observability.tracing.settings.update({
						...bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
