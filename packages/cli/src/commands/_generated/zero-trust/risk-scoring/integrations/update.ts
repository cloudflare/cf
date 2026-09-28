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
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust risk-scoring integrations update <integration-id>\n\nOverwrite the reference_id, tenant_url, and active values with the ones provided."
		)
		.positional("integration-id", {
			type: "string",
			description: "Integration ID",
			demandOption: true,
		})
		.option("active", {
			type: "boolean",
			description:
				"Whether this integration is enabled. If disabled, no risk changes will be exported to the third-party.",
		})
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

type Request = SdkRequest<"dlp-zt-risk-score-integration-update">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <integration-id>",
	describe: "Update a risk score integration.",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust risk-scoring integrations update",
				classification: {
					safeFlags: ["active", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust risk-scoring integrations update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/zt_risk_scoring/integrations/${argv["integration-id"] == null ? "<integration-id>" : encodeURIComponent(String(argv["integration-id"]))}`,
						pathParams: {
							"integration-id": String(argv["integration-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										active: argv["active"],
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
					const result = await withProgress(`Updating`, async () =>
						client.zeroTrust.riskScoring.integrations.update({
							...bodyData,
							account_id: accountId,
							integration_id: argv["integration-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["active"] === undefined) {
					throw new Error(
						"--active is required (or pass --body with this field set)."
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
					active: argv["active"],
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
				const result = await withProgress(`Updating`, async () =>
					client.zeroTrust.riskScoring.integrations.update({
						...bodyData,
						account_id: accountId,
						integration_id: argv["integration-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
