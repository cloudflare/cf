import operation from "../../../_operations/o11y/tracing/settings/update.js";
/**
 * update command
 * @generated from apis/overlays/o11y.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update",
	describe: "Update zone tracing settings",
	usage:
		"$0 o11y tracing settings update\n\nUpdate the zone-level Cloudflare Traces settings.",
	flags: {
		destinations: {
			kind: "parsed",
			brief:
				"Up to 100 OpenTelemetry destination identifiers that receive traces.",
			variadic: true,
			optional: true,
			parse: String,
		},
		enabled: {
			kind: "boolean",
			brief: "Whether Cloudflare Traces is enabled for the zone.",
			optional: true,
		},
		"forward-context": {
			kind: "boolean",
			brief:
				"Whether trace context is sent externally or across a zone boundary.",
			optional: true,
		},
		persist: {
			kind: "boolean",
			brief: "Whether traces are persisted in Cloudflare.",
			optional: true,
		},
		"propagation-policy": {
			kind: "parsed",
			brief:
				"When inbound trace context may be continued. Authenticated propagation is not supported yet.",
			optional: true,
			choices: ["accept", "authenticated", "reject"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "propagation-policy", "text"),
		},
		"sampling-ratio": {
			kind: "parsed",
			brief: "The ratio of requests sampled for tracing, from 0 to 1.",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Update zone tracing settings",
			optional: true,
			parse: String,
		},
	},
	operands: [],
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
				} satisfies ArgClassification<typeof argv>,
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
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, { body: bodyData, zone_id: zoneId })
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					destinations: argv["destinations"],
					enabled: argv["enabled"],
					forward_context: argv["forward-context"],
					persist: argv["persist"],
					propagation_policy: argv["propagation-policy"],
					sampling_ratio: argv["sampling-ratio"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
