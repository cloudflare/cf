import operation from "../../_operations/kv/metadata/get.js";
/**
 * get command
 * @generated from apis/overlays/kv.ts
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
	command: "get <key-name>",
	describe: "Get a key's metadata",
	usage:
		"$0 kv metadata get <key-name>\n\nReturns the JSON metadata associated with the specified key in the Workers KV namespace, without retrieving its value. Use URL-encoding for special characters (for example, `:`, `!`, `%`) in the key name when constructing the request URL.",
	flags: {
		"namespace-id": {
			kind: "parsed",
			brief: "ID of the Workers KV namespace.",
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "key-name",
			brief:
				"A key's name. The name may be at most 512 bytes. All printable, non-whitespace characters are valid. Use percent-encoding to define key names as part of a URL.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "kv metadata get",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf kv metadata get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/storage/kv/namespaces/${argv["namespace-id"] == null ? "<namespace-id>" : encodeURIComponent(String(argv["namespace-id"]))}/metadata/${argv["key-name"] == null ? "<key-name>" : encodeURIComponent(String(argv["key-name"]))}`,
						pathParams: {
							"namespace-id": String(argv["namespace-id"] ?? ""),
							"key-name": String(argv["key-name"] ?? ""),
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
						namespace_id: argv["namespace-id"],
						key_name: argv["key-name"],
					})
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
