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
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/magic-cloud-networking.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 magic-cloud-networking cloud-integrations edit <provider-id>\n\nUpdate a Cloud Integration (Closed Beta)."
		)
		.positional("provider-id", {
			type: "string",
			description: "Provider ID",
			demandOption: true,
		})
		.option("aws-arn", { type: "string", description: "The aws_arn field" })
		.option("azure-subscription-id", {
			type: "string",
			description: "The azure_subscription_id field",
		})
		.option("azure-tenant-id", {
			type: "string",
			description: "The azure_tenant_id field",
		})
		.option("description", {
			type: "string",
			description: "The description field",
		})
		.option("friendly-name", {
			type: "string",
			description: "The friendly_name field",
		})
		.option("gcp-project-id", {
			type: "string",
			description: "The gcp_project_id field",
		})
		.option("gcp-service-account-email", {
			type: "string",
			description: "The gcp_service_account_email field",
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

type Request = SdkRequest<"providers-patch">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <provider-id>",
	describe: "Patch Cloud Integration",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-cloud-networking cloud-integrations edit",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf magic-cloud-networking cloud-integrations edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/cloud/providers/${argv["provider-id"] == null ? "<provider-id>" : encodeURIComponent(String(argv["provider-id"]))}`,
						pathParams: { "provider-id": String(argv["provider-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										aws_arn: resolveFileToken(
											argv["aws-arn"] as string | undefined,
											"aws-arn",
											"text"
										),
										azure_subscription_id: resolveFileToken(
											argv["azure-subscription-id"] as string | undefined,
											"azure-subscription-id",
											"text"
										),
										azure_tenant_id: resolveFileToken(
											argv["azure-tenant-id"] as string | undefined,
											"azure-tenant-id",
											"text"
										),
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										friendly_name: resolveFileToken(
											argv["friendly-name"] as string | undefined,
											"friendly-name",
											"text"
										),
										gcp_project_id: resolveFileToken(
											argv["gcp-project-id"] as string | undefined,
											"gcp-project-id",
											"text"
										),
										gcp_service_account_email: resolveFileToken(
											argv["gcp-service-account-email"] as string | undefined,
											"gcp-service-account-email",
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
						client.magicCloudNetworking.cloudIntegrations.edit({
							body: bodyData,
							account_id: accountId,
							provider_id: argv["provider-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					aws_arn: resolveFileToken(
						argv["aws-arn"] as string | undefined,
						"aws-arn",
						"text"
					),
					azure_subscription_id: resolveFileToken(
						argv["azure-subscription-id"] as string | undefined,
						"azure-subscription-id",
						"text"
					),
					azure_tenant_id: resolveFileToken(
						argv["azure-tenant-id"] as string | undefined,
						"azure-tenant-id",
						"text"
					),
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					friendly_name: resolveFileToken(
						argv["friendly-name"] as string | undefined,
						"friendly-name",
						"text"
					),
					gcp_project_id: resolveFileToken(
						argv["gcp-project-id"] as string | undefined,
						"gcp-project-id",
						"text"
					),
					gcp_service_account_email: resolveFileToken(
						argv["gcp-service-account-email"] as string | undefined,
						"gcp-service-account-email",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.magicCloudNetworking.cloudIntegrations.edit({
						body: bodyData,
						account_id: accountId,
						provider_id: argv["provider-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
