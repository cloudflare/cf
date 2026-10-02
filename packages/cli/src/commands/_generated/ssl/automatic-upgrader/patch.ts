import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * patch command
 * @generated from apis/overlays/ssl.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			'$0 ssl automatic-upgrader patch\n\nThe automatic system is enabled when this endpoint is hit with value in the request body is set to "auto", and disabled when the request body value is set to "custom".'
		)
		.option("value", {
			type: "string",
			description: "Controls enablement of Automatic SSL/TLS.",
			choices: ["auto", "custom"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Update enablement of Automatic SSL/TLS.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"ssl-detector-automatic-mode-patch-enrollment">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "patch",
	describe: "Patch Automatic SSL/TLS Enrollment status for given zone",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ssl automatic-upgrader patch",
				classification: {
					safeFlags: ["value", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf ssl automatic-upgrader patch",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/settings/ssl_automatic_mode`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										value: resolveFileToken(
											argv["value"] as string | undefined,
											"value",
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
						client.ssl.automaticUpgrader.patch({
							...bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["value"] === undefined) {
					argv["value"] = await promptForRequiredEnumField(
						"value",
						"Controls enablement of Automatic SSL/TLS.",
						["auto", "custom"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					value: resolveFileToken(
						argv["value"] as string | undefined,
						"value",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.ssl.automaticUpgrader.patch({
						...bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
