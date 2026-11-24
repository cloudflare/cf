import operation from "../../_operations/images/variants/create.js";
/**
 * create command
 * @generated from apis/overlays/images.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Create a variant",
	usage:
		"$0 images variants create\n\nCreate a CF Images variant that allows you to resize images for different use cases.",
	flags: {
		id: {
			kind: "parsed",
			brief: "The id field",
			optional: true,
			parse: String,
		},
		"never-require-signed-urls": {
			kind: "boolean",
			brief:
				"Indicates whether the variant can access an image without a signature, regardless of image access control.",
			default: false,
		},
		"options-fit": {
			kind: "parsed",
			brief:
				"The fit property describes how the width and height dimensions should be interpreted.",
			optional: true,
			choices: ["scale-down", "contain", "cover", "crop", "pad"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "options-fit", "text"),
		},
		"options-height": {
			kind: "parsed",
			brief: "Maximum height in image pixels.",
			optional: true,
			parse: Number,
		},
		"options-metadata": {
			kind: "parsed",
			brief: "What EXIF data should be preserved in the output image.",
			optional: true,
			choices: ["keep", "copyright", "none"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "options-metadata", "text"),
		},
		"options-width": {
			kind: "parsed",
			brief: "Maximum width in image pixels.",
			optional: true,
			parse: Number,
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
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "images variants create",
				classification: {
					safeFlags: [
						"never-require-signed-urls",
						"options-fit",
						"options-metadata",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["id"] === undefined) {
						argv["id"] = await promptForRequiredField("id", "The id field");
					}
					if (argv["options-fit"] === undefined) {
						argv["options-fit"] = await promptForRequiredEnumField(
							"options-fit",
							"The fit property describes how the width and height dimensions should be interpreted.",
							["scale-down", "contain", "cover", "crop", "pad"] as const
						);
					}
					if (argv["options-height"] === undefined) {
						throw new Error(
							"--options-height is required (or pass --body with this field set)."
						);
					}
					if (argv["options-metadata"] === undefined) {
						argv["options-metadata"] = await promptForRequiredEnumField(
							"options-metadata",
							"What EXIF data should be preserved in the output image.",
							["keep", "copyright", "none"] as const
						);
					}
					if (argv["options-width"] === undefined) {
						throw new Error(
							"--options-width is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf images variants create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/images/v1/variants`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										id: resolveFileToken(
											argv["id"] as string | undefined,
											"id",
											"text"
										),
										neverRequireSignedURLs: argv["never-require-signed-urls"],
										options: {
											fit: argv["options-fit"],
											height: argv["options-height"],
											metadata: argv["options-metadata"],
											width: argv["options-width"],
										},
									}),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					id: resolveFileToken(argv["id"] as string | undefined, "id", "text"),
					neverRequireSignedURLs: argv["never-require-signed-urls"],
					options: {
						fit: argv["options-fit"],
						height: argv["options-height"],
						metadata: argv["options-metadata"],
						width: argv["options-width"],
					},
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
