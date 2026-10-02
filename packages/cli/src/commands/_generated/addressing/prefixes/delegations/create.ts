import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/addressing.ts
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
			"$0 addressing prefixes delegations create <prefix-id>\n\nCreate a new account delegation for a given IP prefix."
		)
		.positional("prefix-id", {
			type: "string",
			description: "Identifier of an IP Prefix.",
			demandOption: true,
		})
		.option("cidr", {
			type: "string",
			description: "IP Prefix in Classless Inter-Domain Routing format.",
		})
		.option("delegated-account-id", {
			type: "string",
			description:
				"Account identifier for the account to which prefix is being delegated.",
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
	SdkRequest<"ip-address-management-prefix-delegation-create-prefix-delegation">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <prefix-id>",
	describe: "Create Prefix Delegation",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "addressing prefixes delegations create",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf addressing prefixes delegations create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/addressing/prefixes/${argv["prefix-id"] == null ? "<prefix-id>" : encodeURIComponent(String(argv["prefix-id"]))}/delegations`,
						pathParams: { "prefix-id": String(argv["prefix-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										cidr: resolveFileToken(
											argv["cidr"] as string | undefined,
											"cidr",
											"text"
										),
										delegated_account_id: resolveFileToken(
											argv["delegated-account-id"] as string | undefined,
											"delegated-account-id",
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
						client.addressing.prefixes.delegations.create({
							...bodyData,
							account_id: accountId,
							prefix_id: argv["prefix-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["cidr"] === undefined) {
					argv["cidr"] = await promptForRequiredField(
						"cidr",
						"IP Prefix in Classless Inter-Domain Routing format."
					);
				}
				if (argv["delegated-account-id"] === undefined) {
					argv["delegated-account-id"] = await promptForRequiredField(
						"delegated-account-id",
						"Account identifier for the account to which prefix is being delegated."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					cidr: resolveFileToken(
						argv["cidr"] as string | undefined,
						"cidr",
						"text"
					),
					delegated_account_id: resolveFileToken(
						argv["delegated-account-id"] as string | undefined,
						"delegated-account-id",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.addressing.prefixes.delegations.create({
						...bodyData,
						account_id: accountId,
						prefix_id: argv["prefix-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
