import operation from "../_operations/d1/create.js";
/**
 * create command
 * @generated from apis/overlays/d1.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Create D1 Database",
	usage: "$0 d1 create\n\nCreate a new D1 database in your account.",
	flags: {
		jurisdiction: {
			kind: "parsed",
			brief:
				"Specify the location to restrict the D1 database to run and store data. If this option is present, the location hint is ignored.",
			optional: true,
			choices: ["eu", "fedramp", "us"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "jurisdiction", "text"),
		},
		name: {
			kind: "parsed",
			brief: "D1 database name.",
			optional: true,
			parse: String,
		},
		"primary-location-hint": {
			kind: "parsed",
			brief:
				"Specify the region to create the D1 primary, if available. If this option is omitted, the D1 will be created as close as possible to the current user.",
			optional: true,
			choices: ["wnam", "enam", "weur", "eeur", "apac", "oc"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "primary-location-hint", "text"),
		},
		"read-replication-mode": {
			kind: "parsed",
			brief:
				"The read replication mode for the database. Use 'auto' to create replicas and allow D1 automatically place them around the world, or 'disabled' to not use any database replicas (it can take a few hours for all replicas to be deleted).",
			optional: true,
			choices: ["auto", "disabled"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "read-replication-mode", "text"),
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
				command: "d1 create",
				classification: {
					safeFlags: [
						"jurisdiction",
						"primary-location-hint",
						"read-replication-mode",
						"dry-run",
					],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"D1 database name."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf d1 create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/d1/database`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										jurisdiction: argv["jurisdiction"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										primary_location_hint: argv["primary-location-hint"],
										read_replication: {
											mode: argv["read-replication-mode"],
										},
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
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					jurisdiction: argv["jurisdiction"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					primary_location_hint: argv["primary-location-hint"],
					read_replication: {
						mode: argv["read-replication-mode"],
					},
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
