/**
 * replace command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseObjectArray,
	setNestedValue,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { readFileForFlag, resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "replace <user-id>",
	describe: "Replace a user population user",
	usage:
		"$0 zero-trust access user-populations users replace <user-id>\n\nReplaces a SCIM user in a user population.",
	flags: {
		"user-population-id": { kind: "parsed", brief: "UUID.", parse: String },
		active: { kind: "boolean", brief: "The active field", optional: true },
		"display-name": {
			kind: "parsed",
			brief: "The displayName field",
			optional: true,
			parse: String,
		},
		emails: {
			kind: "parsed",
			brief:
				'The emails field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"primary"?: boolean, "type"?: string, "value"?: string}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"external-id": {
			kind: "parsed",
			brief: "The externalId field",
			optional: true,
			parse: String,
		},
		"meta-created": {
			kind: "parsed",
			brief: "The meta.created field",
			optional: true,
			parse: String,
		},
		"meta-last-modified": {
			kind: "parsed",
			brief: "The meta.lastModified field",
			optional: true,
			parse: String,
		},
		"meta-location": {
			kind: "parsed",
			brief: "The meta.location field",
			optional: true,
			parse: String,
		},
		"meta-resource-type": {
			kind: "parsed",
			brief: "The meta.resourceType field",
			optional: true,
			parse: String,
		},
		"meta-version": {
			kind: "parsed",
			brief: "The meta.version field",
			optional: true,
			parse: String,
		},
		"name-family-name": {
			kind: "parsed",
			brief: "The name.familyName field",
			optional: true,
			parse: String,
		},
		"name-formatted": {
			kind: "parsed",
			brief: "The name.formatted field",
			optional: true,
			parse: String,
		},
		"name-given-name": {
			kind: "parsed",
			brief: "The name.givenName field",
			optional: true,
			parse: String,
		},
		"name-honorific-prefix": {
			kind: "parsed",
			brief: "The name.honorificPrefix field",
			optional: true,
			parse: String,
		},
		"name-honorific-suffix": {
			kind: "parsed",
			brief: "The name.honorificSuffix field",
			optional: true,
			parse: String,
		},
		"name-middle-name": {
			kind: "parsed",
			brief: "The name.middleName field",
			optional: true,
			parse: String,
		},
		schemas: {
			kind: "parsed",
			brief: "The SCIM schemas that apply to this resource.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"user-name": {
			kind: "parsed",
			brief: "The userName field",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"A SCIM User resource. Additional SCIM extension attributes are supported.",
			optional: true,
			parse: String,
		},
		file: {
			kind: "parsed",
			brief: "Path to a file to upload as the request body",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "user-id",
			brief: "The SCIM user identifier.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust access user-populations users replace",
				classification: {
					safeFlags: ["active", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust access user-populations users replace",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/access/user_populations/${argv["user-population-id"] == null ? "<user-population-id>" : encodeURIComponent(String(argv["user-population-id"]))}/users/${argv["user-id"] == null ? "<user-id>" : encodeURIComponent(String(argv["user-id"]))}`,
						pathParams: {
							"user-population-id": String(argv["user-population-id"] ?? ""),
							"user-id": String(argv["user-id"] ?? ""),
						},
						bodyKind: argv.file !== undefined ? "octet-stream" : "json",
						body:
							argv.file !== undefined
								? { file: argv.file }
								: argv.body !== undefined
									? parseBody(argv.body)
									: compactBody({
											active: argv["active"],
											displayName: resolveFileToken(
												argv["display-name"] as string | undefined,
												"display-name",
												"text"
											),
											emails: parseObjectArray(argv["emails"], "emails"),
											externalId: resolveFileToken(
												argv["external-id"] as string | undefined,
												"external-id",
												"text"
											),
											meta: {
												created: resolveFileToken(
													argv["meta-created"] as string | undefined,
													"meta-created",
													"text"
												),
												lastModified: resolveFileToken(
													argv["meta-last-modified"] as string | undefined,
													"meta-last-modified",
													"text"
												),
												location: resolveFileToken(
													argv["meta-location"] as string | undefined,
													"meta-location",
													"text"
												),
												resourceType: resolveFileToken(
													argv["meta-resource-type"] as string | undefined,
													"meta-resource-type",
													"text"
												),
												version: resolveFileToken(
													argv["meta-version"] as string | undefined,
													"meta-version",
													"text"
												),
											},
											name: {
												familyName: resolveFileToken(
													argv["name-family-name"] as string | undefined,
													"name-family-name",
													"text"
												),
												formatted: resolveFileToken(
													argv["name-formatted"] as string | undefined,
													"name-formatted",
													"text"
												),
												givenName: resolveFileToken(
													argv["name-given-name"] as string | undefined,
													"name-given-name",
													"text"
												),
												honorificPrefix: resolveFileToken(
													argv["name-honorific-prefix"] as string | undefined,
													"name-honorific-prefix",
													"text"
												),
												honorificSuffix: resolveFileToken(
													argv["name-honorific-suffix"] as string | undefined,
													"name-honorific-suffix",
													"text"
												),
												middleName: resolveFileToken(
													argv["name-middle-name"] as string | undefined,
													"name-middle-name",
													"text"
												),
											},
											schemas: argv["schemas"],
											userName: resolveFileToken(
												argv["user-name"] as string | undefined,
												"user-name",
												"text"
											),
										}),
					});
					return;
				}
				const parsedBody =
					argv.file !== undefined
						? undefined
						: argv.body !== undefined
							? parseBody(argv.body)
							: undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.file !== undefined) {
					const fileContent = readFileForFlag(argv.file);
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PUT",
							`/accounts/${accountId}/access/user_populations/${encodeURIComponent(String(argv["user-population-id"]))}/users/${encodeURIComponent(String(argv["user-id"]))}`,
							{
								body: fileContent,
								headers: { "Content-Type": "application/scim+json" },
							}
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PUT",
							`/accounts/${accountId}/access/user_populations/${encodeURIComponent(String(argv["user-population-id"]))}/users/${encodeURIComponent(String(argv["user-id"]))}`,
							{ body: bodyData }
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["active"] !== undefined)
					setNestedValue(bodyData, ["active"], argv["active"]);
				if (argv["display-name"] !== undefined)
					setNestedValue(
						bodyData,
						["displayName"],
						resolveFileToken(
							argv["display-name"] as string | undefined,
							"display-name",
							"text"
						)
					);
				if (argv["emails"] !== undefined)
					setNestedValue(
						bodyData,
						["emails"],
						parseObjectArray(argv["emails"], "emails")
					);
				if (argv["external-id"] !== undefined)
					setNestedValue(
						bodyData,
						["externalId"],
						resolveFileToken(
							argv["external-id"] as string | undefined,
							"external-id",
							"text"
						)
					);
				if (argv["meta-created"] !== undefined)
					setNestedValue(
						bodyData,
						["meta", "created"],
						resolveFileToken(
							argv["meta-created"] as string | undefined,
							"meta-created",
							"text"
						)
					);
				if (argv["meta-last-modified"] !== undefined)
					setNestedValue(
						bodyData,
						["meta", "lastModified"],
						resolveFileToken(
							argv["meta-last-modified"] as string | undefined,
							"meta-last-modified",
							"text"
						)
					);
				if (argv["meta-location"] !== undefined)
					setNestedValue(
						bodyData,
						["meta", "location"],
						resolveFileToken(
							argv["meta-location"] as string | undefined,
							"meta-location",
							"text"
						)
					);
				if (argv["meta-resource-type"] !== undefined)
					setNestedValue(
						bodyData,
						["meta", "resourceType"],
						resolveFileToken(
							argv["meta-resource-type"] as string | undefined,
							"meta-resource-type",
							"text"
						)
					);
				if (argv["meta-version"] !== undefined)
					setNestedValue(
						bodyData,
						["meta", "version"],
						resolveFileToken(
							argv["meta-version"] as string | undefined,
							"meta-version",
							"text"
						)
					);
				if (argv["name-family-name"] !== undefined)
					setNestedValue(
						bodyData,
						["name", "familyName"],
						resolveFileToken(
							argv["name-family-name"] as string | undefined,
							"name-family-name",
							"text"
						)
					);
				if (argv["name-formatted"] !== undefined)
					setNestedValue(
						bodyData,
						["name", "formatted"],
						resolveFileToken(
							argv["name-formatted"] as string | undefined,
							"name-formatted",
							"text"
						)
					);
				if (argv["name-given-name"] !== undefined)
					setNestedValue(
						bodyData,
						["name", "givenName"],
						resolveFileToken(
							argv["name-given-name"] as string | undefined,
							"name-given-name",
							"text"
						)
					);
				if (argv["name-honorific-prefix"] !== undefined)
					setNestedValue(
						bodyData,
						["name", "honorificPrefix"],
						resolveFileToken(
							argv["name-honorific-prefix"] as string | undefined,
							"name-honorific-prefix",
							"text"
						)
					);
				if (argv["name-honorific-suffix"] !== undefined)
					setNestedValue(
						bodyData,
						["name", "honorificSuffix"],
						resolveFileToken(
							argv["name-honorific-suffix"] as string | undefined,
							"name-honorific-suffix",
							"text"
						)
					);
				if (argv["name-middle-name"] !== undefined)
					setNestedValue(
						bodyData,
						["name", "middleName"],
						resolveFileToken(
							argv["name-middle-name"] as string | undefined,
							"name-middle-name",
							"text"
						)
					);
				if (argv["schemas"] !== undefined)
					setNestedValue(bodyData, ["schemas"], argv["schemas"]);
				if (argv["user-name"] !== undefined)
					setNestedValue(
						bodyData,
						["userName"],
						resolveFileToken(
							argv["user-name"] as string | undefined,
							"user-name",
							"text"
						)
					);
				const result = await withProgress(`Updating`, async () =>
					requestApi<unknown>(
						client,
						"PUT",
						`/accounts/${accountId}/access/user_populations/${encodeURIComponent(String(argv["user-population-id"]))}/users/${encodeURIComponent(String(argv["user-id"]))}`,
						{ body: bodyData }
					)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
