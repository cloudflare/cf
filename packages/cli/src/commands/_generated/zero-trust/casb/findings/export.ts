import operation from "../../../_operations/zero-trust/casb/findings/export.js";
/**
 * export command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "export",
	describe: "Create new findings export request",
	usage:
		"$0 zero-trust casb findings export\n\nCreates a CSV export for findings and accepts optional filters in the payload.",
	flags: {
		ignored: {
			kind: "boolean",
			brief:
				"Filter for only the ignored findings. Set to false to only see active items.",
			optional: true,
		},
		"integration-id": {
			kind: "parsed",
			brief: "Filter by multiple integration IDs.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"max-affliction-date": {
			kind: "parsed",
			brief:
				"Filter to view findings that occurred on or before the affliction date. Can be a date-time in ISO 8601 format or an epoch timestamp.",
			optional: true,
			parse: String,
		},
		"min-affliction-date": {
			kind: "parsed",
			brief:
				"Filter to view findings that occurred on or after the affliction date. Can be a date-time in ISO 8601 format or an epoch timestamp.",
			optional: true,
			parse: String,
		},
		orders: {
			kind: "parsed",
			brief:
				'Which fields to use when ordering the findings. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"direction": "asc" | "desc", "name": "instance_count" | "finding.name" | "integration.name" | ...more}].',
			optional: true,
			parse: String,
		},
		product: {
			kind: "parsed",
			brief: "Filter by finding's category product.",
			optional: true,
			choices: ["SaaS", "Cloud"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "product", "text"),
		},
		search: {
			kind: "parsed",
			brief: "A search term.",
			optional: true,
			parse: String,
		},
		severities: {
			kind: "parsed",
			brief: "Filter by severity levels.",
			variadic: true,
			optional: true,
			parse: String,
		},
		vendors: {
			kind: "parsed",
			brief: "Filter by vendor types.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Filter specification for findings export jobs.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust casb findings export",
				classification: {
					safeFlags: ["ignored", "product", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
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
										product: argv["product"],
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
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Loading`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Loaded` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
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
					product: argv["product"],
					search: resolveFileToken(
						argv["search"] as string | undefined,
						"search",
						"text"
					),
					severities: argv["severities"],
					vendors: argv["vendors"],
				});
				const result = await withProgress(`Loading`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
