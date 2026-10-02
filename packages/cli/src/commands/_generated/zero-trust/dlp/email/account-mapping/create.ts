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
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust dlp email account-mapping create\n\nCreates a mapping between a Cloudflare account and an email provider for DLP email scanning integration."
		)
		.option("auth-requirements-allowed-microsoft-organizations", {
			type: "string",
			array: true,
			description:
				"The auth_requirements.allowed_microsoft_organizations field",
		})
		.option("auth-requirements-type", {
			type: "string",
			description: "The auth_requirements.type field",
			choices: ["Org", "NoAuth"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Account mapping.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"dlp-email-scanner-create-account-mapping">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create mapping",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust dlp email account-mapping create",
				classification: {
					safeFlags: ["auth-requirements-type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust dlp email account-mapping create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dlp/email/account_mapping`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										auth_requirements: {
											allowed_microsoft_organizations:
												argv[
													"auth-requirements-allowed-microsoft-organizations"
												],
											type: resolveFileToken(
												argv["auth-requirements-type"] as string | undefined,
												"auth-requirements-type",
												"text"
											),
										},
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
						client.zeroTrust.dlp.email.accountMapping.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["auth-requirements-type"] === undefined) {
					argv["auth-requirements-type"] = await promptForRequiredEnumField(
						"auth-requirements-type",
						"The auth_requirements.type field",
						["Org", "NoAuth"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					auth_requirements: {
						allowed_microsoft_organizations:
							argv["auth-requirements-allowed-microsoft-organizations"],
						type: resolveFileToken(
							argv["auth-requirements-type"] as string | undefined,
							"auth-requirements-type",
							"text"
						),
					},
				});
				const result = await withProgress(`Creating`, async () =>
					client.zeroTrust.dlp.email.accountMapping.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
