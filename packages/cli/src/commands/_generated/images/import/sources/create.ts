import operation from "../../../_operations/images/import/sources/create.js";
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
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
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
	describe: "Create a sourcing kit source",
	usage:
		"$0 images import sources create\n\nConfigure an S3 source for CF Images imports.",
	flags: {
		account: {
			kind: "parsed",
			brief: "Account identifier for the bucket (required for R2 vendor).",
			optional: true,
			parse: String,
		},
		bucket: {
			kind: "parsed",
			brief: "The name of the storage bucket.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "A human-readable name for the source.",
			optional: true,
			parse: String,
		},
		secret: {
			kind: "parsed",
			brief:
				'Storage credentials for accessing the bucket. Shape depends on vendor. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		vendor: {
			kind: "parsed",
			brief: "The cloud storage vendor of the source bucket.",
			optional: true,
			choices: ["s3", "r2"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "vendor", "text"),
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
				command: "images import sources create",
				classification: {
					safeFlags: ["vendor", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["bucket"] === undefined) {
						argv["bucket"] = await promptForRequiredField(
							"bucket",
							"The name of the storage bucket."
						);
					}
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"A human-readable name for the source."
						);
					}
					if (argv["secret"] === undefined) {
						throw new Error(
							"--secret is required (or pass --body with this field set)."
						);
					}
					if (argv["vendor"] === undefined) {
						argv["vendor"] = await promptForRequiredEnumField(
							"vendor",
							"The cloud storage vendor of the source bucket.",
							["s3", "r2"] as const
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf images import sources create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/images/v2/sourcingkit/sources`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body, [{ path: ["secret"], flag: "secret" }])
								: compactBody(
										{
											account: resolveFileToken(
												argv["account"] as string | undefined,
												"account",
												"text"
											),
											bucket: resolveFileToken(
												argv["bucket"] as string | undefined,
												"bucket",
												"text"
											),
											name: resolveFileToken(
												argv["name"] as string | undefined,
												"name",
												"text"
											),
											secret: parseJsonMap(argv["secret"], "secret", true),
											vendor: argv["vendor"],
										},
										[["secret"]]
									),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined
						? parseBody(argv.body, [{ path: ["secret"], flag: "secret" }])
						: undefined;
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
				const bodyData = compactBody(
					{
						account: resolveFileToken(
							argv["account"] as string | undefined,
							"account",
							"text"
						),
						bucket: resolveFileToken(
							argv["bucket"] as string | undefined,
							"bucket",
							"text"
						),
						name: resolveFileToken(
							argv["name"] as string | undefined,
							"name",
							"text"
						),
						secret: parseJsonMap(argv["secret"], "secret", true),
						vendor: argv["vendor"],
					},
					[["secret"]]
				);
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
