import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/url-normalization.ts
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
			"$0 url-normalization update\n\nUpdates the URL Normalization settings."
		)
		.option("scope", {
			type: "string",
			description: "The scope of the URL normalization.",
			choices: ["incoming", "both", "none"],
		})
		.coerce("scope", (value: string | undefined) =>
			resolveFileToken(value, "scope", "text")
		)
		.option("type", {
			type: "string",
			description: "The type of URL normalization performed by Cloudflare.",
			choices: ["cloudflare", "rfc3986"],
		})
		.coerce("type", (value: string | undefined) =>
			resolveFileToken(value, "type", "text")
		)
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "A URL Normalization object.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"updateUrlNormalization">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update",
	describe: "Update URL Normalization settings",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "url-normalization update",
				classification: {
					safeFlags: ["scope", "type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf url-normalization update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/url_normalization`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										scope: argv["scope"],
										type: argv["type"],
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
						client.urlNormalization.update({
							body: bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["scope"] === undefined) {
					argv["scope"] = await promptForRequiredEnumField(
						"scope",
						"The scope of the URL normalization.",
						["incoming", "both", "none"] as const
					);
				}
				if (argv["type"] === undefined) {
					argv["type"] = await promptForRequiredEnumField(
						"type",
						"The type of URL normalization performed by Cloudflare.",
						["cloudflare", "rfc3986"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					scope: argv["scope"],
					type: argv["type"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.urlNormalization.update({
						body: bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
