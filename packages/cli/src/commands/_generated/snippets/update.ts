import { createCommandClient, getZoneId, requestApi } from "#lib/auth.js";
import { parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { readFileForFlag, resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * update command
 * @generated from apis/overlays/snippets.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 snippets update <snippet-name>\n\nCreates or updates a snippet belonging to the zone."
		)
		.positional("snippet-name", {
			type: "string",
			description: "Identify the snippet.",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Define a snippet object.",
		})
		.option("file", {
			type: "string",
			description: "Path to a file to upload as the request body",
		})
		.option("metadata", {
			type: "string",
			description: "Provide metadata about the snippet.",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <snippet-name>",
	describe: "Update a zone snippet",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "snippets update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf snippets update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/snippets/${argv["snippet-name"] == null ? "<snippet-name>" : encodeURIComponent(String(argv["snippet-name"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"snippet-name": String(argv["snippet-name"] ?? ""),
						},
						bodyKind: "multipart",
						body: {
							body: argv["body"],
							file: argv["file"],
							metadata: argv["metadata"],
						},
					});
					return;
				}
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (
					argv.file !== undefined ||
					argv.body !== undefined ||
					argv["metadata"] !== undefined
				) {
					const formData = new FormData();
					if (argv.file) {
						const fileContent = readFileForFlag(argv.file);
						formData.append(
							"file",
							new Blob([fileContent]),
							argv.file.split(/[\\/]/).filter(Boolean).pop()
						);
					} else if (argv.body !== undefined) {
						formData.append("file", argv.body);
					}
					if (argv["metadata"] !== undefined) {
						const v =
							typeof argv["metadata"] === "string"
								? resolveFileToken(argv["metadata"], "metadata", "text")
								: argv["metadata"];
						formData.append(
							"metadata",
							typeof v === "string" ? v : JSON.stringify(v)
						);
					}
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PUT",
							`/zones/${argv.zoneId}/snippets/${encodeURIComponent(String(argv["snippet-name"]))}`,
							{ body: formData }
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				if (argv.body) {
					// Endpoint does not accept application/json — send --body as raw bytes,
					// resolving @file references as binary file contents.
					const bodyData = resolveFileToken(argv.body, "body", "binary");
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PUT",
							`/zones/${argv.zoneId}/snippets/${encodeURIComponent(String(argv["snippet-name"]))}`,
							{
								body: bodyData,
								headers: { "Content-Type": "multipart/form-data" },
							}
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				if (argv.body === undefined) {
					throw new Error(
						"--body is required for this command. Pass --body '<json>' or --body @path/to/file.json."
					);
				}
			}
		),
};

export default command;
