import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/web3.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 web3 hostnames ipfs-universal-paths content-lists entries update <content-list-entry-identifier>\n\nEdit IPFS Universal Path Gateway Content List Entry"
		)
		.positional("content-list-entry-identifier", {
			type: "string",
			description: "Specify the identifier of the hostname.",
			demandOption: true,
		})
		.option("identifier", {
			type: "string",
			description: "Specify the identifier of the hostname.",
			demandOption: true,
		})
		.option("content", {
			type: "string",
			description: "Specify the CID or content path of content to block.",
		})
		.option("description", {
			type: "string",
			description: "Specify an optional description of the content list entry.",
		})
		.option("type", {
			type: "string",
			description: "Specify the type of content list entry to block.",
			choices: ["cid", "content_path"],
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
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"web3-hostname-edit-ipfs-universal-path-gateway-content-list-entry">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <content-list-entry-identifier>",
	describe: "Edit IPFS Universal Path Gateway Content List Entry",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command:
					"web3 hostnames ipfs-universal-paths content-lists entries update",
				classification: {
					safeFlags: ["type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command:
							"cf web3 hostnames ipfs-universal-paths content-lists entries update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/web3/hostnames/${argv["identifier"] == null ? "<identifier>" : encodeURIComponent(String(argv["identifier"]))}/ipfs_universal_path/content_list/entries/${argv["content-list-entry-identifier"] == null ? "<content-list-entry-identifier>" : encodeURIComponent(String(argv["content-list-entry-identifier"]))}`,
						pathParams: {
							"content-list-entry-identifier": String(
								argv["content-list-entry-identifier"] ?? ""
							),
							identifier: String(argv["identifier"] ?? ""),
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
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
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.web3.hostnames.ipfsUniversalPaths.contentLists.entries.update(
							{
								body: bodyData,
								zone_id: zoneId,
								identifier: argv["identifier"],
								content_list_entry_identifier:
									argv["content-list-entry-identifier"],
							} satisfies Request
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
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

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
				const result = await withProgress(`Updating`, async () =>
					client.web3.hostnames.ipfsUniversalPaths.contentLists.entries.update({
						body: bodyData,
						zone_id: zoneId,
						identifier: argv["identifier"],
						content_list_entry_identifier:
							argv["content-list-entry-identifier"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
