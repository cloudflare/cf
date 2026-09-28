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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * delete command
 * @generated from apis/overlays/vectorize.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 vectorize metadata-index delete <index-name>\n\nAllow Vectorize to delete the specified metadata index."
		)
		.positional("index-name", {
			type: "string",
			description: "Index name",
			demandOption: true,
		})
		.option("property-name", {
			type: "string",
			description:
				"Specifies the metadata property for which the index must be deleted.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("force", {
			type: "boolean",
			alias: "f",
			description: "Skip confirmation (useful in scripts and CI)",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"vectorize-delete-metadata-index">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "delete <index-name>",
	describe: "Delete Metadata Index",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "vectorize metadata-index delete",
				classification: {
					safeFlags: ["dry-run", "force"],
					shortFlagAliases: { f: { canonical: "force", type: "boolean" } },
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf vectorize metadata-index delete",
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
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (
					!(await confirmDelete({
						force: Boolean(argv.force),
						message: `This operation deletes a metadata index destructively.`,
					}))
				) {
					process.stderr.write("Aborted.\n");
					return;
				}

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Deleting`, async () =>
						client.vectorize.metadataIndex.delete({
							...bodyData,
							account_id: accountId,
							index_name: argv["index-name"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Deleted` });
					return;
				}
				if (argv["property-name"] === undefined) {
					argv["property-name"] = await promptForRequiredField(
						"property-name",
						"Specifies the metadata property for which the index must be deleted."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					propertyName: resolveFileToken(
						argv["property-name"] as string | undefined,
						"property-name",
						"text"
					),
				});
				const result = await withProgress(`Deleting`, async () =>
					client.vectorize.metadataIndex.delete({
						...bodyData,
						account_id: accountId,
						index_name: argv["index-name"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Deleted` });
			}
		),
};

export default command;
