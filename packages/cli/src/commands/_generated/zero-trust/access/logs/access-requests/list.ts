import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery, SdkRequest } from "#sdk";
/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
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
			"$0 zero-trust access logs access-requests list\n\nGets a list of Access authentication audit logs for an account."
		)
		.option("limit", {
			type: "number",
			description: "The maximum number of log entries to retrieve.",
		})
		.option("direction", {
			type: "string",
			description: "The chronological sorting order for the logs.",
			choices: ["desc", "asc"],
		})
		.option("since", {
			type: "string",
			description: "The earliest event timestamp to query.",
		})
		.option("until", {
			type: "string",
			description: "The latest event timestamp to query.",
		})
		.option("page", { type: "number", description: "Page number of results." })
		.option("per-page", {
			type: "number",
			description: "Number of results per page.",
		})
		.option("email", {
			type: "string",
			description:
				"Filter by user email. Match mode is controlled by `emailOp` (preferred) or the legacy `email_exact` flag.\n- Default (no `emailOp`, `email_exact=false` or unset): substring match — `email=@example.com` returns all events with that domain.\n- Exact match: set `emailOp=eq` (preferred) or `email_exact=true` — e.g. `email=user@example.com&email_exact=true` returns only that user.\n- Explicit substring match: set `emailOp=contains` (without `email_exact=true`). When both are set, `email_exact=true` takes precedence and the match is exact.\n- Exclusion: set `emailOp=neq`. With `email_exact=true` this is an exact-value exclusion; without it, a fuzzy substring exclusion.",
		})
		.option("email-exact", {
			type: "boolean",
			description:
				"When true, `email` is matched exactly instead of substring matching.",
		})
		.option("user-id", {
			type: "string",
			description:
				"Deprecated. Accepted for backward compatibility but no longer applied\nas a filter. Use `email` instead.",
		})
		.option("allowed-op", {
			type: "string",
			description: "Operator for the `allowed` filter.",
			choices: ["eq", "neq"],
		})
		.option("country-code-op", {
			type: "string",
			description: "Operator for the `country_code` filter.",
			choices: ["eq", "neq"],
		})
		.option("app-type-op", {
			type: "string",
			description: "Operator for the `app_type` filter.",
			choices: ["eq", "neq"],
		})
		.option("app-uid-op", {
			type: "string",
			description: "Operator for the `app_uid` filter.",
			choices: ["eq", "neq"],
		})
		.option("ray-id-op", {
			type: "string",
			description: "Operator for the `ray_id` filter.",
			choices: ["eq", "neq"],
		})
		.option("email-op", {
			type: "string",
			description:
				"Operator for the `email` filter.\n`contains` performs a substring (case-sensitive) match. When `email_exact=true`\nis also set, `email_exact` takes precedence and `contains` is ignored.",
			choices: ["eq", "neq", "contains"],
		})
		.option("idp-op", {
			type: "string",
			description: "Operator for the `idp` filter.",
			choices: ["eq", "neq"],
		})
		.option("non-identity-op", {
			type: "string",
			description: "Operator for the `non_identity` filter.",
			choices: ["eq", "neq"],
		})
		.option("user-id-op", {
			type: "string",
			description:
				"Deprecated. Accepted for backward compatibility but no longer applied\nas a filter (the `user_id` parameter is itself deprecated).",
			choices: ["eq", "neq"],
		})
		.option("fields", {
			type: "string",
			description:
				"Comma-separated list of fields to include in the response.\nWhen omitted, all fields are returned.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Request =
	SdkRequest<"access-authentication-logs-get-access-authentication-logs">;
type Query =
	SdkQuery<"access-authentication-logs-get-access-authentication-logs">;

const typedBuilder = withArgTypes<
	{
		direction: Query["direction"];
		"allowed-op": Query["allowedOp"];
		"country-code-op": Query["country_codeOp"];
		"app-type-op": Query["app_typeOp"];
		"app-uid-op": Query["app_uidOp"];
		"ray-id-op": Query["ray_idOp"];
		"email-op": Query["emailOp"];
		"idp-op": Query["idpOp"];
		"non-identity-op": Query["non_identityOp"];
		"user-id-op": Query["user_idOp"];
	},
	typeof builder
>(builder);

type Args = InferArgs<typeof typedBuilder>;
const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "Get Access authentication logs",
	builder: typedBuilder,
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
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
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
					client.zeroTrust.access.logs.accessRequests.list({
						account_id: accountId,
						...queryParams,
					} satisfies Request)
				);
				formatOutput(result, {
					successLabel: `Loaded`,
					paginationQuery: queryParams,
				});
			}
		),
};

export default command;
