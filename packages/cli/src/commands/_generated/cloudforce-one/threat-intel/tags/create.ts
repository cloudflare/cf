import operation from "../../../_operations/cloudforce-one/threat-intel/tags/create.js";
/**
 * create command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseJsonMap,
	parseObjectArray,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Create a tag",
	usage:
		"$0 cloudforce-one threat-intel tags create\n\nCreates a tag in the account and returns the complete tag.",
	flags: {
		"alias-group-names": {
			kind: "parsed",
			brief: "The aliasGroupNames field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"alias-group-names-internal": {
			kind: "parsed",
			brief: "The aliasGroupNamesInternal field",
			variadic: true,
			optional: true,
			parse: String,
		},
		aliases: {
			kind: "parsed",
			brief:
				'Structured aliases ({ value, confidence 1-10, tlp }). Public: returned to all accounts with per-entry TLP filtering (entries with tlp: purple are removed for non-CFONE accounts). Provide as a JSON array of objects or @path/to/file.json. Shape: [{"value": string, "confidence"?: (number | null), "tlp"?: ("red" | "amber" | "amber-strict" | ...more | null)}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"category-uuid": {
			kind: "parsed",
			brief:
				"Tag type (category) UUID. Optional — when present, `properties` is validated against this category's schema. When absent, the tag is typeless and properties are accepted free-form.",
			optional: true,
			parse: String,
		},
		confidence: {
			kind: "parsed",
			brief: "Overall tag confidence (1-10). Optional.",
			optional: true,
			parse: Number,
		},
		"date-of-discovery": {
			kind: "parsed",
			brief: "Date of discovery (ISO YYYY-MM-DD). Optional.",
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "The description field",
			optional: true,
			parse: String,
		},
		"external-reference-links": {
			kind: "parsed",
			brief: "The externalReferenceLinks field",
			variadic: true,
			optional: true,
			parse: String,
		},
		"external-references": {
			kind: "parsed",
			brief:
				'Structured external references ({ url, description }). Public: returned to all accounts. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"url": string, "description"?: (string | null)}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"internal-aliases": {
			kind: "parsed",
			brief:
				'Owner-private structured aliases ({ value, confidence 1-10, tlp }). Returned to the owning account and omitted from shared-catalog non-owner responses. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"value": string, "confidence"?: (number | null), "tlp"?: ("red" | "amber" | "amber-strict" | ...more | null)}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		"internal-description": {
			kind: "parsed",
			brief: "The internalDescription field",
			optional: true,
			parse: String,
		},
		"last-seen": {
			kind: "parsed",
			brief: "The lastSeen field",
			optional: true,
			parse: String,
		},
		properties: {
			kind: "parsed",
			brief:
				'Structured metadata blob. Optional. When `categoryUuid` is given, validated against this category\'s schema on write. When typeless, accepted free-form. Use `{}` for a tag with no custom data. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		tlp: {
			kind: "parsed",
			brief:
				"Tag-level TLP handling marking. Optional. Allowed values: red, amber, amber-strict, green, clear, purple, amber+strict.",
			optional: true,
			choices: [
				"red",
				"amber",
				"amber-strict",
				"green",
				"clear",
				"purple",
				"amber+strict",
			],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "tlp", "text"),
		},
		value: {
			kind: "parsed",
			brief: "The value field",
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
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-intel tags create",
				classification: {
					safeFlags: ["tlp", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["value"] === undefined) {
						argv["value"] = await promptForRequiredField(
							"value",
							"The value field"
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one threat-intel tags create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/tags/create`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
											aliasGroupNames: argv["alias-group-names"],
											aliasGroupNamesInternal:
												argv["alias-group-names-internal"],
											aliases: parseObjectArray(argv["aliases"], "aliases"),
											categoryUuid: resolveFileToken(
												argv["category-uuid"] as string | undefined,
												"category-uuid",
												"text"
											),
											confidence: argv["confidence"],
											dateOfDiscovery: resolveFileToken(
												argv["date-of-discovery"] as string | undefined,
												"date-of-discovery",
												"text"
											),
											description: resolveFileToken(
												argv["description"] as string | undefined,
												"description",
												"text"
											),
											externalReferenceLinks: argv["external-reference-links"],
											externalReferences: parseObjectArray(
												argv["external-references"],
												"external-references"
											),
											internalAliases: parseObjectArray(
												argv["internal-aliases"],
												"internal-aliases"
											),
											internalDescription: resolveFileToken(
												argv["internal-description"] as string | undefined,
												"internal-description",
												"text"
											),
											lastSeen: resolveFileToken(
												argv["last-seen"] as string | undefined,
												"last-seen",
												"text"
											),
											properties: parseJsonMap(
												argv["properties"],
												"properties"
											),
											tlp: argv["tlp"],
											value: resolveFileToken(
												argv["value"] as string | undefined,
												"value",
												"text"
											),
										},
										[["properties"]]
									),
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
				const bodyData = compactBody(
					{
						aliasGroupNames: argv["alias-group-names"],
						aliasGroupNamesInternal: argv["alias-group-names-internal"],
						aliases: parseObjectArray(argv["aliases"], "aliases"),
						categoryUuid: resolveFileToken(
							argv["category-uuid"] as string | undefined,
							"category-uuid",
							"text"
						),
						confidence: argv["confidence"],
						dateOfDiscovery: resolveFileToken(
							argv["date-of-discovery"] as string | undefined,
							"date-of-discovery",
							"text"
						),
						description: resolveFileToken(
							argv["description"] as string | undefined,
							"description",
							"text"
						),
						externalReferenceLinks: argv["external-reference-links"],
						externalReferences: parseObjectArray(
							argv["external-references"],
							"external-references"
						),
						internalAliases: parseObjectArray(
							argv["internal-aliases"],
							"internal-aliases"
						),
						internalDescription: resolveFileToken(
							argv["internal-description"] as string | undefined,
							"internal-description",
							"text"
						),
						lastSeen: resolveFileToken(
							argv["last-seen"] as string | undefined,
							"last-seen",
							"text"
						),
						properties: parseJsonMap(argv["properties"], "properties"),
						tlp: argv["tlp"],
						value: resolveFileToken(
							argv["value"] as string | undefined,
							"value",
							"text"
						),
					},
					[["properties"]]
				);
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
