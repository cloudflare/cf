import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * test command
 * @generated from apis/overlays/cloudforce-one.ts
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
			"$0 cloudforce-one rules email test <id>\n\nTest a structured email rule against sample email JSON."
		)
		.positional("id", {
			type: "string",
			description: "The unique identifier for the rule.",
			demandOption: true,
		})
		.option("sample-json", {
			type: "string",
			description: "The sample_json field",
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

type Request = SdkRequest<"cloudforce-one-test-email-rule">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "test <id>",
	describe: "Test an email rule",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one rules email test",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one rules email test",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/rules/structured/${argv["id"] == null ? "<id>" : encodeURIComponent(String(argv["id"]))}/test`,
						pathParams: { id: String(argv["id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										sample_json: resolveFileToken(
											argv["sample-json"] as string | undefined,
											"sample-json",
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
						client.cloudforceOne.rules.email.test({
							...bodyData,
							account_id: accountId,
							id: argv["id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["sample-json"] === undefined) {
					argv["sample-json"] = await promptForRequiredField(
						"sample-json",
						"The sample_json field"
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					sample_json: resolveFileToken(
						argv["sample-json"] as string | undefined,
						"sample-json",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.cloudforceOne.rules.email.test({
						...bodyData,
						account_id: accountId,
						id: argv["id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
