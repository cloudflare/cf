import operation from "../../_operations/ssl/mtls-certificates/list.js";
/**
 * list command
 * @generated from apis/overlays/ssl.ts
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
	describe: "List mTLS certificates",
	usage:
		"$0 ssl mtls-certificates list\n\nLists all mTLS certificates uploaded to your account, such as Bring Your Own CA (BYO-CA) for mTLS. To list certificates issued by the Cloudflare managed CA, use the [List Client Certificates endpoint](/api/resources/client_certificates/methods/list/).",
	flags: {
		page: {
			kind: "parsed",
			brief:
				"Page number, starting at 1. Defaults to 1. Ignored when offset is provided.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief:
				"Number of results per page. Defaults to 50 when neither per_page nor limit is provided. Ignored when limit is provided. Values above 1000 are capped at 1000.",
			optional: true,
			parse: Number,
		},
		limit: {
			kind: "parsed",
			brief:
				"Alias for per_page. Defaults to 50 when neither per_page nor limit is provided. Takes precedence over per_page. Values above 1000 are capped at 1000.",
			optional: true,
			parse: Number,
		},
		offset: {
			kind: "parsed",
			brief:
				"Number of results to skip. Defaults to 0. Takes precedence over page, including when offset is 0.",
			optional: true,
			parse: Number,
		},
		type: {
			kind: "parsed",
			brief:
				"Filters results by certificate type. Multiple types can be comma-separated.",
			variadic: true,
			optional: true,
			choices: ["custom", "gateway_managed", "access_managed"],
			parse: String,
			coerce: (values: string[]) => values.flatMap((value) => value.split(",")),
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
				command: "ssl mtls-certificates list",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					page: argv["page"],
					per_page: argv["per-page"],
					limit: argv["limit"],
					offset: argv["offset"],
					type: argv["type"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ssl mtls-certificates list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/mtls_certificates`,
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
