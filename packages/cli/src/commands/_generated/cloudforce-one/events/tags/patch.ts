import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * patch command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one events tags patch <tag-uuid>\n\nUpdates an account-owned Source-of-Truth tag by UUID and returns its complete owner projection."
		)
		.positional("tag-uuid", {
			type: "string",
			description: "Tag UUID.",
			demandOption: true,
		})
		.option("alias-group-names", {
			type: "string",
			array: true,
			description: "The aliasGroupNames field",
		})
		.option("alias-group-names-internal", {
			type: "string",
			array: true,
			description: "The aliasGroupNamesInternal field",
		})
		.option("aliases", {
			type: "string",
			description:
				"Structured aliases ({ value, confidence 1-10, tlp }). Public: returned to all accounts with per-entry TLP filtering (entries with tlp: purple are removed for non-CFONE accounts). Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("category-uuid", {
			type: "string",
			description:
				"Tag type (category) UUID. When changed, existing `properties` are re-validated against the new category's schema (400 on mismatch). Set to null to unlink (typeless; properties stop being validated).",
		})
		.option("confidence", {
			type: "number",
			description: "Overall tag confidence (1-10). Omit to preserve existing.",
		})
		.option("date-of-discovery", {
			type: "string",
			description:
				"Date of discovery (ISO YYYY-MM-DD). Omit to preserve existing.",
		})
		.option("description", {
			type: "string",
			description: "The description field",
		})
		.option("external-reference-links", {
			type: "string",
			array: true,
			description: "The externalReferenceLinks field",
		})
		.option("external-references", {
			type: "string",
			description:
				"Structured external references ({ url, description }). Public: returned to all accounts. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("internal-aliases", {
			type: "string",
			description:
				"Owner-private structured aliases ({ value, confidence 1-10, tlp }). Returned to the owning account and omitted from shared-catalog non-owner responses. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("internal-description", {
			type: "string",
			description: "The internalDescription field",
		})
		.option("last-seen", { type: "string", description: "The lastSeen field" })
		.option("tlp", {
			type: "string",
			description:
				"Tag-level TLP marking. Omit to preserve existing. Cannot be cleared to null.",
			choices: [
				"red",
				"amber",
				"amber-strict",
				"green",
				"clear",
				"purple",
				"amber+strict",
			],
		})
		.option("value", { type: "string", description: "The value field" })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"patch_TagUpdate">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "patch <tag-uuid>",
	describe: "Updates a tag (SoT)",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one events tags patch",
				classification: {
					safeFlags: ["tlp", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one events tags patch",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/tags/${argv["tag-uuid"] == null ? "<tag-uuid>" : encodeURIComponent(String(argv["tag-uuid"]))}`,
						pathParams: { "tag-uuid": String(argv["tag-uuid"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
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
										tlp: resolveFileToken(
											argv["tlp"] as string | undefined,
											"tlp",
											"text"
										),
										value: resolveFileToken(
											argv["value"] as string | undefined,
											"value",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.cloudforceOne.events.tags.patch({
							...bodyData,
							account_id: accountId,
							tag_uuid: argv["tag-uuid"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
					tlp: resolveFileToken(
						argv["tlp"] as string | undefined,
						"tlp",
						"text"
					),
					value: resolveFileToken(
						argv["value"] as string | undefined,
						"value",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.cloudforceOne.events.tags.patch({
						...bodyData,
						account_id: accountId,
						tag_uuid: argv["tag-uuid"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
