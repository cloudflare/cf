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
 * @generated from apis/overlays/account.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 account profile update\n\nUpdates the profile information for a Cloudflare account. Allows modification of account-level settings and organizational details. Requires Account Settings Write permission."
		)
		.option("business-address", {
			type: "string",
			description: "The business_address field",
		})
		.option("business-email", {
			type: "string",
			description: "The business_email field",
		})
		.option("business-name", {
			type: "string",
			description: "The business_name field",
		})
		.option("business-phone", {
			type: "string",
			description: "The business_phone field",
		})
		.option("external-metadata", {
			type: "string",
			description: "The external_metadata field",
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

type Request = SdkRequest<"Accounts_modifyAccountProfile">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update",
	describe: "Modify account profile",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "account profile update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf account profile update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/profile`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										business_address: resolveFileToken(
											argv["business-address"] as string | undefined,
											"business-address",
											"text"
										),
										business_email: resolveFileToken(
											argv["business-email"] as string | undefined,
											"business-email",
											"text"
										),
										business_name: resolveFileToken(
											argv["business-name"] as string | undefined,
											"business-name",
											"text"
										),
										business_phone: resolveFileToken(
											argv["business-phone"] as string | undefined,
											"business-phone",
											"text"
										),
										external_metadata: resolveFileToken(
											argv["external-metadata"] as string | undefined,
											"external-metadata",
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
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.account.profile.update({
							body: bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["business-address"] === undefined) {
					argv["business-address"] = await promptForRequiredField(
						"business-address",
						"The business_address field"
					);
				}
				if (argv["business-email"] === undefined) {
					argv["business-email"] = await promptForRequiredField(
						"business-email",
						"The business_email field"
					);
				}
				if (argv["business-name"] === undefined) {
					argv["business-name"] = await promptForRequiredField(
						"business-name",
						"The business_name field"
					);
				}
				if (argv["business-phone"] === undefined) {
					argv["business-phone"] = await promptForRequiredField(
						"business-phone",
						"The business_phone field"
					);
				}
				if (argv["external-metadata"] === undefined) {
					argv["external-metadata"] = await promptForRequiredField(
						"external-metadata",
						"The external_metadata field"
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					business_address: resolveFileToken(
						argv["business-address"] as string | undefined,
						"business-address",
						"text"
					),
					business_email: resolveFileToken(
						argv["business-email"] as string | undefined,
						"business-email",
						"text"
					),
					business_name: resolveFileToken(
						argv["business-name"] as string | undefined,
						"business-name",
						"text"
					),
					business_phone: resolveFileToken(
						argv["business-phone"] as string | undefined,
						"business-phone",
						"text"
					),
					external_metadata: resolveFileToken(
						argv["external-metadata"] as string | undefined,
						"external-metadata",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.account.profile.update({
						body: bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
