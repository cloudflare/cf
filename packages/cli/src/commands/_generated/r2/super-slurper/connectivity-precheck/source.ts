import operation from "../../../_operations/r2/super-slurper/connectivity-precheck/source.js";
/**
 * source command
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
	command: "source",
	describe: "Check source connectivity",
	usage:
		"$0 r2 super-slurper connectivity-precheck source\n\nCheck whether tokens are valid against the source bucket",
	flags: {
		bucket: {
			kind: "parsed",
			brief: "The bucket field",
			optional: true,
			parse: String,
		},
		endpoint: {
			kind: "parsed",
			brief: "Custom S3-compatible endpoint that must use https://.",
			optional: true,
			parse: String,
		},
		keys: {
			kind: "parsed",
			brief: "The keys field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"path-prefix": {
			kind: "parsed",
			brief: "The pathPrefix field",
			optional: true,
			parse: String,
		},
		region: {
			kind: "parsed",
			brief: "The region field",
			optional: true,
			parse: String,
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
		"secret-client-email": {
			kind: "parsed",
			brief: "The secret.clientEmail field",
			optional: true,
			parse: String,
		},
		"secret-private-key": {
			kind: "parsed",
			brief: "The secret.privateKey field",
			optional: true,
			parse: String,
		},
		vendor: {
			kind: "parsed",
			brief: "The vendor field",
			optional: true,
			choices: ["s3", "gcs", "r2"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "vendor", "text"),
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
	rules(rules) {
		rules.conflicts("endpoint", [
			"secret-client-email",
			"secret-private-key",
			"jurisdiction",
		]);
		rules.implies("endpoint", [
			"secret-access-key-id",
			"secret-secret-access-key",
		]);
		rules.conflicts("region", [
			"secret-client-email",
			"secret-private-key",
			"jurisdiction",
		]);
		rules.implies("region", [
			"secret-access-key-id",
			"secret-secret-access-key",
		]);
		rules.conflicts("secret-access-key-id", [
			"secret-client-email",
			"secret-private-key",
		]);
		rules.implies("secret-access-key-id", ["secret-secret-access-key"]);
		rules.conflicts("secret-secret-access-key", [
			"secret-client-email",
			"secret-private-key",
		]);
		rules.implies("secret-secret-access-key", ["secret-access-key-id"]);
		rules.conflicts("secret-client-email", [
			"endpoint",
			"region",
			"secret-access-key-id",
			"secret-secret-access-key",
			"jurisdiction",
		]);
		rules.implies("secret-client-email", ["secret-private-key"]);
		rules.conflicts("secret-private-key", [
			"endpoint",
			"region",
			"secret-access-key-id",
			"secret-secret-access-key",
			"jurisdiction",
		]);
		rules.implies("secret-private-key", ["secret-client-email"]);
		rules.conflicts("jurisdiction", [
			"endpoint",
			"region",
			"secret-client-email",
			"secret-private-key",
		]);
		rules.implies("jurisdiction", [
			"secret-access-key-id",
			"secret-secret-access-key",
		]);
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "r2 super-slurper connectivity-precheck source",
				classification: {
					safeFlags: ["vendor", "jurisdiction", "dry-run"],
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
					if (argv["vendor"] === undefined) {
						argv["vendor"] = await promptForRequiredEnumField(
							"vendor",
							"The vendor field",
							["s3", "gcs", "r2"] as const
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf r2 super-slurper connectivity-precheck source",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/slurper/source/connectivity-precheck`,
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
										endpoint: resolveFileToken(
											argv["endpoint"] as string | undefined,
											"endpoint",
											"text"
										),
										keys: argv["keys"],
										pathPrefix: resolveFileToken(
											argv["path-prefix"] as string | undefined,
											"path-prefix",
											"text"
										),
										region: resolveFileToken(
											argv["region"] as string | undefined,
											"region",
											"text"
										),
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
											clientEmail: resolveFileToken(
												argv["secret-client-email"] as string | undefined,
												"secret-client-email",
												"text"
											),
											privateKey: resolveFileToken(
												argv["secret-private-key"] as string | undefined,
												"secret-private-key",
												"text"
											),
										},
										vendor: argv["vendor"],
										jurisdiction: argv["jurisdiction"],
									}),
						sensitiveBodyPaths: [
							["secret", "secretAccessKey"],
							["secret", "privateKey"],
						],
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
					endpoint: resolveFileToken(
						argv["endpoint"] as string | undefined,
						"endpoint",
						"text"
					),
					keys: argv["keys"],
					pathPrefix: resolveFileToken(
						argv["path-prefix"] as string | undefined,
						"path-prefix",
						"text"
					),
					region: resolveFileToken(
						argv["region"] as string | undefined,
						"region",
						"text"
					),
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
						clientEmail: resolveFileToken(
							argv["secret-client-email"] as string | undefined,
							"secret-client-email",
							"text"
						),
						privateKey: resolveFileToken(
							argv["secret-private-key"] as string | undefined,
							"secret-private-key",
							"text"
						),
					},
					vendor: argv["vendor"],
					jurisdiction: argv["jurisdiction"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
