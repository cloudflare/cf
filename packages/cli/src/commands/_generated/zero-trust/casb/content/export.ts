import operation from "../../../_operations/zero-trust/casb/content/export.js";
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
	describe: "Create a content export",
	usage:
		"$0 zero-trust casb content export\n\nCreates a CSV export for content and accepts optional filters in the payload.",
	flags: {
		"dlp-profile-id": {
			kind: "parsed",
			brief: "Filter by DLP profile IDs.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"dlp-profile-information": {
			kind: "parsed",
			brief:
				'DLP profile metadata for the export. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"entries": [{...}], "id": string, "name": string}].',
			optional: true,
			parse: String,
		},
		"integration-id": {
			kind: "parsed",
			brief: "Filter by integration IDs.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"max-affliction-date": {
			kind: "parsed",
			brief: "Filter to view content flagged on or before this date.",
			optional: true,
			parse: String,
		},
		"min-affliction-date": {
			kind: "parsed",
			brief: "Filter to view content flagged on or after this date.",
			optional: true,
			parse: String,
		},
		orders: {
			kind: "parsed",
			brief:
				'Ordering specifications for the export. Provide as a JSON array of objects or @path/to/file.json. Shape: [({"direction": "asc" | "desc", "name": string} & {"name": "asset_name" | "dlp_profile_count" | "integration_name" | ...more})].',
			optional: true,
			parse: String,
		},
		search: {
			kind: "parsed",
			brief: "Search term to filter content.",
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
			brief: "Request body for creating content exports.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust casb content export",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["dlp-profile-information"] === undefined) {
						throw new Error(
							"--dlp-profile-information is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust casb content export",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/data-security/posture/content/export`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										dlp_profile_id: argv["dlp-profile-id"],
										dlp_profile_information: parseObjectArray(
											argv["dlp-profile-information"],
											"dlp-profile-information"
										),
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
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					dlp_profile_id: argv["dlp-profile-id"],
					dlp_profile_information: parseObjectArray(
						argv["dlp-profile-information"],
						"dlp-profile-information"
					),
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
