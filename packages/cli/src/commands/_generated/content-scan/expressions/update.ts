import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/content-scan.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 content-scan expressions update <expression-id>\n\nUpdate the Content Scanning custom expression with the given identifier and return the updated list of expressions."
		)
		.positional("expression-id", {
			type: "string",
			description:
				"Defines the unique ID for this Content Scanning custom expression.",
			demandOption: true,
		})
		.option("payload", {
			type: "string",
			description:
				"Defines the custom content extraction expression used to reach content objects in the request.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Content Scanning custom expression to update.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"waf-content-scanning-update-custom-scan-expression">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <expression-id>",
	describe: "Update a Content Scanning custom expression for a zone.",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "content-scan expressions update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf content-scan expressions update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/content-upload-scan/payloads/${argv["expression-id"] == null ? "<expression-id>" : encodeURIComponent(String(argv["expression-id"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"expression-id": String(argv["expression-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										payload: resolveFileToken(
											argv["payload"] as string | undefined,
											"payload",
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
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.contentScan.expressions.update({
							...bodyData,
							zone_id: zoneId,
							expression_id: argv["expression-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["payload"] === undefined) {
					argv["payload"] = await promptForRequiredField(
						"payload",
						"Defines the custom content extraction expression used to reach content objects in the request."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					payload: resolveFileToken(
						argv["payload"] as string | undefined,
						"payload",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.contentScan.expressions.update({
						...bodyData,
						zone_id: zoneId,
						expression_id: argv["expression-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
