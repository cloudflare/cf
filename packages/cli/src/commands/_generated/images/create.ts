import operation from "../_operations/images/create.js";
/**
 * create command
 * @generated from apis/overlays/images.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { readFileForFlag, resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Upload an image",
	usage:
		"$0 images create\n\nUpload an image to CF Images. Images up to 10 Megabytes can be uploaded using a single HTTP POST (multipart/form-data) request by sending an image file or passing a URL accessible to the API.",
	flags: {
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
		file: {
			kind: "parsed",
			brief: "Path to a file to upload as the request body",
			optional: true,
			parse: String,
		},
		creator: {
			kind: "parsed",
			brief: "Can set the creator field with an internal user ID.",
			optional: true,
			parse: String,
		},
		id: {
			kind: "parsed",
			brief: "An optional custom unique identifier for your image.",
			optional: true,
			parse: String,
		},
		metadata: {
			kind: "parsed",
			brief:
				"User modifiable key-value store. Can use used for keeping references to another system of record for managing images.",
			optional: true,
			parse: String,
		},
		"require-signed-urls": {
			kind: "boolean",
			brief:
				"Indicates whether the image requires a signature token for the access.",
			optional: true,
		},
		url: {
			kind: "parsed",
			brief:
				"A URL to fetch an image from origin. Only needed when type is uploading from a URL.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "images create",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
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
					if (argv.file !== undefined) {
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

				if (argv.body !== undefined) {
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
					client.send(operation, { account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
