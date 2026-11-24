import operation from "../../_operations/vectorize/metadata-indexes/create.js";
/**
 * create command
 * @generated from apis/overlays/vectorize.ts
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
	command: "create <index-name>",
	describe: "Create Metadata Index",
	usage:
		"$0 vectorize metadata-indexes create <index-name>\n\nEnable metadata filtering based on metadata property. Limited to 10 properties.",
	flags: {
		"index-type": {
			kind: "parsed",
			brief: "Specifies the type of metadata property to index.",
			optional: true,
			choices: ["string", "number", "boolean"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "index-type", "text"),
		},
		"property-name": {
			kind: "parsed",
			brief: "Specifies the metadata property to index.",
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
	operands: [{ placeholder: "index-name", brief: "Index name", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "vectorize metadata-indexes create",
				classification: {
					safeFlags: ["index-type", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["index-type"] === undefined) {
						argv["index-type"] = await promptForRequiredEnumField(
							"index-type",
							"Specifies the type of metadata property to index.",
							["string", "number", "boolean"] as const
						);
					}
					if (argv["property-name"] === undefined) {
						argv["property-name"] = await promptForRequiredField(
							"property-name",
							"Specifies the metadata property to index."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf vectorize metadata-indexes create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/vectorize/v2/indexes/${argv["index-name"] == null ? "<index-name>" : encodeURIComponent(String(argv["index-name"]))}/metadata_index/create`,
						pathParams: { "index-name": String(argv["index-name"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										indexType: argv["index-type"],
										propertyName: resolveFileToken(
											argv["property-name"] as string | undefined,
											"property-name",
											"text"
										),
									}),
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
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							index_name: argv["index-name"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					indexType: argv["index-type"],
					propertyName: resolveFileToken(
						argv["property-name"] as string | undefined,
						"property-name",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						index_name: argv["index-name"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
