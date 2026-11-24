import operation from "../../../_operations/cloudforce-one/threat-intel/indicators/create.js";
/**
 * create command
 * @generated from apis/overlays/cloudforce-one.ts
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
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create <dataset-id>",
	describe: "Create an indicator",
	usage:
		"$0 cloudforce-one threat-intel indicators create <dataset-id>\n\nCreates an indicator in a dataset. Set `autoCreateType` to create the indicator type if it doesn't exist.",
	flags: {
		"auto-create-type": {
			kind: "boolean",
			brief:
				"If true, automatically create the indicator type if it doesn't exist. If false (default), reject an indicator type the dataset has not registered, unless the type is pre-approved (the same list event create accepts, such as BITCOIN or ERC-20), in which case it is registered on first use. Direct create applies this check to analytics datasets too. Bulk create skips it for analytics datasets.",
			optional: true,
		},
		"indicator-type": {
			kind: "parsed",
			brief: "The indicatorType field",
			optional: true,
			parse: String,
		},
		"related-events": {
			kind: "parsed",
			brief:
				'The relatedEvents field. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"datasetId": string, "eventId": string}].',
			optional: true,
			parse: String,
		},
		tlp: {
			kind: "parsed",
			brief:
				"Traffic Light Protocol designation. Case-insensitive on input, stored and returned as UPPERCASE. Allowed values: clear, green, amber, amber-strict, red, purple.",
			optional: true,
			parse: String,
		},
		value: {
			kind: "parsed",
			brief: "The value field",
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
	operands: [
		{ placeholder: "dataset-id", brief: "Dataset UUID.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "cloudforce-one threat-intel indicators create",
				classification: {
					safeFlags: ["auto-create-type", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["indicator-type"] === undefined) {
						argv["indicator-type"] = await promptForRequiredField(
							"indicator-type",
							"The indicatorType field"
						);
					}
					if (argv["value"] === undefined) {
						argv["value"] = await promptForRequiredField(
							"value",
							"The value field"
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf cloudforce-one threat-intel indicators create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/dataset/${argv["dataset-id"] == null ? "<dataset-id>" : encodeURIComponent(String(argv["dataset-id"]))}/indicators/create`,
						pathParams: { "dataset-id": String(argv["dataset-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										autoCreateType: argv["auto-create-type"],
										indicatorType: resolveFileToken(
											argv["indicator-type"] as string | undefined,
											"indicator-type",
											"text"
										),
										relatedEvents: parseObjectArray(
											argv["related-events"],
											"related-events"
										),
										tlp: resolveFileToken(
											argv["tlp"] as string | undefined,
											"tlp",
											"text"
										),
										value: resolveFileToken(
											argv["value"] as string | undefined,
											"value",
											"text"
										),
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
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							dataset_id: argv["dataset-id"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					autoCreateType: argv["auto-create-type"],
					indicatorType: resolveFileToken(
						argv["indicator-type"] as string | undefined,
						"indicator-type",
						"text"
					),
					relatedEvents: parseObjectArray(
						argv["related-events"],
						"related-events"
					),
					tlp: resolveFileToken(
						argv["tlp"] as string | undefined,
						"tlp",
						"text"
					),
					value: resolveFileToken(
						argv["value"] as string | undefined,
						"value",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						dataset_id: argv["dataset-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
