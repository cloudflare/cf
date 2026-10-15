import operation from "../_operations/images/edit.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * edit command
 * @generated from apis/overlays/images.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 images edit <image-id>\n\nUpdate a CF Images image's metadata, creator, or access control. On access control change, all copies of the image are purged from cache."
		)
		.positional("image-id", {
			type: "string",
			description: "Image unique identifier.",
			demandOption: true,
		})
		.option("creator", {
			type: "string",
			description: "Can set the creator field with an internal user ID.",
		})
		.option("metadata", {
			type: "string",
			description:
				"User modifiable key-value store. Can be used for keeping references to another system of record for managing images. No change if not specified. Provide as a JSON object or @path/to/file.json.",
		})
		.option("require-signed-urls", {
			type: "boolean",
			description:
				"Indicates whether the image can be accessed using only its UID. If set to `true`, a signed token needs to be generated with a signing key to view the image. Returns a new UID on a change. No change if not specified.",
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

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <image-id>",
	describe: "Update image",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "images edit",
				classification: {
					safeFlags: ["require-signed-urls", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf images edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/images/v1/${argv["image-id"] == null ? "<image-id>" : encodeURIComponent(String(argv["image-id"]))}`,
						pathParams: { "image-id": String(argv["image-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
											creator: resolveFileToken(
												argv["creator"] as string | undefined,
												"creator",
												"text"
											),
											metadata: parseJsonMap(argv["metadata"], "metadata"),
											requireSignedURLs: argv["require-signed-urls"],
										},
										[["metadata"]]
									),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							image_id: argv["image-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
						creator: resolveFileToken(
							argv["creator"] as string | undefined,
							"creator",
							"text"
						),
						metadata: parseJsonMap(argv["metadata"], "metadata"),
						requireSignedURLs: argv["require-signed-urls"],
					},
					[["metadata"]]
				);
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						image_id: argv["image-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
