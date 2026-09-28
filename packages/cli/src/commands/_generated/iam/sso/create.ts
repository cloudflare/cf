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
 * create command
 * @generated from apis/overlays/iam.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 iam sso create\n\nCreates a new SSO connector for logging into Cloudflare through an identity provider."
		)
		.option("begin-verification", {
			type: "boolean",
			description: "Begin the verification process after creation",
			default: true,
		})
		.option("email-domain", {
			type: "string",
			description: "Email domain of the new SSO connector",
		})
		.option("use-fedramp-language", {
			type: "boolean",
			description:
				"Controls the display of FedRAMP language to the user during SSO login",
			default: false,
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

type Request = SdkRequest<"init-new-sso-connector">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Initialize new SSO connector",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "iam sso create",
				classification: {
					safeFlags: ["begin-verification", "use-fedramp-language", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf iam sso create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/sso_connectors`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										begin_verification: argv["begin-verification"],
										email_domain: resolveFileToken(
											argv["email-domain"] as string | undefined,
											"email-domain",
											"text"
										),
										use_fedramp_language: argv["use-fedramp-language"],
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
						client.iam.sso.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["email-domain"] === undefined) {
					argv["email-domain"] = await promptForRequiredField(
						"email-domain",
						"Email domain of the new SSO connector"
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					begin_verification: argv["begin-verification"],
					email_domain: resolveFileToken(
						argv["email-domain"] as string | undefined,
						"email-domain",
						"text"
					),
					use_fedramp_language: argv["use-fedramp-language"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.iam.sso.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
