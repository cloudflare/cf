import operation from "../../../../_operations/zero-trust/cws/basic-auth-credentials/secrets/list.js";
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
	describe: "List secrets for a basic-auth credential",
	usage:
		"$0 zero-trust cws basic-auth-credentials secrets list\n\nReturns a paginated list of secrets belonging to the credential.",
	flags: {
		"credential-id": {
			kind: "parsed",
			brief: "ID of the parent credential",
			parse: String,
		},
		cursor: {
			kind: "parsed",
			brief: "Pagination cursor from previous response",
			optional: true,
			parse: String,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of items per page (1-100, default 20)",
			optional: true,
			parse: Number,
		},
		order: {
			kind: "enum",
			brief: "Field to order results by (default: created_at)",
			values: ["created_at"],
			optional: true,
		},
		direction: {
			kind: "enum",
			brief: "Sort direction (default: asc)",
			values: ["asc", "desc"],
			optional: true,
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
				command: "zero-trust cws basic-auth-credentials secrets list",
				classification: {
					safeFlags: ["order", "direction", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					cursor: argv["cursor"],
					per_page: argv["per-page"],
					order: argv["order"],
					direction: argv["direction"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust cws basic-auth-credentials secrets list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cws/basic-auth-credentials/${argv["credential-id"] == null ? "<credential-id>" : encodeURIComponent(String(argv["credential-id"]))}/secrets`,
						pathParams: {
							"credential-id": String(argv["credential-id"] ?? ""),
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
						credential_id: argv["credential-id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
