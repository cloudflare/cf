import operation from "../../../_operations/r2/super-slurper/jobs/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
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

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
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
	);
}
