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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust cws basic-auth-credentials secrets create <credential-id>\n\nAdds a password secret to the credential."
		)
		.positional("credential-id", {
			type: "string",
			description: "ID of the parent credential",
			demandOption: true,
		})
		.option("expires-at", {
			type: "string",
			description:
				"Optional deactivation deadline (RFC 3339). Omit or null for no expiry.",
		})
		.option("password", {
			type: "string",
			description:
				"Password stored only as a one-way hash and never returned. Maximum 72 UTF-8 bytes.",
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

type Request = SdkRequest<"cws-create-basic-auth-secret">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <credential-id>",
	describe: "Add a secret to a basic-auth credential",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust cws basic-auth-credentials secrets create",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust cws basic-auth-credentials secrets create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cws/basic-auth-credentials/${argv["credential-id"] == null ? "<credential-id>" : encodeURIComponent(String(argv["credential-id"]))}/secrets`,
						pathParams: {
							"credential-id": String(argv["credential-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										expires_at: resolveFileToken(
											argv["expires-at"] as string | undefined,
											"expires-at",
											"text"
										),
										password: resolveFileToken(
											argv["password"] as string | undefined,
											"password",
											"text"
										),
									}),
						sensitiveBodyPaths: [["password"]],
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.zeroTrust.cws.basicAuthCredentials.secrets.create({
							...bodyData,
							account_id: accountId,
							credential_id: argv["credential-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["password"] === undefined) {
					argv["password"] = await promptForRequiredField(
						"password",
						"Password stored only as a one-way hash and never returned. Maximum 72 UTF-8 bytes.",
						{ kind: "secret" }
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					expires_at: resolveFileToken(
						argv["expires-at"] as string | undefined,
						"expires-at",
						"text"
					),
					password: resolveFileToken(
						argv["password"] as string | undefined,
						"password",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.zeroTrust.cws.basicAuthCredentials.secrets.create({
						...bodyData,
						account_id: accountId,
						credential_id: argv["credential-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
