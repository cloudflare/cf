import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * get command
 * @generated from apis/overlays/kv.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 kv bulk get <namespace-id>\n\nRetrieves the text-based values of up to 100 keys from the specified Workers KV namespace. The result maps each requested key to its value. Set `type` to `json` to parse JSON values instead of returning strings, and set `withMetadata` to `true` to include metadata with each value. Binary values are not supported by this operation."
		)
		.positional("namespace-id", {
			type: "string",
			description: "ID of the Workers KV namespace.",
			demandOption: true,
		})
		.option("keys", {
			type: "string",
			array: true,
			description: "Array of keys to retrieve (maximum of 100).",
		})
		.option("type", {
			type: "string",
			description:
				"Return values as strings with `text`, or parse stored JSON values with `json`.",
			choices: ["text", "json"],
			default: "text",
		})
		.coerce("type", (value: string | undefined) =>
			resolveFileToken(value, "type", "text")
		)
		.option("with-metadata", {
			type: "boolean",
			description: "Whether to include metadata in the response.",
			default: false,
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

type Request = SdkRequest<"workers-kv-namespace-get-multiple-key-value-pairs">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <namespace-id>",
	describe: "Get multiple key-value pairs",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "kv bulk get",
				classification: {
					safeFlags: ["type", "with-metadata", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf kv bulk get",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/storage/kv/namespaces/${argv["namespace-id"] == null ? "<namespace-id>" : encodeURIComponent(String(argv["namespace-id"]))}/bulk/get`,
						pathParams: { "namespace-id": String(argv["namespace-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										keys: argv["keys"],
										type: argv["type"],
										withMetadata: argv["with-metadata"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.kv.bulk.get({
							...bodyData,
							account_id: accountId,
							namespace_id: argv["namespace-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["keys"] === undefined) {
					throw new Error(
						"--keys is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					keys: argv["keys"],
					type: argv["type"],
					withMetadata: argv["with-metadata"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.kv.bulk.get({
						...bodyData,
						account_id: accountId,
						namespace_id: argv["namespace-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
