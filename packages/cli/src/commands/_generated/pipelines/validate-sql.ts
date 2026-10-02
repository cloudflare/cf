import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * validate-sql command
 * @generated from apis/overlays/pipelines.ts
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 pipelines validate-sql\n\nValidates that the Pipelines SQL is correct."
		)
		.option("sql", {
			type: "string",
			description: "Specifies SQL to validate.",
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

type Request = SdkRequest<"postV4AccountsByAccount_idPipelinesV1Validate_sql">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "validate-sql",
	describe: "Validate SQL",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "pipelines validate-sql",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf pipelines validate-sql",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/pipelines/v1/validate_sql`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										sql: resolveFileToken(
											argv["sql"] as string | undefined,
											"sql",
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
						client.pipelines.validateSql({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["sql"] === undefined) {
					argv["sql"] = await promptForRequiredField(
						"sql",
						"Specifies SQL to validate."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					sql: resolveFileToken(
						argv["sql"] as string | undefined,
						"sql",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.pipelines.validateSql({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
