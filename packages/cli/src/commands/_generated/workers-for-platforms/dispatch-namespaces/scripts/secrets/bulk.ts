import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * bulk command
 * @generated from apis/overlays/workers-for-platforms.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { readFileForFlag } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 workers-for-platforms dispatch-namespaces scripts secrets bulk\n\nCreate, update, or delete multiple secrets on a Workers for Platforms script in a single operation using JSON Merge Patch (RFC 7396). This operation creates a single version with all changes included. Prefer this API instead of changing many secrets individually. Usage: - To create or update a secret, set its value to a secret object. - To delete a secret, set its value to `null`. - Secrets not included in the request are left unchanged."
		)
		.option("dispatch-namespace", {
			type: "string",
			description: "Name of the Workers for Platforms dispatch namespace.",
			demandOption: true,
		})
		.option("script-name", {
			type: "string",
			description: "Name of the script.",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"JSON Merge Patch (RFC 7396) request body for bulk secret changes. ",
		})
		.option("file", {
			type: "string",
			description: "Path to a file to upload as the request body",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "bulk",
	describe: "Patch multiple Workers for Platforms script secrets",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command:
					"workers-for-platforms dispatch-namespaces scripts secrets bulk",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command:
							"cf workers-for-platforms dispatch-namespaces scripts secrets bulk",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/workers/dispatch/namespaces/${argv["dispatch-namespace"] == null ? "<dispatch-namespace>" : encodeURIComponent(String(argv["dispatch-namespace"]))}/scripts/${argv["script-name"] == null ? "<script-name>" : encodeURIComponent(String(argv["script-name"]))}/secrets-bulk`,
						pathParams: {
							"dispatch-namespace": String(argv["dispatch-namespace"] ?? ""),
							"script-name": String(argv["script-name"] ?? ""),
						},
						bodyKind: argv.file !== undefined ? "octet-stream" : "json",
						body:
							argv.file !== undefined
								? { file: argv.file }
								: argv.body !== undefined
									? parseBody(argv.body)
									: undefined,
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.file) {
					const fileContent = readFileForFlag(argv.file);
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PATCH",
							`/accounts/${accountId}/workers/dispatch/namespaces/${encodeURIComponent(String(argv["dispatch-namespace"]))}/scripts/${encodeURIComponent(String(argv["script-name"]))}/secrets-bulk`,
							{
								body: fileContent,
								headers: { "Content-Type": "application/merge-patch+json" },
							}
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PATCH",
							`/accounts/${accountId}/workers/dispatch/namespaces/${encodeURIComponent(String(argv["dispatch-namespace"]))}/scripts/${encodeURIComponent(String(argv["script-name"]))}/secrets-bulk`,
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
