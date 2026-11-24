/**
 * get command
 * @generated from apis/overlays/logs.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "get",
	describe: "List log files",
	usage:
		"$0 logs list get\n\nLists R2 objects containing logs matching the provided query parameters.",
	flags: {
		start: {
			kind: "parsed",
			brief: "Start time in RFC3339 format.",
			parse: String,
		},
		end: {
			kind: "parsed",
			brief: "End time in RFC3339 format.",
			parse: String,
		},
		bucket: { kind: "parsed", brief: "R2 bucket name.", parse: String },
		prefix: {
			kind: "parsed",
			brief: "R2 bucket prefix logs are stored under.",
			optional: true,
			parse: String,
		},
		limit: {
			kind: "parsed",
			brief: "Maximum number of results to return.",
			optional: true,
			parse: Number,
		},
		"r2-access-key-id": {
			kind: "parsed",
			brief: "The R2-Access-Key-Id header",
			parse: String,
		},
		"r2-secret-access-key": {
			kind: "parsed",
			brief: "The R2-Secret-Access-Key header",
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
				command: "logs list get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					start: argv["start"],
					end: argv["end"],
					bucket: argv["bucket"],
					prefix: argv["prefix"],
					limit: argv["limit"],
				};

				const headers: Record<string, string> = {};
				if (argv["r2-access-key-id"] !== undefined)
					headers["R2-Access-Key-Id"] = String(argv["r2-access-key-id"]);
				if (argv["r2-secret-access-key"] !== undefined)
					headers["R2-Secret-Access-Key"] = String(
						argv["r2-secret-access-key"]
					);
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf logs list get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/logs/list`,
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
					requestApi<unknown>(
						client,
						"GET",
						`/accounts/${accountId}/logs/list`,
						{
							query: queryParams,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
