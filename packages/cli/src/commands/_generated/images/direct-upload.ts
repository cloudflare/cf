import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * direct-upload command
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
			"$0 images direct-upload\n\nDirect uploads allow users to upload images without API keys. A common use case are web apps, client-side applications, or mobile devices where users upload content directly to Cloudflare Images. This method creates a draft record for a future image. It returns an upload URL and an image identifier. To verify if the image itself has been uploaded, send an image details request (accounts/:account_identifier/images/v1/:identifier), and check that the `draft: true` property is not present."
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
		.option("expiry", {
			type: "string",
			description:
				"The date after which the upload will not be accepted. Minimum: Now + 2 minutes. Maximum: Now + 6 hours.",
		})
		.option("id", {
			type: "string",
			description:
				"Optional Image Custom ID. Up to 1024 chars. Can include any number of subpaths, and utf8 characters. Cannot start nor end with a / (forward slash). Cannot be a UUID.",
		})
		.option("metadata", {
			type: "string",
			description:
				"User modifiable key-value store. Can be used for keeping references to another system of record, for managing images.",
		})
		.option("require-signed-urls", {
			type: "boolean",
			description:
				"Indicates whether the image requires a signature token to be accessed.",
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"cloudflare-images-create-authenticated-direct-upload-url-v-2">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "direct-upload",
	describe: "Create authenticated direct upload URL V2",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "images direct-upload",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf images direct-upload",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/images/v2/direct_upload`,
						pathParams: {},
						bodyKind: "multipart",
						body: {
							body: argv["body"],
							file: argv["file"],
							creator: argv["creator"],
							expiry: argv["expiry"],
							id: argv["id"],
							metadata: argv["metadata"],
							"require-signed-urls": argv["require-signed-urls"],
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
					argv["expiry"] !== undefined ||
					argv["id"] !== undefined ||
					argv["metadata"] !== undefined ||
					argv["require-signed-urls"] !== undefined
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
					if (argv["expiry"] !== undefined)
						formData.append(
							"expiry",
							String(
								resolveFileToken(
									argv["expiry"] as string | undefined,
									"expiry",
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
					const result = await withProgress(`Creating`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/accounts/${accountId}/images/v2/direct_upload`,
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
							`/accounts/${accountId}/images/v2/direct_upload`,
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
					client.images.directUpload({
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
