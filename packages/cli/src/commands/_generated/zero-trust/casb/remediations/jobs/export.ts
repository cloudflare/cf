import operation from "../../../../_operations/zero-trust/casb/remediations/jobs/export.js";
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
	describe: "Create a remediation jobs export",
	usage:
		"$0 zero-trust casb remediations jobs export\n\nCreates a CSV export for remediation jobs and accepts optional filters in the payload.",
	flags: {
		"integration-id": {
			kind: "parsed",
			brief: "Filter by multiple integration IDs.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"max-updated-at": {
			kind: "parsed",
			brief:
				"Filter to view remediation jobs updated on or before this datetime. Can be a date-time in ISO 8601 format or an epoch timestamp.",
			optional: true,
			parse: String,
		},
		"min-updated-at": {
			kind: "parsed",
			brief:
				"Filter to view remediation jobs updated on or after this datetime. Can be a date-time in ISO 8601 format or an epoch timestamp.",
			optional: true,
			parse: String,
		},
		orders: {
			kind: "parsed",
			brief:
				'Ordering specifications for the export. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"direction": "asc" | "desc", "name": "asset_name" | "finding_type_name" | "integration_name" | ...more}].',
			optional: true,
			parse: String,
		},
		search: {
			kind: "parsed",
			brief: "A search term.",
			optional: true,
			parse: String,
		},
		status: {
			kind: "parsed",
			brief: "Filter by remediation job status.",
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
			brief: "Filter specification for remediation jobs export.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust casb remediations jobs export",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
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
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
