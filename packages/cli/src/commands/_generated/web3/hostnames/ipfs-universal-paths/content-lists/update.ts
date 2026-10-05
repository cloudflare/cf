import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/web3.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 web3 hostnames ipfs-universal-paths content-lists update <identifier>\n\nUpdate IPFS Universal Path Gateway Content List"
		)
		.positional("identifier", {
			type: "string",
			description: "Specify the identifier of the hostname.",
			demandOption: true,
		})
		.option("action", {
			type: "string",
			description: "Behavior of the content list.",
			choices: ["block"],
		})
		.option("entries", {
			type: "string",
			description:
				"Provides content list entries. Provide as a JSON array of objects or @path/to/file.json.",
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

type Request =
	SdkRequest<"web3-hostname-update-ipfs-universal-path-gateway-content-list">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <identifier>",
	describe: "Update IPFS Universal Path Gateway Content List",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "web3 hostnames ipfs-universal-paths content-lists update",
				classification: {
					safeFlags: ["action", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command:
							"cf web3 hostnames ipfs-universal-paths content-lists update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/web3/hostnames/${argv["identifier"] == null ? "<identifier>" : encodeURIComponent(String(argv["identifier"]))}/ipfs_universal_path/content_list`,
						pathParams: {
							identifier: String(argv["identifier"] ?? ""),
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										action: resolveFileToken(
											argv["action"] as string | undefined,
											"action",
											"text"
										),
										entries: parseObjectArray(argv["entries"], "entries"),
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
						client.web3.hostnames.ipfsUniversalPaths.contentLists.update({
							...bodyData,
							zone_id: zoneId,
							identifier: argv["identifier"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
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

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					action: resolveFileToken(
						argv["action"] as string | undefined,
						"action",
						"text"
					),
					entries: parseObjectArray(argv["entries"], "entries"),
				});
				const result = await withProgress(`Updating`, async () =>
					client.web3.hostnames.ipfsUniversalPaths.contentLists.update({
						...bodyData,
						zone_id: zoneId,
						identifier: argv["identifier"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
