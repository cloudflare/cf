import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * put command
 * @generated from apis/overlays/kv.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 kv bulk put <namespace-id>\n\nWrites up to 10,000 key-value pairs to the specified Workers KV namespace from a JSON array, with optional metadata and expiration settings for each pair. Existing values and expirations are overwritten. If neither `expiration` nor `expiration_ttl` is specified, the key-value pair will not expire. If both are set, `expiration_ttl` takes precedence. The entire request must be 100 megabytes or less. The result reports the number of successful writes and any keys that failed and should be retried."
		)
		.positional("namespace-id", {
			type: "string",
			description: "ID of the Workers KV namespace.",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"workers-kv-namespace-write-multiple-key-value-pairs">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "put <namespace-id>",
	describe: "Write multiple key-value pairs",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "kv bulk put",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf kv bulk put",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/storage/kv/namespaces/${argv["namespace-id"] == null ? "<namespace-id>" : encodeURIComponent(String(argv["namespace-id"]))}/bulk`,
						pathParams: { "namespace-id": String(argv["namespace-id"] ?? "") },
						bodyKind: "json",
						body: argv.body !== undefined ? parseBody(argv.body) : undefined,
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					if (Array.isArray(bodyData) && bodyData.length > 10000) {
						const total = Math.ceil(bodyData.length / 10000);
						let result: unknown = null;
						for (let i = 0; i < bodyData.length; i += 10000) {
							const batch = bodyData.slice(i, i + 10000);
							const batchNum = Math.floor(i / 10000) + 1;
							result = await withProgress(
								`Updating: batch ${batchNum}/${total}`,
								async () =>
									requestApi<unknown>(
										client,
										"PUT",
										`/accounts/${accountId}/storage/kv/namespaces/${encodeURIComponent(String(argv["namespace-id"]))}/bulk`,
										{ body: batch }
									)
							);
						}
						formatOutput(result, { successLabel: `Updated` });
						return;
					}
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PUT",
							`/accounts/${accountId}/storage/kv/namespaces/${encodeURIComponent(String(argv["namespace-id"]))}/bulk`,
							{ body: bodyData }
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				if (argv.body === undefined) {
					throw new Error(
						"--body is required for this command. Pass --body '<json>' or --body @path/to/file.json."
					);
				}
			}
		),
};

export default command;
