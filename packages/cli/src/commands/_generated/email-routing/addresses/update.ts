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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/email-routing.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 email-routing addresses update <destination-address-identifier>\n\nUpdates the status of a specific destination address."
		)
		.positional("destination-address-identifier", {
			type: "string",
			description: "Destination address identifier.",
			demandOption: true,
		})
		.option("status", {
			type: "string",
			description:
				"Destination address status. Non-admin callers may only set verified addresses back to unverified; setting to verified requires admin privileges.",
			choices: ["unverified", "verified"],
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

type Request =
	SdkRequest<"email-routing-destination-addresses-update-destination-address">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <destination-address-identifier>",
	describe: "Update destination address",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-routing addresses update",
				classification: {
					safeFlags: ["status", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-routing addresses update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email/routing/addresses/${argv["destination-address-identifier"] == null ? "<destination-address-identifier>" : encodeURIComponent(String(argv["destination-address-identifier"]))}`,
						pathParams: {
							"destination-address-identifier": String(
								argv["destination-address-identifier"] ?? ""
							),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										status: resolveFileToken(
											argv["status"] as string | undefined,
											"status",
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
						client.emailRouting.addresses.update({
							...bodyData,
							account_id: accountId,
							destination_address_identifier:
								argv["destination-address-identifier"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["status"] === undefined) {
					argv["status"] = await promptForRequiredEnumField(
						"status",
						"Destination address status. Non-admin callers may only set verified addresses back to unverified; setting to verified requires admin privileges.",
						["unverified", "verified"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					status: resolveFileToken(
						argv["status"] as string | undefined,
						"status",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.emailRouting.addresses.update({
						...bodyData,
						account_id: accountId,
						destination_address_identifier:
							argv["destination-address-identifier"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
