import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust access user-populations users create <user-population-id>\n\nCreates a SCIM user in a user population."
		)
		.positional("user-population-id", {
			type: "string",
			description: "UUID.",
			demandOption: true,
		})
		.option("active", { type: "boolean", description: "The active field" })
		.option("display-name", {
			type: "string",
			description: "The displayName field",
		})
		.option("emails", {
			type: "string",
			description:
				"The emails field. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("external-id", {
			type: "string",
			description: "The externalId field",
		})
		.option("meta-created", {
			type: "string",
			description: "The meta.created field",
		})
		.option("meta-last-modified", {
			type: "string",
			description: "The meta.lastModified field",
		})
		.option("meta-location", {
			type: "string",
			description: "The meta.location field",
		})
		.option("meta-resource-type", {
			type: "string",
			description: "The meta.resourceType field",
		})
		.option("meta-version", {
			type: "string",
			description: "The meta.version field",
		})
		.option("name-family-name", {
			type: "string",
			description: "The name.familyName field",
		})
		.option("name-formatted", {
			type: "string",
			description: "The name.formatted field",
		})
		.option("name-given-name", {
			type: "string",
			description: "The name.givenName field",
		})
		.option("name-honorific-prefix", {
			type: "string",
			description: "The name.honorificPrefix field",
		})
		.option("name-honorific-suffix", {
			type: "string",
			description: "The name.honorificSuffix field",
		})
		.option("name-middle-name", {
			type: "string",
			description: "The name.middleName field",
		})
		.option("schemas", {
			type: "string",
			array: true,
			description: "The SCIM schemas that apply to this resource.",
		})
		.option("user-name", { type: "string", description: "The userName field" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"A SCIM User resource. Additional SCIM extension attributes are supported.",
		})
		.option("file", {
			type: "string",
			description: "Path to a file to upload as the request body",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <user-population-id>",
	describe: "Create a user population user",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust access user-populations users create",
				classification: {
					safeFlags: ["active", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust access user-populations users create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/access/user_populations/${argv["user-population-id"] == null ? "<user-population-id>" : encodeURIComponent(String(argv["user-population-id"]))}/users`,
						pathParams: {
							"user-population-id": String(argv["user-population-id"] ?? ""),
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
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.file) {
					const fileContent = readFileForFlag(argv.file);
					const result = await withProgress(`Creating`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/accounts/${accountId}/access/user_populations/${encodeURIComponent(String(argv["user-population-id"]))}/users`,
							{
								body: fileContent,
								headers: { "Content-Type": "application/scim+json" },
							}
						)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Creating`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/accounts/${accountId}/access/user_populations/${encodeURIComponent(String(argv["user-population-id"]))}/users`,
							{ body: bodyData }
						)
					);
					formatOutput(result, { successLabel: `Created` });
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
				const result = await withProgress(`Creating`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/access/user_populations/${encodeURIComponent(String(argv["user-population-id"]))}/users`,
						{ body: bodyData }
					)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
