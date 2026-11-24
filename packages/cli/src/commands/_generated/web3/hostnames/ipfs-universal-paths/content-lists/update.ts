import operation from "../../../../_operations/web3/hostnames/ipfs-universal-paths/content-lists/update.js";
/**
 * update command
 * @generated from apis/overlays/web3.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <identifier>",
	describe: "Update IPFS Universal Path Gateway Content List",
	usage:
		"$0 web3 hostnames ipfs-universal-paths content-lists update <identifier>\n\nUpdates the IPFS Universal Path Gateway content list for a Web3 hostname.",
	flags: {
		action: {
			kind: "parsed",
			brief: "Behavior of the content list.",
			optional: true,
			choices: ["block"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "action", "text"),
		},
		entries: {
			kind: "parsed",
			brief:
				'Provides content list entries. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"content"?: string, "description"?: string, "type"?: "cid" | "content_path"}]. ? marks optional keys.',
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
	operands: [
		{
			placeholder: "identifier",
			brief: "Specify the identifier of the hostname.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "web3 hostnames ipfs-universal-paths content-lists update",
				classification: {
					safeFlags: ["action", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["action"] === undefined) {
						argv["action"] = await promptForRequiredEnumField(
							"action",
							"Behavior of the content list.",
							["block"] as const
						);
					}
					if (argv["entries"] === undefined) {
						throw new Error(
							"--entries is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					formatDryRun({
						command:
							"cf web3 hostnames ipfs-universal-paths content-lists update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/web3/hostnames/${argv["identifier"] == null ? "<identifier>" : encodeURIComponent(String(argv["identifier"]))}/ipfs_universal_path/content_list`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							identifier: String(argv["identifier"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										action: argv["action"],
										entries: parseObjectArray(argv["entries"], "entries"),
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
						client.send(operation, {
							body: bodyData,
							zone_id: zoneId,
							identifier: argv["identifier"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					action: argv["action"],
					entries: parseObjectArray(argv["entries"], "entries"),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						zone_id: zoneId,
						identifier: argv["identifier"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
