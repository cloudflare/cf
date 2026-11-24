import operation from "../../../_operations/cache/settings/variants/edit.js";
/**
 * edit command
 * @generated from apis/overlays/cache.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "edit",
	describe: "Change variants setting",
	usage:
		"$0 cache settings variants edit\n\nVariant support enables caching variants of images with certain file extensions in addition to the original. This only applies when the origin server sends the 'Vary: Accept' response header. If the origin server sends 'Vary: Accept' but does not serve the variant requested, the response will not be cached. This will be indicated with BYPASS cache status in the response headers.",
	flags: {
		"value-avif": {
			kind: "parsed",
			brief:
				"List of strings with the MIME types of all the variants that should be served for avif.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"value-bmp": {
			kind: "parsed",
			brief:
				"List of strings with the MIME types of all the variants that should be served for bmp.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"value-gif": {
			kind: "parsed",
			brief:
				"List of strings with the MIME types of all the variants that should be served for gif.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"value-jp2": {
			kind: "parsed",
			brief:
				"List of strings with the MIME types of all the variants that should be served for jp2.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"value-jpeg": {
			kind: "parsed",
			brief:
				"List of strings with the MIME types of all the variants that should be served for jpeg.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"value-jpg": {
			kind: "parsed",
			brief:
				"List of strings with the MIME types of all the variants that should be served for jpg.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"value-jpg2": {
			kind: "parsed",
			brief:
				"List of strings with the MIME types of all the variants that should be served for jpg2.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"value-png": {
			kind: "parsed",
			brief:
				"List of strings with the MIME types of all the variants that should be served for png.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"value-tif": {
			kind: "parsed",
			brief:
				"List of strings with the MIME types of all the variants that should be served for tif.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"value-tiff": {
			kind: "parsed",
			brief:
				"List of strings with the MIME types of all the variants that should be served for tiff.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"value-webp": {
			kind: "parsed",
			brief:
				"List of strings with the MIME types of all the variants that should be served for webp.",
			variadic: true,
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
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cache settings variants edit",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
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
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
