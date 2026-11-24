import operation from "../../_operations/containers/applications/list.js";
/**
 * list command
 * @generated from apis/overlays/containers.ts
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
	describe: "List Applications associated with your account",
	usage:
		"$0 containers applications list\n\nLists all the applications that are associated with your account.",
	flags: {
		"per-page": {
			kind: "parsed",
			brief:
				"Maximum number of applications to return per page. Defaults to all, or 100 when `page_token` is set.",
			optional: true,
			parse: Number,
		},
		"page-token": {
			kind: "parsed",
			brief: "Opaque token from a previous response to retrieve the next page.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Filter applications by name.",
			optional: true,
			parse: String,
		},
		image: {
			kind: "parsed",
			brief: "Filter applications by image.",
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
				command: "containers applications list",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					per_page: argv["per-page"],
					page_token: argv["page-token"],
					name: argv["name"],
					image: argv["image"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf containers applications list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/containers/applications`,
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
