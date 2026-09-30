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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/email-security.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 email-security allow-policies list\n\nReturns a paginated list of email allow policies. These policies exempt matching emails from security detection, allowing them to bypass disposition actions. Supports filtering by pattern type and policy attributes."
		)
		.option("page", {
			type: "number",
			description: "Current page within paginated list of results.",
		})
		.option("per-page", {
			type: "number",
			description: "The number of results per page. Maximum value is 1000.",
		})
		.check((argv) => {
			if (argv["per-page"] !== undefined && !Number.isFinite(argv["per-page"]))
				throw new Error("--per-page must be a number");
			return true;
		})
		.option("search", {
			type: "string",
			description: "Search term for filtering records. Behavior may change.",
		})
		.option("order", {
			type: "string",
			description: "Field to sort by.",
			choices: ["pattern", "created_at"],
		})
		.option("direction", {
			type: "string",
			description: "The sorting direction.",
			choices: ["asc", "desc"],
		})
		.option("is-exempt-recipient", {
			type: "boolean",
			description:
				"Filter to show only policies where messages to the recipient bypass all detections.",
		})
		.option("is-trusted-sender", {
			type: "boolean",
			description:
				"Filter to show only policies where messages from the sender bypass all detections and link following.",
		})
		.option("is-acceptable-sender", {
			type: "boolean",
			description:
				"Filter to show only policies where messages from the sender are exempted from Spam, Spoof, and Bulk dispositions (not Malicious or Suspicious).",
		})
		.option("verify-sender", {
			type: "boolean",
			description:
				"Filter to show only policies that enforce DMARC, SPF, or DKIM authentication.",
		})
		.option("pattern-type", {
			type: "string",
			description: "Filter by pattern type.",
			choices: ["EMAIL", "DOMAIN", "IP", "UNKNOWN"],
		})
		.option("pattern", {
			type: "string",
			description: "Filter by exact pattern value.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request = SdkRequest<"email_security_list_allow_policies">;
type Query = SdkQuery<"email_security_list_allow_policies">;

const typedBuilder = withArgTypes<
	{
		order: Query["order"];
		direction: Query["direction"];
		"pattern-type": Query["pattern_type"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List email allow policies",
	builder: typedBuilder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "email-security allow-policies list",
				classification: {
					safeFlags: [
						"order",
						"direction",
						"is-exempt-recipient",
						"is-trusted-sender",
						"is-acceptable-sender",
						"verify-sender",
						"pattern-type",
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
					is_exempt_recipient: argv["is-exempt-recipient"],
					is_trusted_sender: argv["is-trusted-sender"],
					is_acceptable_sender: argv["is-acceptable-sender"],
					verify_sender: argv["verify-sender"],
					pattern_type: argv["pattern-type"],
					pattern: argv["pattern"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf email-security allow-policies list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/email-security/settings/allow_policies`,
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
					client.emailSecurity.allowPolicies.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
