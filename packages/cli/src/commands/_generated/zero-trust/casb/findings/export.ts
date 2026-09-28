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
			"$0 zero-trust casb findings export\n\nCreates a CSV export for findings and accepts optional filters in the payload."
		)
		.option("ignored", {
			type: "boolean",
			description:
				"Filter for only the ignored findings. Set to false to only see active items.",
		})
		.option("integration-id", {
			type: "string",
			array: true,
			description: "Filter by multiple integration IDs.",
		})
		.option("max-affliction-date", {
			type: "string",
			description:
				"Filter to view findings that occurred on or before the affliction date. Can be a date-time in ISO 8601 format or an epoch timestamp.",
		})
		.option("min-affliction-date", {
			type: "string",
			description:
				"Filter to view findings that occurred on or after the affliction date. Can be a date-time in ISO 8601 format or an epoch timestamp.",
		})
		.option("orders", {
			type: "string",
			description:
				"Which fields to use when ordering the findings. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("search", { type: "string", description: "A search term." })
		.option("severities", {
			type: "string",
			array: true,
			description: "Filter by severity levels.",
		})
		.option("vendors", {
			type: "string",
			array: true,
			description: "Filter by vendor types.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Filter specification for findings export jobs.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"CreateFindingExportCSV">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "export",
	describe: "Create new findings export request",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust casb findings export",
				classification: {
					safeFlags: ["ignored", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust casb findings export",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/data-security/posture/findings/export`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										ignored: argv["ignored"],
										integration_id: argv["integration-id"],
										max_affliction_date: resolveFileToken(
											argv["max-affliction-date"] as string | undefined,
											"max-affliction-date",
											"text"
										),
										min_affliction_date: resolveFileToken(
											argv["min-affliction-date"] as string | undefined,
											"min-affliction-date",
											"text"
										),
										orders: parseObjectArray(argv["orders"], "orders"),
										search: resolveFileToken(
											argv["search"] as string | undefined,
											"search",
											"text"
										),
										severities: argv["severities"],
										vendors: argv["vendors"],
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
						client.zeroTrust.casb.findings.export({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Loaded` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					ignored: argv["ignored"],
					integration_id: argv["integration-id"],
					max_affliction_date: resolveFileToken(
						argv["max-affliction-date"] as string | undefined,
						"max-affliction-date",
						"text"
					),
					min_affliction_date: resolveFileToken(
						argv["min-affliction-date"] as string | undefined,
						"min-affliction-date",
						"text"
					),
					orders: parseObjectArray(argv["orders"], "orders"),
					search: resolveFileToken(
						argv["search"] as string | undefined,
						"search",
						"text"
					),
					severities: argv["severities"],
					vendors: argv["vendors"],
				});
				const result = await withProgress(`Loading`, async () =>
					client.zeroTrust.casb.findings.export({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
