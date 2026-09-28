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
 * create-create command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 cloudforce-one events queries create-create\n\nCreate a new saved event query for the account"
		)
		.option("alert-enabled", {
			type: "boolean",
			description: "Enable alerts for this query",
		})
		.option("alert-rollup-enabled", {
			type: "boolean",
			description: "Enable alert rollup for this query",
		})
		.option("name", {
			type: "string",
			description: "Unique name for the saved query",
		})
		.option("query-json", {
			type: "string",
			description: "JSON string containing the query parameters",
		})
		.option("rule-enabled", {
			type: "boolean",
			description: "Enable rule for this query",
		})
		.option("rule-scope", { type: "string", description: "Scope for the rule" })
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

type Request = SdkRequest<"post_EventQueryCreate">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create-create",
	describe: "Create a saved event query",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one events queries create-create",
				classification: {
					safeFlags: [
						"alert-enabled",
						"alert-rollup-enabled",
						"rule-enabled",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one events queries create-create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/queries/create`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										alert_enabled: argv["alert-enabled"],
										alert_rollup_enabled: argv["alert-rollup-enabled"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										query_json: resolveFileToken(
											argv["query-json"] as string | undefined,
											"query-json",
											"text"
										),
										rule_enabled: argv["rule-enabled"],
										rule_scope: resolveFileToken(
											argv["rule-scope"] as string | undefined,
											"rule-scope",
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
						client.cloudforceOne.events.queries.createCreate({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["alert-enabled"] === undefined) {
					throw new Error(
						"--alert-enabled is required (or pass --body with this field set)."
					);
				}
				if (argv["alert-rollup-enabled"] === undefined) {
					throw new Error(
						"--alert-rollup-enabled is required (or pass --body with this field set)."
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Unique name for the saved query"
					);
				}
				if (argv["query-json"] === undefined) {
					argv["query-json"] = await promptForRequiredField(
						"query-json",
						"JSON string containing the query parameters"
					);
				}
				if (argv["rule-enabled"] === undefined) {
					throw new Error(
						"--rule-enabled is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					alert_enabled: argv["alert-enabled"],
					alert_rollup_enabled: argv["alert-rollup-enabled"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					query_json: resolveFileToken(
						argv["query-json"] as string | undefined,
						"query-json",
						"text"
					),
					rule_enabled: argv["rule-enabled"],
					rule_scope: resolveFileToken(
						argv["rule-scope"] as string | undefined,
						"rule-scope",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.cloudforceOne.events.queries.createCreate({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
