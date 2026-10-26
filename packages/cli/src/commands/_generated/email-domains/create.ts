import operation from "../_operations/email-domains/create.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * create command
 * @generated from apis/overlays/email-domains.ts
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
			"$0 email-domains create\n\nCreates a candidate and four DNS instructions. Rejects hostnames whose assigned Return-Path exceeds 201 ASCII characters. Creation follows read-only checks of the saved provider bundle and published exclusion. Hostnames inside an active full Cloudflare DNS zone return the generic hostname conflict error 2083. No per-domain provider DNS writes occur. Customer DNS observations remain pending and mail remains inactive. Unverified candidates may share a hostname. Supply an account-unique client_reference to retry the same enrollment safely; reuse with a different hostname returns error 2083. Final public-DNS, namespace protection and runtime readiness are separate gates. Available only to the configured OpenAI pilot account behind a default-off gate. Authentication failures may use the gateway error envelope."
		)
		.option("client-reference", {
			type: "string",
			description:
				"Opaque reference for one customer enrollment. Reuse it with the same hostname to retry Create safely. Distinct references can enroll the same unverified hostname; a hostname alone never identifies a customer.",
		})
		.option("hostname", {
			type: "string",
			description:
				"Exact external hostname to enroll. After ASCII conversion, the assigned Return-Path hostname must be at most 201 characters (191 for the current cf-bounce. prefix). Wildcards, provider-zone names, and hostnames inside an existing Cloudflare-managed DNS zone are rejected.",
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

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create an Email Domain",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-domains create",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-domains create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email/domains`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										client_reference: resolveFileToken(
											argv["client-reference"] as string | undefined,
											"client-reference",
											"text"
										),
										hostname: resolveFileToken(
											argv["hostname"] as string | undefined,
											"hostname",
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
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["hostname"] === undefined) {
					argv["hostname"] = await promptForRequiredField(
						"hostname",
						"Exact external hostname to enroll. After ASCII conversion, the assigned Return-Path hostname must be at most 201 characters (191 for the current cf-bounce. prefix). Wildcards, provider-zone names, and hostnames inside an existing Cloudflare-managed DNS zone are rejected."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					client_reference: resolveFileToken(
						argv["client-reference"] as string | undefined,
						"client-reference",
						"text"
					),
					hostname: resolveFileToken(
						argv["hostname"] as string | undefined,
						"hostname",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
