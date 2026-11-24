import operation from "../../_operations/kv/keys/bulk-put.js";
/**
 * bulk-put command
 * @generated from apis/overlays/kv.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "bulk-put",
	describe: "Write multiple key-value pairs",
	usage:
		"$0 kv keys bulk-put\n\nWrites up to 10,000 key-value pairs to the specified Workers KV namespace from a JSON array, with optional metadata and expiration settings for each pair. Existing values and expirations are overwritten. If neither `expiration` nor `expiration_ttl` is specified, the key-value pair will not expire. If both are set, `expiration_ttl` takes precedence. The entire request must be 100 megabytes or less. The result reports the number of successful writes and any keys that failed and should be retried.",
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
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "kv keys bulk-put",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.body === undefined) {
					throw new Error(
						"--body is required for this command. Pass --body '<json>' or --body @path/to/file.json."
					);
				}
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf kv keys bulk-put",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/storage/kv/namespaces/${argv["namespace-id"] == null ? "<namespace-id>" : encodeURIComponent(String(argv["namespace-id"]))}/bulk`,
						pathParams: { "namespace-id": String(argv["namespace-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body, [], 10000)
								: undefined,
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body, [], 10000) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							namespace_id: argv["namespace-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
			}
		),
});

export default command;
