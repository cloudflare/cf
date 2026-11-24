import operation from "../../../_operations/zero-trust/cws/policy-sets/create.js";
/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseJsonMap,
	parseObjectArray,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Create a new policy set",
	usage:
		"$0 zero-trust cws policy-sets create\n\nCreates a policy set containing the specified policies and workload targets.",
	flags: {
		description: {
			kind: "parsed",
			brief: "Optional free-form description.",
			optional: true,
			parse: String,
		},
		"exclude-workload-ids": {
			kind: "parsed",
			brief:
				"Workload IDs that exclude matching requests. Exclusions take precedence.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"include-workload-ids": {
			kind: "parsed",
			brief:
				"Workload IDs that include matching requests. Empty or omitted includes all requests before exclusions.",
			variadic: true,
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Name of the policy set",
			optional: true,
			parse: String,
		},
		policies: {
			kind: "parsed",
			brief:
				'Policies to include with per-membership enforcement mode. Provide as a JSON array of objects, null, or @path/to/file.json. Shape: [{"policy_id": string, "enforce"?: boolean}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		tags: {
			kind: "parsed",
			brief:
				'Tags to attach. Keys are limited to 256 UTF-8 bytes and values to 1024 UTF-8 bytes. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": string}.',
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
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust cws policy-sets create",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"Name of the policy set"
						);
					}
					if (argv["policies"] === undefined) {
						throw new Error(
							"--policies is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust cws policy-sets create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cws/policy-sets`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
											description: resolveFileToken(
												argv["description"] as string | undefined,
												"description",
												"text"
											),
											exclude_workload_ids: argv["exclude-workload-ids"],
											include_workload_ids: argv["include-workload-ids"],
											name: resolveFileToken(
												argv["name"] as string | undefined,
												"name",
												"text"
											),
											policies: parseObjectArray(
												argv["policies"],
												"policies",
												true
											),
											tags: parseJsonMap(argv["tags"], "tags"),
										},
										[["tags"]]
									),
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
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
						description: resolveFileToken(
							argv["description"] as string | undefined,
							"description",
							"text"
						),
						exclude_workload_ids: argv["exclude-workload-ids"],
						include_workload_ids: argv["include-workload-ids"],
						name: resolveFileToken(
							argv["name"] as string | undefined,
							"name",
							"text"
						),
						policies: parseObjectArray(argv["policies"], "policies", true),
						tags: parseJsonMap(argv["tags"], "tags"),
					},
					[["tags"]]
				);
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
