import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/cache.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cache settings variants edit\n\nVariant support enables caching variants of images with certain file extensions in addition to the original. This only applies when the origin server sends the 'Vary: Accept' response header. If the origin server sends 'Vary: Accept' but does not serve the variant requested, the response will not be cached. This will be indicated with BYPASS cache status in the response headers."
		)
		.option("value-avif", {
			type: "string",
			array: true,
			description:
				"List of strings with the MIME types of all the variants that should be served for avif.",
		})
		.option("value-bmp", {
			type: "string",
			array: true,
			description:
				"List of strings with the MIME types of all the variants that should be served for bmp.",
		})
		.option("value-gif", {
			type: "string",
			array: true,
			description:
				"List of strings with the MIME types of all the variants that should be served for gif.",
		})
		.option("value-jp2", {
			type: "string",
			array: true,
			description:
				"List of strings with the MIME types of all the variants that should be served for jp2.",
		})
		.option("value-jpeg", {
			type: "string",
			array: true,
			description:
				"List of strings with the MIME types of all the variants that should be served for jpeg.",
		})
		.option("value-jpg", {
			type: "string",
			array: true,
			description:
				"List of strings with the MIME types of all the variants that should be served for jpg.",
		})
		.option("value-jpg2", {
			type: "string",
			array: true,
			description:
				"List of strings with the MIME types of all the variants that should be served for jpg2.",
		})
		.option("value-png", {
			type: "string",
			array: true,
			description:
				"List of strings with the MIME types of all the variants that should be served for png.",
		})
		.option("value-tif", {
			type: "string",
			array: true,
			description:
				"List of strings with the MIME types of all the variants that should be served for tif.",
		})
		.option("value-tiff", {
			type: "string",
			array: true,
			description:
				"List of strings with the MIME types of all the variants that should be served for tiff.",
		})
		.option("value-webp", {
			type: "string",
			array: true,
			description:
				"List of strings with the MIME types of all the variants that should be served for webp.",
		})
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

type Request = SdkRequest<"zone-cache-settings-change-variants-setting">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit",
	describe: "Change variants setting",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cache settings variants edit",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf cache settings variants edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/cache/variants`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										value: {
											avif: argv["value-avif"],
											bmp: argv["value-bmp"],
											gif: argv["value-gif"],
											jp2: argv["value-jp2"],
											jpeg: argv["value-jpeg"],
											jpg: argv["value-jpg"],
											jpg2: argv["value-jpg2"],
											png: argv["value-png"],
											tif: argv["value-tif"],
											tiff: argv["value-tiff"],
											webp: argv["value-webp"],
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
						client.cache.settings.variants.edit({
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
						avif: argv["value-avif"],
						bmp: argv["value-bmp"],
						gif: argv["value-gif"],
						jp2: argv["value-jp2"],
						jpeg: argv["value-jpeg"],
						jpg: argv["value-jpg"],
						jpg2: argv["value-jpg2"],
						png: argv["value-png"],
						tif: argv["value-tif"],
						tiff: argv["value-tiff"],
						webp: argv["value-webp"],
					},
				});
				const result = await withProgress(`Updating`, async () =>
					client.cache.settings.variants.edit({
						...bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
