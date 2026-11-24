import operation from "../../../_operations/r2/super-slurper/jobs/create.js";
/**
 * create command
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
import { validateBodyUnions } from "#lib/body-unions.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const bodyUnions: Parameters<typeof validateBodyUnions>[1] = [
	{
		path: ["source"],
		selector: "vendor",
		variants: [
			{
				values: ["s3"],
				schema: {
					type: "object",
					properties: {
						bucket: { type: "string" },
						endpoint: { anyOf: [{ type: "string" }, { type: "null" }] },
						keys: {
							anyOf: [
								{ type: "array", items: { type: "string" }, maxItems: 10000 },
								{ type: "null" },
							],
						},
						pathPrefix: { anyOf: [{ type: "string" }, { type: "null" }] },
						region: { anyOf: [{ type: "string" }, { type: "null" }] },
						secret: {
							type: "object",
							properties: {
								accessKeyId: { type: "string" },
								secretAccessKey: { type: "string" },
							},
							required: ["accessKeyId", "secretAccessKey"],
							additionalProperties: false,
						},
						vendor: { enum: ["s3"] },
					},
					required: ["bucket", "secret", "vendor"],
					additionalProperties: false,
				},
			},
			{
				values: ["gcs"],
				schema: {
					type: "object",
					properties: {
						bucket: { type: "string" },
						keys: {
							anyOf: [
								{ type: "array", items: { type: "string" }, maxItems: 10000 },
								{ type: "null" },
							],
						},
						pathPrefix: { anyOf: [{ type: "string" }, { type: "null" }] },
						secret: {
							type: "object",
							properties: {
								clientEmail: { type: "string" },
								privateKey: { type: "string" },
							},
							required: ["clientEmail", "privateKey"],
							additionalProperties: false,
						},
						vendor: { enum: ["gcs"] },
					},
					required: ["bucket", "secret", "vendor"],
					additionalProperties: false,
				},
			},
			{
				values: ["r2"],
				schema: {
					type: "object",
					properties: {
						bucket: { type: "string" },
						jurisdiction: {
							anyOf: [
								{ enum: ["default", "eu", "us", "fedramp"] },
								{ type: "null" },
							],
						},
						keys: {
							anyOf: [
								{ type: "array", items: { type: "string" }, maxItems: 10000 },
								{ type: "null" },
							],
						},
						pathPrefix: { anyOf: [{ type: "string" }, { type: "null" }] },
						secret: {
							type: "object",
							properties: {
								accessKeyId: { type: "string" },
								secretAccessKey: { type: "string" },
							},
							required: ["accessKeyId", "secretAccessKey"],
							additionalProperties: false,
						},
						vendor: { enum: ["r2"] },
					},
					required: ["bucket", "secret", "vendor"],
					additionalProperties: false,
				},
			},
		],
	},
];

const command = apiCommand({
	command: "create",
	describe: "Create a job",
	usage:
		"$0 r2 super-slurper jobs create\n\nCreates a new R2 Super Slurper migration job to transfer objects from a source bucket (e.g. S3, GCS, R2) to R2.",
	flags: {
		overwrite: { kind: "boolean", brief: "The overwrite field", default: true },
		"source-bucket": {
			kind: "parsed",
			brief: "The source.bucket field",
			optional: true,
			parse: String,
		},
		"source-endpoint": {
			kind: "parsed",
			brief: "Custom S3-compatible endpoint that must use https://.",
			optional: true,
			parse: String,
		},
		"source-keys": {
			kind: "parsed",
			brief: "The source.keys field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"source-path-prefix": {
			kind: "parsed",
			brief: "The source.pathPrefix field",
			optional: true,
			parse: String,
		},
		"source-region": {
			kind: "parsed",
			brief: "The source.region field",
			optional: true,
			parse: String,
		},
		"source-secret-access-key-id": {
			kind: "parsed",
			brief: "The source.secret.accessKeyId field",
			optional: true,
			parse: String,
		},
		"source-secret-secret-access-key": {
			kind: "parsed",
			brief: "The source.secret.secretAccessKey field",
			optional: true,
			parse: String,
		},
		"source-secret-client-email": {
			kind: "parsed",
			brief: "The source.secret.clientEmail field",
			optional: true,
			parse: String,
		},
		"source-secret-private-key": {
			kind: "parsed",
			brief: "The source.secret.privateKey field",
			optional: true,
			parse: String,
		},
		"source-vendor": {
			kind: "parsed",
			brief: "The source.vendor field",
			optional: true,
			choices: ["s3", "gcs", "r2"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "source-vendor", "text"),
		},
		"source-jurisdiction": {
			kind: "parsed",
			brief: "The source.jurisdiction field",
			optional: true,
			choices: ["default", "eu", "us", "fedramp"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "source-jurisdiction", "text"),
		},
		"target-bucket": {
			kind: "parsed",
			brief: "The target.bucket field",
			optional: true,
			parse: String,
		},
		"target-jurisdiction": {
			kind: "parsed",
			brief: "The target.jurisdiction field",
			optional: true,
			choices: ["default", "eu", "us", "fedramp"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "target-jurisdiction", "text"),
		},
		"target-secret-access-key-id": {
			kind: "parsed",
			brief: "The target.secret.accessKeyId field",
			optional: true,
			parse: String,
		},
		"target-secret-secret-access-key": {
			kind: "parsed",
			brief: "The target.secret.secretAccessKey field",
			optional: true,
			parse: String,
		},
		"target-vendor": {
			kind: "parsed",
			brief: "The target.vendor field",
			optional: true,
			choices: ["r2"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "target-vendor", "text"),
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
		rules.conflicts("source-endpoint", [
			"source-secret-client-email",
			"source-secret-private-key",
			"source-jurisdiction",
		]);
		rules.implies("source-endpoint", [
			"source-secret-access-key-id",
			"source-secret-secret-access-key",
		]);
		rules.conflicts("source-region", [
			"source-secret-client-email",
			"source-secret-private-key",
			"source-jurisdiction",
		]);
		rules.implies("source-region", [
			"source-secret-access-key-id",
			"source-secret-secret-access-key",
		]);
		rules.conflicts("source-secret-access-key-id", [
			"source-secret-client-email",
			"source-secret-private-key",
		]);
		rules.implies("source-secret-access-key-id", [
			"source-secret-secret-access-key",
		]);
		rules.conflicts("source-secret-secret-access-key", [
			"source-secret-client-email",
			"source-secret-private-key",
		]);
		rules.implies("source-secret-secret-access-key", [
			"source-secret-access-key-id",
		]);
		rules.conflicts("source-secret-client-email", [
			"source-endpoint",
			"source-region",
			"source-secret-access-key-id",
			"source-secret-secret-access-key",
			"source-jurisdiction",
		]);
		rules.implies("source-secret-client-email", ["source-secret-private-key"]);
		rules.conflicts("source-secret-private-key", [
			"source-endpoint",
			"source-region",
			"source-secret-access-key-id",
			"source-secret-secret-access-key",
			"source-jurisdiction",
		]);
		rules.implies("source-secret-private-key", ["source-secret-client-email"]);
		rules.conflicts("source-jurisdiction", [
			"source-endpoint",
			"source-region",
			"source-secret-client-email",
			"source-secret-private-key",
		]);
		rules.implies("source-jurisdiction", [
			"source-secret-access-key-id",
			"source-secret-secret-access-key",
		]);
		rules.check((argv) => {
			const groupSet = [
				"source-bucket",
				"source-endpoint",
				"source-keys",
				"source-path-prefix",
				"source-region",
				"source-secret-access-key-id",
				"source-secret-secret-access-key",
				"source-secret-client-email",
				"source-secret-private-key",
				"source-vendor",
				"source-jurisdiction",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = ["source-bucket", "source-vendor"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --source-* flag is set`
					);
				}
			}
			return true;
		});
		rules.check((argv) => {
			const groupSet = [
				"target-bucket",
				"target-jurisdiction",
				"target-secret-access-key-id",
				"target-secret-secret-access-key",
				"target-vendor",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = [
					"target-bucket",
					"target-secret-access-key-id",
					"target-secret-secret-access-key",
					"target-vendor",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --target-* flag is set`
					);
				}
			}
			return true;
		});
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "r2 super-slurper jobs create",
				classification: {
					safeFlags: [
						"overwrite",
						"source-vendor",
						"source-jurisdiction",
						"target-jurisdiction",
						"target-vendor",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf r2 super-slurper jobs create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/slurper/jobs`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: validateBodyUnions(
										compactBody({
											overwrite: argv["overwrite"],
											source: {
												bucket: resolveFileToken(
													argv["source-bucket"] as string | undefined,
													"source-bucket",
													"text"
												),
												endpoint: resolveFileToken(
													argv["source-endpoint"] as string | undefined,
													"source-endpoint",
													"text"
												),
												keys: argv["source-keys"],
												pathPrefix: resolveFileToken(
													argv["source-path-prefix"] as string | undefined,
													"source-path-prefix",
													"text"
												),
												region: resolveFileToken(
													argv["source-region"] as string | undefined,
													"source-region",
													"text"
												),
												secret: {
													accessKeyId: resolveFileToken(
														argv["source-secret-access-key-id"] as
															| string
															| undefined,
														"source-secret-access-key-id",
														"text"
													),
													secretAccessKey: resolveFileToken(
														argv["source-secret-secret-access-key"] as
															| string
															| undefined,
														"source-secret-secret-access-key",
														"text"
													),
													clientEmail: resolveFileToken(
														argv["source-secret-client-email"] as
															| string
															| undefined,
														"source-secret-client-email",
														"text"
													),
													privateKey: resolveFileToken(
														argv["source-secret-private-key"] as
															| string
															| undefined,
														"source-secret-private-key",
														"text"
													),
												},
												vendor: argv["source-vendor"],
												jurisdiction: argv["source-jurisdiction"],
											},
											target: {
												bucket: resolveFileToken(
													argv["target-bucket"] as string | undefined,
													"target-bucket",
													"text"
												),
												jurisdiction: argv["target-jurisdiction"],
												secret: {
													accessKeyId: resolveFileToken(
														argv["target-secret-access-key-id"] as
															| string
															| undefined,
														"target-secret-access-key-id",
														"text"
													),
													secretAccessKey: resolveFileToken(
														argv["target-secret-secret-access-key"] as
															| string
															| undefined,
														"target-secret-secret-access-key",
														"text"
													),
												},
												vendor: argv["target-vendor"],
											},
										}),
										bodyUnions
									),
						sensitiveBodyPaths: [
							["source", "secret", "secretAccessKey"],
							["source", "secret", "privateKey"],
							["target", "secret", "secretAccessKey"],
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
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					overwrite: argv["overwrite"],
					source: {
						bucket: resolveFileToken(
							argv["source-bucket"] as string | undefined,
							"source-bucket",
							"text"
						),
						endpoint: resolveFileToken(
							argv["source-endpoint"] as string | undefined,
							"source-endpoint",
							"text"
						),
						keys: argv["source-keys"],
						pathPrefix: resolveFileToken(
							argv["source-path-prefix"] as string | undefined,
							"source-path-prefix",
							"text"
						),
						region: resolveFileToken(
							argv["source-region"] as string | undefined,
							"source-region",
							"text"
						),
						secret: {
							accessKeyId: resolveFileToken(
								argv["source-secret-access-key-id"] as string | undefined,
								"source-secret-access-key-id",
								"text"
							),
							secretAccessKey: resolveFileToken(
								argv["source-secret-secret-access-key"] as string | undefined,
								"source-secret-secret-access-key",
								"text"
							),
							clientEmail: resolveFileToken(
								argv["source-secret-client-email"] as string | undefined,
								"source-secret-client-email",
								"text"
							),
							privateKey: resolveFileToken(
								argv["source-secret-private-key"] as string | undefined,
								"source-secret-private-key",
								"text"
							),
						},
						vendor: argv["source-vendor"],
						jurisdiction: argv["source-jurisdiction"],
					},
					target: {
						bucket: resolveFileToken(
							argv["target-bucket"] as string | undefined,
							"target-bucket",
							"text"
						),
						jurisdiction: argv["target-jurisdiction"],
						secret: {
							accessKeyId: resolveFileToken(
								argv["target-secret-access-key-id"] as string | undefined,
								"target-secret-access-key-id",
								"text"
							),
							secretAccessKey: resolveFileToken(
								argv["target-secret-secret-access-key"] as string | undefined,
								"target-secret-secret-access-key",
								"text"
							),
						},
						vendor: argv["target-vendor"],
					},
				});
				validateBodyUnions(bodyData, bodyUnions);
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
