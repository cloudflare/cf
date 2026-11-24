import operation from "../../_operations/logpush/edge/create.js";
/**
 * create command
 * @generated from apis/overlays/logpush.ts
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
	command: "create",
	describe: "Create Instant Logs job",
	usage: "$0 logpush edge create\n\nCreates a new Instant Logs job for a zone.",
	flags: {
		fields: {
			kind: "parsed",
			brief: "Comma-separated list of fields.",
			optional: true,
			parse: String,
		},
		filter: {
			kind: "parsed",
			brief: "Filters to drill down into specific events.",
			optional: true,
			parse: String,
		},
		sample: {
			kind: "parsed",
			brief:
				'The sample parameter is the sample rate of the records set by the client: "sample": 1 is 100% of records "sample": 10 is 10% and so on.',
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
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "logpush edge create",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf logpush edge create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/logpush/edge/jobs`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										fields: resolveFileToken(
											argv["fields"] as string | undefined,
											"fields",
											"text"
										),
										filter: resolveFileToken(
											argv["filter"] as string | undefined,
											"filter",
											"text"
										),
										sample: argv["sample"],
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
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, zone_id: zoneId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					fields: resolveFileToken(
						argv["fields"] as string | undefined,
						"fields",
						"text"
					),
					filter: resolveFileToken(
						argv["filter"] as string | undefined,
						"filter",
						"text"
					),
					sample: argv["sample"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
