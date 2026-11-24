import operation from "../../../_operations/r2/super-slurper/connectivity-precheck/target.js";
/**
 * target command
 * @generated from apis/overlays/r2.ts
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
	command: "target",
	describe: "Check target connectivity",
	usage:
		"$0 r2 super-slurper connectivity-precheck target\n\nCheck whether tokens are valid against the target bucket",
	flags: {
		bucket: {
			kind: "parsed",
			brief: "The bucket field",
			optional: true,
			parse: String,
		},
		jurisdiction: {
			kind: "parsed",
			brief: "The jurisdiction field",
			optional: true,
			choices: ["default", "eu", "us", "fedramp"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "jurisdiction", "text"),
		},
		"secret-access-key-id": {
			kind: "parsed",
			brief: "The secret.accessKeyId field",
			optional: true,
			parse: String,
		},
		"secret-secret-access-key": {
			kind: "parsed",
			brief: "The secret.secretAccessKey field",
			optional: true,
			parse: String,
		},
		vendor: {
			kind: "parsed",
			brief: "The vendor field",
			optional: true,
			choices: ["r2"],
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
				command: "r2 super-slurper connectivity-precheck target",
				classification: {
					safeFlags: ["jurisdiction", "vendor", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["bucket"] === undefined) {
						argv["bucket"] = await promptForRequiredField(
							"bucket",
							"The bucket field"
						);
					}
					if (argv["secret-access-key-id"] === undefined) {
						argv["secret-access-key-id"] = await promptForRequiredField(
							"secret-access-key-id",
							"The secret.accessKeyId field"
						);
					}
					if (argv["secret-secret-access-key"] === undefined) {
						argv["secret-secret-access-key"] = await promptForRequiredField(
							"secret-secret-access-key",
							"The secret.secretAccessKey field",
							{ kind: "secret" }
						);
					}
					if (argv["vendor"] === undefined) {
						argv["vendor"] = await promptForRequiredEnumField(
							"vendor",
							"The vendor field",
							["r2"] as const
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf r2 super-slurper connectivity-precheck target",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/slurper/target/connectivity-precheck`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										bucket: resolveFileToken(
											argv["bucket"] as string | undefined,
											"bucket",
											"text"
										),
										jurisdiction: argv["jurisdiction"],
										secret: {
											accessKeyId: resolveFileToken(
												argv["secret-access-key-id"] as string | undefined,
												"secret-access-key-id",
												"text"
											),
											secretAccessKey: resolveFileToken(
												argv["secret-secret-access-key"] as string | undefined,
												"secret-secret-access-key",
												"text"
											),
										},
										vendor: argv["vendor"],
									}),
						sensitiveBodyPaths: [["secret", "secretAccessKey"]],
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
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					bucket: resolveFileToken(
						argv["bucket"] as string | undefined,
						"bucket",
						"text"
					),
					jurisdiction: argv["jurisdiction"],
					secret: {
						accessKeyId: resolveFileToken(
							argv["secret-access-key-id"] as string | undefined,
							"secret-access-key-id",
							"text"
						),
						secretAccessKey: resolveFileToken(
							argv["secret-secret-access-key"] as string | undefined,
							"secret-secret-access-key",
							"text"
						),
					},
					vendor: argv["vendor"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
