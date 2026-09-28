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
			"$0 zero-trust casb policies update <policy-id>\n\nUpdates an existing policy configuration and replaces its actions."
		)
		.positional("policy-id", {
			type: "string",
			description: "Policy configuration ID",
			demandOption: true,
		})
		.option("applies-to-all-integrations", {
			type: "boolean",
			description:
				"When true, the policy applies to all integrations for the account. When false, integration_ids must be provided.",
		})
		.option("description", {
			type: "string",
			description: "Optional description of what this policy does.",
		})
		.option("display-name", {
			type: "string",
			description: "Display name for the policy configuration.",
		})
		.option("enabled", {
			type: "boolean",
			description: "Boolean specifying if the policy is enabled or disabled.",
		})
		.option("integration-ids", {
			type: "string",
			array: true,
			description:
				"The integrations this policy applies to. Required when applies_to_all_integrations is false.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Request body for updating an existing policy configuration.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"UpdatePolicy">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <policy-id>",
	describe: "Update a policy configuration",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust casb policies update",
				classification: {
					safeFlags: ["applies-to-all-integrations", "enabled", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust casb policies update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/data-security/posture/policies/${argv["policy-id"] == null ? "<policy-id>" : encodeURIComponent(String(argv["policy-id"]))}`,
						pathParams: { "policy-id": String(argv["policy-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										applies_to_all_integrations:
											argv["applies-to-all-integrations"],
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										display_name: resolveFileToken(
											argv["display-name"] as string | undefined,
											"display-name",
											"text"
										),
										enabled: argv["enabled"],
										integration_ids: argv["integration-ids"],
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
						client.zeroTrust.casb.policies.update({
							...bodyData,
							account_id: accountId,
							policy_id: argv["policy-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["applies-to-all-integrations"] === undefined) {
					throw new Error(
						"--applies-to-all-integrations is required (or pass --body with this field set)."
					);
				}
				if (argv["display-name"] === undefined) {
					argv["display-name"] = await promptForRequiredField(
						"display-name",
						"Display name for the policy configuration."
					);
				}
				if (argv["enabled"] === undefined) {
					throw new Error(
						"--enabled is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					applies_to_all_integrations: argv["applies-to-all-integrations"],
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					display_name: resolveFileToken(
						argv["display-name"] as string | undefined,
						"display-name",
						"text"
					),
					enabled: argv["enabled"],
					integration_ids: argv["integration-ids"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.zeroTrust.casb.policies.update({
						...bodyData,
						account_id: accountId,
						policy_id: argv["policy-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
