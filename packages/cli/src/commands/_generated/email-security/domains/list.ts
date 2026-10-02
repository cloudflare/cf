import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/email-security.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { withArgTypes } from "#lib/cli-types.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 email-security domains list\n\nReturns a paginated list of email domains protected by Email Security. Includes domain configuration, delivery modes, and authorization status. Supports filtering by delivery mode and integration ID."
		)
		.option("page", {
			type: "number",
			description: "Current page within paginated list of results.",
		})
		.option("per-page", {
			type: "number",
			description: "The number of results per page. Maximum value is 1000.",
		})
		.option("search", {
			type: "string",
			description: "Search term for filtering records. Behavior may change.",
		})
		.option("order", {
			type: "string",
			description: "Field to sort by.",
			choices: ["domain", "created_at"],
		})
		.option("direction", {
			type: "string",
			description: "The sorting direction.",
			choices: ["asc", "desc"],
		})
		.option("allowed-delivery-mode", {
			type: "string",
			description: "Delivery mode to filter by.",
			choices: ["DIRECT", "BCC", "JOURNAL", "API", "RETRO_SCAN"],
		})
		.option("domain", {
			type: "string",
			description: "Domain names to filter by.",
		})
		.option("active-delivery-mode", {
			type: "string",
			description: "Currently active delivery mode to filter by.",
			choices: ["DIRECT", "BCC", "JOURNAL", "API", "RETRO_SCAN"],
		})
		.option("integration-id", {
			type: "string",
			description: "Integration ID to filter by.",
		})
		.option("status", {
			type: "string",
			description: "Filters response to domains with the provided status.",
			choices: ["PENDING", "ACTIVE", "FAILED", "TIMEOUT"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"email_security_list_domains">;
type Query = SdkQuery<"email_security_list_domains">;

const typedBuilder = withArgTypes<
	{
		order: Query["order"];
		direction: Query["direction"];
		"allowed-delivery-mode": Query["allowed_delivery_mode"];
		"active-delivery-mode": Query["active_delivery_mode"];
		status: Query["status"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List protected email domains",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-security domains list",
				classification: {
					safeFlags: [
						"order",
						"direction",
						"allowed-delivery-mode",
						"active-delivery-mode",
						"status",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
					page: argv["page"],
					per_page: argv["per-page"],
					search: argv["search"],
					order: argv["order"],
					direction: argv["direction"],
					allowed_delivery_mode: argv["allowed-delivery-mode"],
					domain: argv["domain"],
					active_delivery_mode: argv["active-delivery-mode"],
					integration_id: argv["integration-id"],
					status: argv["status"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-security domains list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/settings/domains`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.emailSecurity.domains.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
