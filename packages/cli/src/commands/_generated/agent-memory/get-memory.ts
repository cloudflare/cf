import operation from "../_operations/agent-memory/get-memory.js";
/**
 * get-memory command
 * @generated from apis/overlays/agent-memory.ts
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
	command: "get-memory <memory-id>",
	describe: "Get a memory",
	usage: "$0 agent-memory get-memory <memory-id>\n\nRetrieves a memory by ID.",
	flags: {
		"namespace-name": {
			kind: "parsed",
			brief: "Namespace name.",
			parse: String,
		},
		"profile-name": { kind: "parsed", brief: "Profile name.", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{ placeholder: "memory-id", brief: "Memory Identifier.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "agent-memory get-memory",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf agent-memory get-memory",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/agent-memory/namespaces/${argv["namespace-name"] == null ? "<namespace-name>" : encodeURIComponent(String(argv["namespace-name"]))}/profiles/${argv["profile-name"] == null ? "<profile-name>" : encodeURIComponent(String(argv["profile-name"]))}/memories/${argv["memory-id"] == null ? "<memory-id>" : encodeURIComponent(String(argv["memory-id"]))}`,
						pathParams: {
							"namespace-name": String(argv["namespace-name"] ?? ""),
							"profile-name": String(argv["profile-name"] ?? ""),
							"memory-id": String(argv["memory-id"] ?? ""),
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
						namespace_name: argv["namespace-name"],
						profile_name: argv["profile-name"],
						memory_id: argv["memory-id"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
