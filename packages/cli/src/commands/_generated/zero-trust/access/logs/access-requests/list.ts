import operation from "../../../../_operations/zero-trust/access/logs/access-requests/list.js";
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
	describe: "Get Access authentication logs",
	usage:
		"$0 zero-trust access logs access-requests list\n\nGets a list of Access authentication audit logs for an account.",
	flags: {
		limit: {
			kind: "parsed",
			brief: "The maximum number of log entries to retrieve.",
			optional: true,
			parse: Number,
		},
		direction: {
			kind: "enum",
			brief: "The chronological sorting order for the logs.",
			values: ["desc", "asc"],
			optional: true,
		},
		since: {
			kind: "parsed",
			brief: "The earliest event timestamp to query.",
			optional: true,
			parse: String,
		},
		until: {
			kind: "parsed",
			brief: "The latest event timestamp to query.",
			optional: true,
			parse: String,
		},
		page: {
			kind: "parsed",
			brief: "Page number of results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of results per page.",
			optional: true,
			parse: Number,
		},
		email: {
			kind: "parsed",
			brief:
				"Filter by user email. Match mode is controlled by `emailOp` (preferred) or the legacy `email_exact` flag.\n- Default (no `emailOp`, `email_exact=false` or unset): substring match — `email=@example.com` returns all events with that domain.\n- Exact match: set `emailOp=eq` (preferred) or `email_exact=true` — e.g. `email=user@example.com&email_exact=true` returns only that user.\n- Explicit substring match: set `emailOp=contains` (without `email_exact=true`). When both are set, `email_exact=true` takes precedence and the match is exact.\n- Exclusion: set `emailOp=neq`. With `email_exact=true` this is an exact-value exclusion; without it, a fuzzy substring exclusion.",
			optional: true,
			parse: String,
		},
		"email-exact": {
			kind: "boolean",
			brief:
				"When true, `email` is matched exactly instead of substring matching.",
			optional: true,
		},
		"user-id": {
			kind: "parsed",
			brief:
				"Deprecated. Accepted for backward compatibility but no longer applied\nas a filter. Use `email` instead.",
			optional: true,
			parse: String,
		},
		"allowed-op": {
			kind: "enum",
			brief: "Operator for the `allowed` filter.",
			values: ["eq", "neq"],
			optional: true,
		},
		"country-code-op": {
			kind: "enum",
			brief: "Operator for the `country_code` filter.",
			values: ["eq", "neq"],
			optional: true,
		},
		"app-type-op": {
			kind: "enum",
			brief: "Operator for the `app_type` filter.",
			values: ["eq", "neq"],
			optional: true,
		},
		"app-uid-op": {
			kind: "enum",
			brief: "Operator for the `app_uid` filter.",
			values: ["eq", "neq"],
			optional: true,
		},
		"ray-id-op": {
			kind: "enum",
			brief: "Operator for the `ray_id` filter.",
			values: ["eq", "neq"],
			optional: true,
		},
		"email-op": {
			kind: "enum",
			brief:
				"Operator for the `email` filter.\n`contains` performs a substring (case-sensitive) match. When `email_exact=true`\nis also set, `email_exact` takes precedence and `contains` is ignored.",
			values: ["eq", "neq", "contains"],
			optional: true,
		},
		"idp-op": {
			kind: "enum",
			brief: "Operator for the `idp` filter.",
			values: ["eq", "neq"],
			optional: true,
		},
		"non-identity-op": {
			kind: "enum",
			brief: "Operator for the `non_identity` filter.",
			values: ["eq", "neq"],
			optional: true,
		},
		"user-id-op": {
			kind: "enum",
			brief:
				"Deprecated. Accepted for backward compatibility but no longer applied\nas a filter (the `user_id` parameter is itself deprecated).",
			values: ["eq", "neq"],
			optional: true,
		},
		fields: {
			kind: "parsed",
			brief:
				"Comma-separated list of fields to include in the response.\nWhen omitted, all fields are returned.",
			optional: true,
			parse: String,
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
				command: "zero-trust access logs access-requests list",
				classification: {
					safeFlags: [
						"direction",
						"email-exact",
						"allowed-op",
						"country-code-op",
						"app-type-op",
						"app-uid-op",
						"ray-id-op",
						"email-op",
						"idp-op",
						"non-identity-op",
						"user-id-op",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					limit: argv["limit"],
					direction: argv["direction"],
					since: argv["since"],
					until: argv["until"],
					page: argv["page"],
					per_page: argv["per-page"],
					email: argv["email"],
					email_exact: argv["email-exact"],
					user_id: argv["user-id"],
					allowedOp: argv["allowed-op"],
					country_codeOp: argv["country-code-op"],
					app_typeOp: argv["app-type-op"],
					app_uidOp: argv["app-uid-op"],
					ray_idOp: argv["ray-id-op"],
					emailOp: argv["email-op"],
					idpOp: argv["idp-op"],
					non_identityOp: argv["non-identity-op"],
					user_idOp: argv["user-id-op"],
					fields: argv["fields"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust access logs access-requests list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/access/logs/access_requests`,
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
					client.send(operation, { account_id: accountId, ...queryParams })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
