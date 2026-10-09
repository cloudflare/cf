import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * update command
 * @generated from apis/overlays/r2.ts
 */
import type { Argv, CommandModule } from "yargs";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, setNestedValue } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 r2 buckets domains custom update <domain>\n\nEdit the configuration for a custom domain on an existing R2 bucket."
		)
		.positional("domain", {
			type: "string",
			description: "Name of the custom domain.",
			demandOption: true,
		})
		.option("bucket-name", {
			type: "string",
			description: "Name of the bucket.",
			demandOption: true,
		})
		.option("cf-r2-jurisdiction", {
			type: "string",
			description:
				"Jurisdiction where objects in this bucket are guaranteed to be stored.",
		})
		.option("ciphers", {
			type: "string",
			array: true,
			description:
				"An allowlist of ciphers for TLS termination. These ciphers must be in the BoringSSL format.",
		})
		.option("enabled", {
			type: "boolean",
			description:
				"Whether to enable public bucket access at the specified custom domain.",
		})
		.option("min-tls", {
			type: "string",
			description:
				"Minimum TLS Version the custom domain will accept for incoming connections. If not set, defaults to previous value.",
			choices: ["1.0", "1.1", "1.2", "1.3"],
		})
		.coerce("min-tls", (value) => resolveFileToken(value, "min-tls", "text"))
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

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <domain>",
	describe: "Configure Custom Domain Settings",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "r2 buckets domains custom update",
				classification: {
					safeFlags: ["enabled", "min-tls", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const headers: Record<string, string> = {};
				if (argv["cf-r2-jurisdiction"] !== undefined)
					headers["cf-r2-jurisdiction"] = String(argv["cf-r2-jurisdiction"]);
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf r2 buckets domains custom update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/r2/buckets/${argv["bucket-name"] == null ? "<bucket-name>" : encodeURIComponent(String(argv["bucket-name"]))}/domains/custom/${argv["domain"] == null ? "<domain>" : encodeURIComponent(String(argv["domain"]))}`,
						pathParams: {
							"bucket-name": String(argv["bucket-name"] ?? ""),
							domain: String(argv["domain"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										ciphers: argv["ciphers"],
										enabled: argv["enabled"],
										minTLS: argv["min-tls"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PUT",
							`/accounts/${accountId}/r2/buckets/${encodeURIComponent(String(argv["bucket-name"]))}/domains/custom/${encodeURIComponent(String(argv["domain"]))}`,
							{
								body: bodyData,
								headers: Object.keys(headers).length > 0 ? headers : undefined,
							}
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["ciphers"] !== undefined)
					setNestedValue(bodyData, ["ciphers"], argv["ciphers"]);
				if (argv["enabled"] !== undefined)
					setNestedValue(bodyData, ["enabled"], argv["enabled"]);
				if (argv["min-tls"] !== undefined)
					setNestedValue(bodyData, ["minTLS"], argv["min-tls"]);
				const result = await withProgress(`Updating`, async () =>
					requestApi<unknown>(
						client,
						"PUT",
						`/accounts/${accountId}/r2/buckets/${encodeURIComponent(String(argv["bucket-name"]))}/domains/custom/${encodeURIComponent(String(argv["domain"]))}`,
						{
							body: Object.keys(bodyData).length > 0 ? bodyData : undefined,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
