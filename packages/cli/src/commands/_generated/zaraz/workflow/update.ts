import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * update command
 * @generated from apis/overlays/zaraz.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId, requestApi } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { readFileForFlag, resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage("$0 zaraz workflow update\n\nUpdates Zaraz workflow for a zone.")
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Send the workflow name as plain text (\`realtime\` or \`preview\`), without JSON quotes.",
		})
		.option("file", {
			type: "string",
			description: "Path to a file to upload as the request body",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update",
	describe: "Update Zaraz workflow",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zaraz workflow update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf zaraz workflow update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/settings/zaraz/workflow`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "octet-stream",
						body: argv.file !== undefined ? { file: argv.file } : argv.body,
					});
					return;
				}
				if (argv.body === undefined && argv.file === undefined) {
					throw new Error(
						"--body or --file is required for this command. Pass --body '<value>' or --file path/to/file."
					);
				}
				const parsedBody =
					argv.file !== undefined
						? undefined
						: resolveFileToken(argv.body, "body", "binary");
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.file !== undefined) {
					const fileContent = readFileForFlag(argv.file);
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PUT",
							`/zones/${argv.zoneId}/settings/zaraz/workflow`,
							{ body: fileContent, headers: { "Content-Type": "text/plain" } }
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PUT",
							`/zones/${argv.zoneId}/settings/zaraz/workflow`,
							{ body: bodyData, headers: { "Content-Type": "text/plain" } }
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
			}
		),
};

export default command;
