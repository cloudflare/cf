import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseObjectArray,
	setNestedValue,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * export command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust casb findings instances export <finding-namespace-id>\n\nCreates a CSV export for Finding instances and accepts optional filters in the payload. Identify the finding as `<integration_id>-<finding_type_id>`: join the `integration.id` and `finding.id` of the finding (from the List posture findings response) with a hyphen."
		)
		.positional("finding-namespace-id", {
			type: "string",
			description:
				"Identifies the finding whose instances to export, in the form \`<integration_id>-<finding_type_id>\`. Take \`integration.id\` and \`finding.id\` from the finding in the List posture findings response and join them with a hyphen.",
			demandOption: true,
		})
		.option("archived", {
			type: "boolean",
			description: "Filter for archived status.",
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
				"Ordering specifications for the export. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("search", { type: "string", description: "A search term." })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Filter specification for finding instance exports.",
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "export <finding-namespace-id>",
	describe: "Create a finding instances export",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust casb findings instances export",
				classification: {
					safeFlags: ["archived", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust casb findings instances export",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/data-security/posture/findings/${argv["finding-namespace-id"] == null ? "<finding-namespace-id>" : encodeURIComponent(String(argv["finding-namespace-id"]))}/instances/export`,
						pathParams: {
							"finding-namespace-id": String(
								argv["finding-namespace-id"] ?? ""
							),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										archived: argv["archived"],
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
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Loading`, async () =>
						requestApi<unknown>(
							client,
							"POST",
							`/accounts/${accountId}/data-security/posture/findings/${encodeURIComponent(String(argv["finding-namespace-id"]))}/instances/export`,
							{ body: bodyData }
						)
					);
					formatOutput(result, { successLabel: `Loaded` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["archived"] !== undefined)
					setNestedValue(bodyData, ["archived"], argv["archived"]);
				if (argv["max-affliction-date"] !== undefined)
					setNestedValue(
						bodyData,
						["max_affliction_date"],
						resolveFileToken(
							argv["max-affliction-date"] as string | undefined,
							"max-affliction-date",
							"text"
						)
					);
				if (argv["min-affliction-date"] !== undefined)
					setNestedValue(
						bodyData,
						["min_affliction_date"],
						resolveFileToken(
							argv["min-affliction-date"] as string | undefined,
							"min-affliction-date",
							"text"
						)
					);
				if (argv["orders"] !== undefined)
					setNestedValue(
						bodyData,
						["orders"],
						parseObjectArray(argv["orders"], "orders")
					);
				if (argv["search"] !== undefined)
					setNestedValue(
						bodyData,
						["search"],
						resolveFileToken(
							argv["search"] as string | undefined,
							"search",
							"text"
						)
					);
				const result = await withProgress(`Loading`, async () =>
					requestApi<unknown>(
						client,
						"POST",
						`/accounts/${accountId}/data-security/posture/findings/${encodeURIComponent(String(argv["finding-namespace-id"]))}/instances/export`,
						{ body: Object.keys(bodyData).length > 0 ? bodyData : undefined }
					)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
