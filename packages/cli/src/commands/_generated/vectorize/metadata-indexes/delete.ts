import operation from "../../_operations/vectorize/metadata-indexes/delete.js";
/**
 * delete command
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
import { confirmDelete, promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "delete <index-name>",
	describe: "Delete Metadata Index",
	usage:
		"$0 vectorize metadata-indexes delete <index-name>\n\nAllow Vectorize to delete the specified metadata index.",
	flags: {
		"property-name": {
			kind: "parsed",
			brief:
				"Specifies the metadata property for which the index must be deleted.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
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
				command: "vectorize metadata-indexes delete",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["property-name"] === undefined) {
						argv["property-name"] = await promptForRequiredField(
							"property-name",
							"Specifies the metadata property for which the index must be deleted."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf vectorize metadata-indexes delete",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/vectorize/v2/indexes/${argv["index-name"] == null ? "<index-name>" : encodeURIComponent(String(argv["index-name"]))}/metadata_index/delete`,
						pathParams: { "index-name": String(argv["index-name"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
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

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `This operation deletes a metadata index destructively.`,
					}))
				) {
					return;
				}

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Processing`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							index_name: argv["index-name"],
						})
					);
					formatOutput(result, { successLabel: `Done` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					propertyName: resolveFileToken(
						argv["property-name"] as string | undefined,
						"property-name",
						"text"
					),
				});
				const result = await withProgress(`Processing`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						index_name: argv["index-name"],
					})
				);
				formatOutput(result, { successLabel: `Done` });
			}
		),
});

export default command;
