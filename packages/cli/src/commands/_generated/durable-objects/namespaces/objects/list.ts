import operation from "../../../_operations/durable-objects/namespaces/objects/list.js";
/**
 * list command
 * @generated from apis/overlays/durable-objects.ts
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
	describe: "List Objects in a Durable Object namespace",
	usage:
		"$0 durable-objects namespaces objects list\n\nReturns the Durable Objects in a given Durable Object namespace.",
	flags: {
		id: { kind: "parsed", brief: "ID of the namespace.", parse: String },
		limit: {
			kind: "parsed",
			brief:
				"The number of objects to return. The cursor attribute may be used to iterate over the next batch of objects if there are more than the limit.",
			optional: true,
			parse: Number,
		},
		cursor: {
			kind: "parsed",
			brief:
				"Opaque token indicating the position from which to continue when requesting the next set of records. A valid value for the cursor can be obtained from the cursors object in the result_info structure.",
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
				command: "durable-objects namespaces objects list",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					limit: argv["limit"],
					cursor: argv["cursor"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf durable-objects namespaces objects list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/durable_objects/namespaces/${argv["id"] == null ? "<id>" : encodeURIComponent(String(argv["id"]))}/objects`,
						pathParams: { id: String(argv["id"] ?? "") },
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
						id: argv["id"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
