import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/vectorize.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 vectorize metadata-index create <index-name>\n\nEnable metadata filtering based on metadata property. Limited to 10 properties."
		)
		.positional("index-name", {
			type: "string",
			description: "Index name",
			demandOption: true,
		})
		.option("index-type", {
			type: "string",
			description: "Specifies the type of metadata property to index.",
			choices: ["string", "number", "boolean"],
		})
		.coerce("index-type", (value) =>
			resolveFileToken(value, "index-type", "text")
		)
		.option("property-name", {
			type: "string",
			description: "Specifies the metadata property to index.",
		})
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

type Request = SdkRequest<"vectorize-create-metadata-index">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <index-name>",
	describe: "Create Metadata Index",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "vectorize metadata-index create",
				classification: {
					safeFlags: ["index-type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf vectorize metadata-index create",
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
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.vectorize.metadataIndex.create({
							...bodyData,
							account_id: accountId,
							index_name: argv["index-name"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
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

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					indexType: argv["index-type"],
					propertyName: resolveFileToken(
						argv["property-name"] as string | undefined,
						"property-name",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.vectorize.metadataIndex.create({
						...bodyData,
						account_id: accountId,
						index_name: argv["index-name"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
