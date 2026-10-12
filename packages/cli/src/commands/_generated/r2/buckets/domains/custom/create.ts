import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * create command
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 r2 buckets domains custom create <bucket-name>\n\nRegister a new custom domain for an existing R2 bucket."
		)
		.positional("bucket-name", {
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
		.option("domain", {
			type: "string",
			description: "Name of the custom domain to be added.",
		})
		.option("enabled", {
			type: "boolean",
			description:
				"Whether to enable public bucket access at the custom domain. If undefined, the domain will be enabled.",
		})
		.option("min-tls", {
			type: "string",
			description:
				"Minimum TLS Version the custom domain will accept for incoming connections. If not set, defaults to 1.0.",
			choices: ["1.0", "1.1", "1.2", "1.3"],
		})
		.coerce("min-tls", (value) => resolveFileToken(value, "min-tls", "text"))
		.option("zone-id", {
			type: "string",
			description: "Zone ID of the custom domain.",
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

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <bucket-name>",
	describe: "Attach Custom Domain To Bucket",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "r2 buckets domains custom create",
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
						command: "cf r2 buckets domains custom create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/r2/buckets/${argv["bucket-name"] == null ? "<bucket-name>" : encodeURIComponent(String(argv["bucket-name"]))}/domains/custom`,
						pathParams: { "bucket-name": String(argv["bucket-name"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										ciphers: argv["ciphers"],
										domain: resolveFileToken(
											argv["domain"] as string | undefined,
											"domain",
											"text"
										),
										enabled: argv["enabled"],
										minTLS: argv["min-tls"],
										zoneId: resolveFileToken(
											argv["zone-id"] as string | undefined,
											"zone-id",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Creating`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/accounts/${accountId}/r2/buckets/${encodeURIComponent(String(argv["bucket-name"]))}/domains/custom`,
							{
								body: bodyData,
								headers: Object.keys(headers).length > 0 ? headers : undefined,
							}
						)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["domain"] === undefined) {
					argv["domain"] = await promptForRequiredField(
						"domain",
						"Name of the custom domain to be added."
					);
				}
				if (argv["enabled"] === undefined) {
					throw new Error(
						"--enabled is required (or pass --body with this field set)."
					);
				}
				if (argv["zone-id"] === undefined) {
					argv["zone-id"] = await promptForRequiredField(
						"zone-id",
						"Zone ID of the custom domain."
					);
				}

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["ciphers"] !== undefined)
					setNestedValue(bodyData, ["ciphers"], argv["ciphers"]);
				if (argv["domain"] !== undefined)
					setNestedValue(
						bodyData,
						["domain"],
						resolveFileToken(
							argv["domain"] as string | undefined,
							"domain",
							"text"
						)
					);
				if (argv["enabled"] !== undefined)
					setNestedValue(bodyData, ["enabled"], argv["enabled"]);
				if (argv["min-tls"] !== undefined)
					setNestedValue(bodyData, ["minTLS"], argv["min-tls"]);
				if (argv["zone-id"] !== undefined)
					setNestedValue(
						bodyData,
						["zoneId"],
						resolveFileToken(
							argv["zone-id"] as string | undefined,
							"zone-id",
							"text"
						)
					);
				const result = await withProgress(`Creating`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/r2/buckets/${encodeURIComponent(String(argv["bucket-name"]))}/domains/custom`,
						{
							body: Object.keys(bodyData).length > 0 ? bodyData : undefined,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
