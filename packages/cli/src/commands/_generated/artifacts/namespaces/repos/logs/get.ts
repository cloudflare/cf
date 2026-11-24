import operation from "../../../../_operations/artifacts/namespaces/repos/logs/get.js";
/**
 * get command
 * @generated from apis/overlays/artifacts.ts
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
	command: "get <name>",
	describe: "Read commit history",
	usage:
		"$0 artifacts namespaces repos logs get <name>\n\nReturns commit metadata walking backwards from a ref, branch, tag, or HEAD.",
	flags: {
		namespace: {
			kind: "parsed",
			brief: "Artifacts namespace name.",
			parse: String,
		},
		ref: {
			kind: "parsed",
			brief: "Git ref, branch, tag, or commit hash. Defaults to HEAD.",
			optional: true,
			parse: String,
		},
		limit: { kind: "parsed", brief: "Limit", optional: true, parse: Number },
		offset: { kind: "parsed", brief: "Offset", optional: true, parse: Number },
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [{ placeholder: "name", brief: "Repository name.", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "artifacts namespaces repos logs get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					ref: argv["ref"],
					limit: argv["limit"],
					offset: argv["offset"],
				};
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf artifacts namespaces repos logs get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/artifacts/namespaces/${argv["namespace"] == null ? "<namespace>" : encodeURIComponent(String(argv["namespace"]))}/repos/${argv["name"] == null ? "<name>" : encodeURIComponent(String(argv["name"]))}/log`,
						pathParams: {
							namespace: String(argv["namespace"] ?? ""),
							name: String(argv["name"] ?? ""),
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
						namespace: argv["namespace"],
						name: argv["name"],
						...queryParams,
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
