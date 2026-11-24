import operation from "../../../../_operations/zero-trust/casb/applications/auth-methods/list.js";
/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "list",
	describe: "Get auth methods",
	usage:
		"$0 zero-trust casb applications auth-methods list\n\nReturns available auth methods for the specified vendor, including credential schema, instructions, and example payloads. Use this to understand what credentials are required before calling POST /v2/integrations.",
	flags: {
		"application-id": {
			kind: "parsed",
			brief: "Application/vendor identifier.",
			parse: String,
		},
		environment: {
			kind: "enum",
			brief:
				"Environment to request (standard, fedramp). The result follows the account's FedRAMP entitlement: FedRAMP-enabled accounts always receive FedRAMP applications and other accounts receive standard applications. Any other non-empty value returns 400.",
			values: ["fedramp", "standard"],
			optional: true,
		},
		page: {
			kind: "parsed",
			brief: "A page number within the paginated result set.",
			optional: true,
			parse: Number,
		},
		"page-size": {
			kind: "parsed",
			brief: "Number of results to return per page.",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust casb applications auth-methods list",
				classification: {
					safeFlags: ["environment", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					environment: argv["environment"],
					page: argv["page"],
					page_size: argv["page-size"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust casb applications auth-methods list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/one/applications/${argv["application-id"] == null ? "<application-id>" : encodeURIComponent(String(argv["application-id"]))}/auth-methods`,
						pathParams: {
							"application-id": String(argv["application-id"] ?? ""),
						},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, {
						account_id: accountId,
						application_id: argv["application-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
