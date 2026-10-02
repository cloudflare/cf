import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/resource-sharing.ts
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
			"$0 resource-sharing resources create <share-id>\n\nAdds a resource to an existing share, making it available to share recipients."
		)
		.positional("share-id", {
			type: "string",
			description: "Share identifier tag.",
			demandOption: true,
		})
		.option("resource-account-id", {
			type: "string",
			description: "Account identifier.",
		})
		.option("resource-id", {
			type: "string",
			description: "Share Resource identifier.",
		})
		.option("resource-type", {
			type: "string",
			description: "Resource Type.",
			choices: [
				"custom-ruleset",
				"gateway-policy",
				"gateway-destination-ip",
				"gateway-block-page-settings",
				"gateway-extended-email-matching",
				"idp-federation-grant",
				"trust-grant",
			],
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

type Request = SdkRequest<"share-resource-create">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <share-id>",
	describe: "Create a new share resource",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "resource-sharing resources create",
				classification: {
					safeFlags: ["resource-type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf resource-sharing resources create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/shares/${argv["share-id"] == null ? "<share-id>" : encodeURIComponent(String(argv["share-id"]))}/resources`,
						pathParams: { "share-id": String(argv["share-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										resource_account_id: resolveFileToken(
											argv["resource-account-id"] as string | undefined,
											"resource-account-id",
											"text"
										),
										resource_id: resolveFileToken(
											argv["resource-id"] as string | undefined,
											"resource-id",
											"text"
										),
										resource_type: resolveFileToken(
											argv["resource-type"] as string | undefined,
											"resource-type",
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
					const result = await withProgress(`Creating`, async () =>
						client.resourceSharing.resources.create({
							body: bodyData,
							account_id: accountId,
							share_id: argv["share-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["resource-account-id"] === undefined) {
					argv["resource-account-id"] = await promptForRequiredField(
						"resource-account-id",
						"Account identifier."
					);
				}
				if (argv["resource-id"] === undefined) {
					argv["resource-id"] = await promptForRequiredField(
						"resource-id",
						"Share Resource identifier."
					);
				}
				if (argv["resource-type"] === undefined) {
					argv["resource-type"] = await promptForRequiredEnumField(
						"resource-type",
						"Resource Type.",
						[
							"custom-ruleset",
							"gateway-policy",
							"gateway-destination-ip",
							"gateway-block-page-settings",
							"gateway-extended-email-matching",
							"idp-federation-grant",
							"trust-grant",
						] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					resource_account_id: resolveFileToken(
						argv["resource-account-id"] as string | undefined,
						"resource-account-id",
						"text"
					),
					resource_id: resolveFileToken(
						argv["resource-id"] as string | undefined,
						"resource-id",
						"text"
					),
					resource_type: resolveFileToken(
						argv["resource-type"] as string | undefined,
						"resource-type",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.resourceSharing.resources.create({
						body: bodyData,
						account_id: accountId,
						share_id: argv["share-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
