import operation from "../../_operations/resource-sharing/resources/create.js";
/**
 * create command
 * @generated from apis/overlays/resource-sharing.ts
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
	command: "create <share-id>",
	describe: "Trigger a resource addition to a share",
	usage:
		"$0 resource-sharing resources create <share-id>\n\nAdds a resource to an existing share, making it available to share recipients.",
	flags: {
		meta: {
			kind: "parsed",
			brief:
				'Resource Metadata. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": unknown}.',
			optional: true,
			parse: String,
		},
		"resource-account-id": {
			kind: "parsed",
			brief:
				"The account that owns the resource. Must match the `account_id` in the path.",
			optional: true,
			parse: String,
		},
		"resource-id": {
			kind: "parsed",
			brief:
				"Identifier assigned by the service that owns the shared resource.",
			optional: true,
			parse: String,
		},
		"resource-type": {
			kind: "parsed",
			brief: "Resource Type.",
			optional: true,
			choices: [
				"custom-ruleset",
				"gateway-policy",
				"gateway-destination-ip",
				"gateway-block-page-settings",
				"gateway-extended-email-matching",
				"idp-federation-grant",
				"trust-grant",
			],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "resource-type", "text"),
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
	operands: [
		{ placeholder: "share-id", brief: "Share identifier tag.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "resource-sharing resources create",
				classification: {
					safeFlags: ["resource-type", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["meta"] === undefined) {
						throw new Error(
							"--meta is required (or pass --body with this field set)."
						);
					}
					if (argv["resource-account-id"] === undefined) {
						argv["resource-account-id"] = await promptForRequiredField(
							"resource-account-id",
							"The account that owns the resource. Must match the \`account_id\` in the path."
						);
					}
					if (argv["resource-id"] === undefined) {
						argv["resource-id"] = await promptForRequiredField(
							"resource-id",
							"Identifier assigned by the service that owns the shared resource."
						);
					}
					if (argv["resource-type"] === undefined) {
						argv["resource-type"] = await promptForRequiredEnumField(
							"resource-type",
							"Resource Type.",
							[
								"custom-ruleset",
								"gateway-policy",
								"gateway-destination-ip",
								"gateway-block-page-settings",
								"gateway-extended-email-matching",
								"idp-federation-grant",
								"trust-grant",
							] as const
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf resource-sharing resources create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/shares/${argv["share-id"] == null ? "<share-id>" : encodeURIComponent(String(argv["share-id"]))}/resources`,
						pathParams: { "share-id": String(argv["share-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body, [{ path: ["meta"], flag: "meta" }])
								: compactBody(
										{
											meta: parseJsonMap(argv["meta"], "meta", true),
											resource_account_id: resolveFileToken(
												argv["resource-account-id"] as string | undefined,
												"resource-account-id",
												"text"
											),
											resource_id: resolveFileToken(
												argv["resource-id"] as string | undefined,
												"resource-id",
												"text"
											),
											resource_type: argv["resource-type"],
										},
										[["meta"]]
									),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined
						? parseBody(argv.body, [{ path: ["meta"], flag: "meta" }])
						: undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							share_id: argv["share-id"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
						meta: parseJsonMap(argv["meta"], "meta", true),
						resource_account_id: resolveFileToken(
							argv["resource-account-id"] as string | undefined,
							"resource-account-id",
							"text"
						),
						resource_id: resolveFileToken(
							argv["resource-id"] as string | undefined,
							"resource-id",
							"text"
						),
						resource_type: argv["resource-type"],
					},
					[["meta"]]
				);
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						share_id: argv["share-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
