import operation from "../_operations/managed-transforms/update.js";
/**
 * update command
 * @generated from apis/overlays/managed-transforms.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update",
	describe: "Update Managed Transforms",
	usage:
		"$0 managed-transforms update\n\nUpdates the status of one or more Managed Transforms.",
	flags: {
		"managed-request-headers": {
			kind: "parsed",
			brief:
				'The list of Managed Request Transforms. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"enabled": boolean, "id": string} & {"id"?: string})]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"managed-response-headers": {
			kind: "parsed",
			brief:
				'The list of Managed Response Transforms. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"enabled": boolean, "id": string} & {"id"?: string})]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"A Managed Transforms patch object. Both fields are optional; only the sections provided will be updated.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "managed-transforms update",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf managed-transforms update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/managed_headers`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										managed_request_headers: parseObjectArray(
											argv["managed-request-headers"],
											"managed-request-headers"
										),
										managed_response_headers: parseObjectArray(
											argv["managed-response-headers"],
											"managed-response-headers"
										),
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
					managed_request_headers: parseObjectArray(
						argv["managed-request-headers"],
						"managed-request-headers"
					),
					managed_response_headers: parseObjectArray(
						argv["managed-response-headers"],
						"managed-response-headers"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
