import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
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
			"$0 zero-trust risk-scoring integrations create\n\nCreates a new Zero Trust risk score integration, connecting external risk signals to Cloudflare's risk scoring system."
		)
		.option("integration-type", {
			type: "string",
			description: "The integration_type field",
			choices: ["Okta"],
		})
		.coerce("integration-type", (value) =>
			resolveFileToken(value, "integration-type", "text")
		)
		.option("reference-id", {
			type: "string",
			description:
				"A reference id that can be supplied by the client. Currently this should be set to the Access-Okta IDP ID (a UUIDv4).\nhttps://developers.cloudflare.com/api/operations/access-identity-providers-get-an-access-identity-provider",
		})
		.option("tenant-url", {
			type: "string",
			description:
				'The base url of the tenant, e.g. "https://tenant.okta.com".',
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

type Request = SdkRequest<"dlp-zt-risk-score-integration-create">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create new risk score integration.",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust risk-scoring integrations create",
				classification: {
					safeFlags: ["integration-type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust risk-scoring integrations create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/zt_risk_scoring/integrations`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										integration_type: argv["integration-type"],
										reference_id: resolveFileToken(
											argv["reference-id"] as string | undefined,
											"reference-id",
											"text"
										),
										tenant_url: resolveFileToken(
											argv["tenant-url"] as string | undefined,
											"tenant-url",
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
						client.zeroTrust.riskScoring.integrations.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["integration-type"] === undefined) {
					argv["integration-type"] = await promptForRequiredEnumField(
						"integration-type",
						"The integration_type field",
						["Okta"] as const
					);
				}
				if (argv["tenant-url"] === undefined) {
					argv["tenant-url"] = await promptForRequiredField(
						"tenant-url",
						'The base url of the tenant, e.g. "https://tenant.okta.com".'
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					integration_type: argv["integration-type"],
					reference_id: resolveFileToken(
						argv["reference-id"] as string | undefined,
						"reference-id",
						"text"
					),
					tenant_url: resolveFileToken(
						argv["tenant-url"] as string | undefined,
						"tenant-url",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.zeroTrust.riskScoring.integrations.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
