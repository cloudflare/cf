import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/images.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { readFileForFlag, resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 images create\n\nUpload an image to CF Images. Images up to 10 Megabytes can be uploaded using a single HTTP POST (multipart/form-data) request by sending an image file or passing a URL accessible to the API."
		)
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.option("file", {
			type: "string",
			description: "Path to a file to upload as the request body",
		})
		.option("creator", {
			type: "string",
			description: "Can set the creator field with an internal user ID.",
		})
		.option("id", {
			type: "string",
			description: "An optional custom unique identifier for your image.",
		})
		.option("metadata", {
			type: "string",
			description:
				"User modifiable key-value store. Can use used for keeping references to another system of record for managing images.",
		})
		.option("require-signed-urls", {
			type: "boolean",
			description:
				"Indicates whether the image requires a signature token for the access.",
		})
		.option("url", {
			type: "string",
			description:
				"A URL to fetch an image from origin. Only needed when type is uploading from a URL.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"cloudflare-images-upload-an-image-via-url">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Upload an image",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "images create",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf images create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/images/v1`,
						pathParams: {},
						bodyKind: "multipart",
						body: {
							body: argv["body"],
							file: argv["file"],
							creator: argv["creator"],
							id: argv["id"],
							metadata: argv["metadata"],
							"require-signed-urls": argv["require-signed-urls"],
							url: argv["url"],
						},
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (
					argv.file !== undefined ||
					argv.body !== undefined ||
					argv["creator"] !== undefined ||
					argv["id"] !== undefined ||
					argv["metadata"] !== undefined ||
					argv["require-signed-urls"] !== undefined ||
					argv["url"] !== undefined
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
					if (argv["creator"] !== undefined)
						formData.append(
							"creator",
							String(
								resolveFileToken(
									argv["creator"] as string | undefined,
									"creator",
									"text"
								) ?? ""
							)
						);
					if (argv["id"] !== undefined)
						formData.append(
							"id",
							String(
								resolveFileToken(
									argv["id"] as string | undefined,
									"id",
									"text"
								) ?? ""
							)
						);
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
					if (argv["require-signed-urls"] !== undefined)
						formData.append(
							"requireSignedURLs",
							String(argv["require-signed-urls"])
						);
					if (argv["url"] !== undefined)
						formData.append(
							"url",
							String(
								resolveFileToken(
									argv["url"] as string | undefined,
									"url",
									"text"
								) ?? ""
							)
						);
					const result = await withProgress(`Creating`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/accounts/${accountId}/images/v1`,
							{ body: formData }
						)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				if (argv.body) {
					// Endpoint does not accept application/json — send --body as raw bytes,
					// resolving @file references as binary file contents.
					const bodyData = resolveFileToken(argv.body, "body", "binary");
					const result = await withProgress(`Creating`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/accounts/${accountId}/images/v1`,
							{
								body: bodyData,
								headers: { "Content-Type": "multipart/form-data" },
							}
						)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				const result = await withProgress(`Creating`, async () =>
					client.images.create({ account_id: accountId } satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
