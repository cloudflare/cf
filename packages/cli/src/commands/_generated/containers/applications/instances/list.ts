import operation from "../../../_operations/containers/applications/instances/list.js";
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
	describe: "List container instances",
	usage:
		"$0 containers applications instances list\n\nLists container instances belonging to an application.",
	flags: {
		"application-id": {
			kind: "parsed",
			brief: "An Application ID represents an identifier of an application.",
			parse: String,
		},
		"per-page": {
			kind: "parsed",
			brief: "Maximum number of instances to return per page. Defaults to 100.",
			optional: true,
			parse: Number,
		},
		"page-token": {
			kind: "parsed",
			brief: "Opaque token from a previous response to retrieve the next page.",
			optional: true,
			parse: String,
		},
		state: {
			kind: "enum",
			brief:
				"Filters instances by lifecycle state. `active` includes provisioning, running, and stopping instances; `not-active` includes stopped and failed instances. When omitted, all instances are returned.",
			values: ["active", "not-active"],
			optional: true,
		},
		"name-prefix": {
			kind: "parsed",
			brief:
				"Filter instances by a case-sensitive name prefix, falling back to the actor ID when no name is known. Keep the same prefix when using a page token.",
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
				command: "containers applications instances list",
				classification: {
					safeFlags: ["state", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					per_page: argv["per-page"],
					page_token: argv["page-token"],
					state: argv["state"],
					name_prefix: argv["name-prefix"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf containers applications instances list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/containers/applications/${argv["application-id"] == null ? "<application-id>" : encodeURIComponent(String(argv["application-id"]))}/instances-v2`,
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
