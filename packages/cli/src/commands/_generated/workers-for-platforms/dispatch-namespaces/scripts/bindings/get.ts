import operation from "../../../../_operations/workers-for-platforms/dispatch-namespaces/scripts/bindings/get.js";
/**
 * get command
 * @generated from apis/overlays/workers-for-platforms.ts
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
	command: "get <script-name>",
	describe: "Get Workers for Platforms Script Bindings",
	usage:
		"$0 workers-for-platforms dispatch-namespaces scripts bindings get <script-name>\n\nFetch bindings from a script uploaded to a Workers for Platforms dispatch namespace.",
	flags: {
		"dispatch-namespace": {
			kind: "parsed",
			brief: "Name of the Workers for Platforms dispatch namespace.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "script-name", brief: "Name of the script.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command:
					"workers-for-platforms dispatch-namespaces scripts bindings get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command:
							"cf workers-for-platforms dispatch-namespaces scripts bindings get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/dispatch/namespaces/${argv["dispatch-namespace"] == null ? "<dispatch-namespace>" : encodeURIComponent(String(argv["dispatch-namespace"]))}/scripts/${argv["script-name"] == null ? "<script-name>" : encodeURIComponent(String(argv["script-name"]))}/bindings`,
						pathParams: {
							"dispatch-namespace": String(argv["dispatch-namespace"] ?? ""),
							"script-name": String(argv["script-name"] ?? ""),
						},
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
						dispatch_namespace: argv["dispatch-namespace"],
						script_name: argv["script-name"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
