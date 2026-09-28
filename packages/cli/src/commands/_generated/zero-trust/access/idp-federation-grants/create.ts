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
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust access idp-federation-grants create\n\nCreates an IdP federation grant for the specified identity provider, making it available for federation to other accounts in the same Cloudflare organization. The account must belong to a Cloudflare organization. One-time pin and Cloudflare-managed identity providers cannot be federated. An account can federate at most five identity providers at a time."
		)
		.option("idp-id", {
			type: "string",
			description:
				"UID of the identity provider to federate. Must be an existing identity provider in this account. One-time pin and Cloudflare-managed identity providers cannot be federated.",
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

type Request = SdkRequest<"access-idp-federation-grants-create">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create an IdP federation grant",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust access idp-federation-grants create",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust access idp-federation-grants create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/access/idp_federation_grants`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										idp_id: resolveFileToken(
											argv["idp-id"] as string | undefined,
											"idp-id",
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
						client.zeroTrust.access.idpFederationGrants.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["idp-id"] === undefined) {
					argv["idp-id"] = await promptForRequiredField(
						"idp-id",
						"UID of the identity provider to federate. Must be an existing identity provider in this account. One-time pin and Cloudflare-managed identity providers cannot be federated."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					idp_id: resolveFileToken(
						argv["idp-id"] as string | undefined,
						"idp-id",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.zeroTrust.access.idpFederationGrants.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
