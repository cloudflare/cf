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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/logpush.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 logpush transformers update <transformer-id>\n\nUpdates an existing custom log transformer. When `code` is provided, the SQL query is validated and a new version is created. When `code` is omitted, only the name and description are updated. Omitting `description` clears the existing description."
		)
		.positional("transformer-id", {
			type: "string",
			description: "The transformer ID.",
			demandOption: true,
		})
		.option("code", {
			type: "string",
			description:
				"The SQL transformer query. Maximum 32 KB. The query must contain a FROM clause referencing a valid logpush dataset.",
		})
		.option("description", {
			type: "string",
			description: "Optional customer-provided description.",
		})
		.option("name", {
			type: "string",
			description: "Customer-provided name for identification.",
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

type Request =
	SdkRequest<"put-accounts-account_id-logpush-transformers-transformer_id">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <transformer-id>",
	describe: "Update transformer",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "logpush transformers update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf logpush transformers update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/logpush/transformers/${argv["transformer-id"] == null ? "<transformer-id>" : encodeURIComponent(String(argv["transformer-id"]))}`,
						pathParams: {
							"transformer-id": String(argv["transformer-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										code: resolveFileToken(
											argv["code"] as string | undefined,
											"code",
											"text"
										),
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
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
						client.logpush.transformers.update({
							...bodyData,
							account_id: accountId,
							transformer_id: argv["transformer-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Customer-provided name for identification."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					code: resolveFileToken(
						argv["code"] as string | undefined,
						"code",
						"text"
					),
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.logpush.transformers.update({
						...bodyData,
						account_id: accountId,
						transformer_id: argv["transformer-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
