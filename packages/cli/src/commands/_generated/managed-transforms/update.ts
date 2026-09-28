import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/managed-transforms.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 managed-transforms update\n\nUpdates the status of one or more Managed Transforms."
		)
		.option("managed-request-headers", {
			type: "string",
			description:
				"The list of Managed Request Transforms. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("managed-response-headers", {
			type: "string",
			description:
				"The list of Managed Response Transforms. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"A Managed Transforms patch object. Both fields are optional; only the sections provided will be updated.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"updateManagedTransforms">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update",
	describe: "Update Managed Transforms",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "managed-transforms update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
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
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.managedTransforms.update({
							...bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
					client.managedTransforms.update({
						...bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
