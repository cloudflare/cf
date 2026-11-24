import operation from "../../../_operations/ai-gateway/dynamic-routing/versions/get.js";
/**
 * get command
 * @generated from apis/overlays/ai-gateway.ts
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
	command: "get <version-id>",
	describe: "Get a dynamic route version",
	usage:
		"$0 ai-gateway dynamic-routing versions get <version-id>\n\nRetrieves a saved version of a dynamic route, including its routing elements.",
	flags: {
		"gateway-id": { kind: "parsed", brief: "Gateway ID", parse: String },
		id: { kind: "parsed", brief: "ID", parse: String },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "version-id", brief: "Version ID", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ai-gateway dynamic-routing versions get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf ai-gateway dynamic-routing versions get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/ai-gateway/gateways/${argv["gateway-id"] == null ? "<gateway-id>" : encodeURIComponent(String(argv["gateway-id"]))}/routes/${argv["id"] == null ? "<id>" : encodeURIComponent(String(argv["id"]))}/versions/${argv["version-id"] == null ? "<version-id>" : encodeURIComponent(String(argv["version-id"]))}`,
						pathParams: {
							"gateway-id": String(argv["gateway-id"] ?? ""),
							id: String(argv["id"] ?? ""),
							"version-id": String(argv["version-id"] ?? ""),
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
						gateway_id: argv["gateway-id"],
						id: argv["id"],
						version_id: argv["version-id"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
