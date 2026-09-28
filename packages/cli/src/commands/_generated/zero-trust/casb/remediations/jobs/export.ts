import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * export command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust casb remediations jobs export\n\nCreates a CSV export for remediation jobs and accepts optional filters in the payload."
		)
		.option("integration-id", {
			type: "string",
			array: true,
			description: "Filter by multiple integration IDs.",
		})
		.option("max-updated-at", {
			type: "string",
			description:
				"Filter to view remediation jobs updated on or before this datetime. Can be a date-time in ISO 8601 format or an epoch timestamp.",
		})
		.option("min-updated-at", {
			type: "string",
			description:
				"Filter to view remediation jobs updated on or after this datetime. Can be a date-time in ISO 8601 format or an epoch timestamp.",
		})
		.option("orders", {
			type: "string",
			description:
				"Ordering specifications for the export. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("search", { type: "string", description: "A search term." })
		.option("status", {
			type: "string",
			array: true,
			description: "Filter by remediation job status.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Filter specification for remediation jobs export.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"CreateRemediationJobsExportCSV">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "export",
	describe: "Create a remediation jobs export",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust casb remediations jobs export",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust casb remediations jobs export",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/data-security/posture/remediations/jobs/export`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										integration_id: argv["integration-id"],
										max_updated_at: resolveFileToken(
											argv["max-updated-at"] as string | undefined,
											"max-updated-at",
											"text"
										),
										min_updated_at: resolveFileToken(
											argv["min-updated-at"] as string | undefined,
											"min-updated-at",
											"text"
										),
										orders: parseObjectArray(argv["orders"], "orders"),
										search: resolveFileToken(
											argv["search"] as string | undefined,
											"search",
											"text"
										),
										status: argv["status"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Loading`, async () =>
						client.zeroTrust.casb.remediations.jobs.export({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Loaded` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					integration_id: argv["integration-id"],
					max_updated_at: resolveFileToken(
						argv["max-updated-at"] as string | undefined,
						"max-updated-at",
						"text"
					),
					min_updated_at: resolveFileToken(
						argv["min-updated-at"] as string | undefined,
						"min-updated-at",
						"text"
					),
					orders: parseObjectArray(argv["orders"], "orders"),
					search: resolveFileToken(
						argv["search"] as string | undefined,
						"search",
						"text"
					),
					status: argv["status"],
				});
				const result = await withProgress(`Loading`, async () =>
					client.zeroTrust.casb.remediations.jobs.export({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
