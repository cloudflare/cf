import operation from "../../../../../_operations/web3/hostnames/ipfs-universal-paths/content-lists/entries/create.js";
/**
 * create command
 * @generated from apis/overlays/web3.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create <identifier>",
	describe: "Create IPFS Universal Path Gateway Content List Entry",
	usage:
		"$0 web3 hostnames ipfs-universal-paths content-lists entries create <identifier>\n\nCreates a new entry in an IPFS Universal Path Gateway content list.",
	flags: {
		content: {
			kind: "parsed",
			brief: "Specify the CID or content path of content to block.",
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "Specify an optional description of the content list entry.",
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief: "Specify the type of content list entry to block.",
			optional: true,
			choices: ["cid", "content_path"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
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
				command:
					"web3 hostnames ipfs-universal-paths content-lists entries create",
				classification: {
					safeFlags: ["type", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["content"] === undefined) {
						argv["content"] = await promptForRequiredField(
							"content",
							"Specify the CID or content path of content to block."
						);
					}
					if (argv["type"] === undefined) {
						argv["type"] = await promptForRequiredEnumField(
							"type",
							"Specify the type of content list entry to block.",
							["cid", "content_path"] as const
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					formatDryRun({
						command:
							"cf web3 hostnames ipfs-universal-paths content-lists entries create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/web3/hostnames/${argv["identifier"] == null ? "<identifier>" : encodeURIComponent(String(argv["identifier"]))}/ipfs_universal_path/content_list/entries`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							identifier: String(argv["identifier"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										content: resolveFileToken(
											argv["content"] as string | undefined,
											"content",
											"text"
										),
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										type: argv["type"],
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
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, {
							body: bodyData,
							zone_id: zoneId,
							identifier: argv["identifier"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					content: resolveFileToken(
						argv["content"] as string | undefined,
						"content",
						"text"
					),
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					type: argv["type"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						zone_id: zoneId,
						identifier: argv["identifier"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
