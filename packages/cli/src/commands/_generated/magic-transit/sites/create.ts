import operation from "../../_operations/magic-transit/sites/create.js";
/**
 * create command
 * @generated from apis/overlays/magic-transit.ts
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
	describe: "Create a new Site",
	usage: "$0 magic-transit sites create\n\nCreates a new Site",
	flags: {
		"connector-id": {
			kind: "parsed",
			brief: "Magic Connector identifier tag.",
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "The description field",
			optional: true,
			parse: String,
		},
		"ha-mode": {
			kind: "boolean",
			brief:
				"Site high availability mode. If set to true, the site can have two connectors and runs in high availability mode.",
			optional: true,
		},
		"location-lat": {
			kind: "parsed",
			brief: "Latitude",
			optional: true,
			parse: String,
		},
		"location-lon": {
			kind: "parsed",
			brief: "Longitude",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The name of the site.",
			optional: true,
			parse: String,
		},
		"secondary-connector-id": {
			kind: "parsed",
			brief:
				"Magic Connector identifier tag. Used when high availability mode is on.",
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
				command: "magic-transit sites create",
				classification: {
					safeFlags: ["ha-mode", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"The name of the site."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf magic-transit sites create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/sites`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										connector_id: resolveFileToken(
											argv["connector-id"] as string | undefined,
											"connector-id",
											"text"
										),
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										ha_mode: argv["ha-mode"],
										location: {
											lat: resolveFileToken(
												argv["location-lat"] as string | undefined,
												"location-lat",
												"text"
											),
											lon: resolveFileToken(
												argv["location-lon"] as string | undefined,
												"location-lon",
												"text"
											),
										},
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										secondary_connector_id: resolveFileToken(
											argv["secondary-connector-id"] as string | undefined,
											"secondary-connector-id",
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
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					connector_id: resolveFileToken(
						argv["connector-id"] as string | undefined,
						"connector-id",
						"text"
					),
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					ha_mode: argv["ha-mode"],
					location: {
						lat: resolveFileToken(
							argv["location-lat"] as string | undefined,
							"location-lat",
							"text"
						),
						lon: resolveFileToken(
							argv["location-lon"] as string | undefined,
							"location-lon",
							"text"
						),
					},
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					secondary_connector_id: resolveFileToken(
						argv["secondary-connector-id"] as string | undefined,
						"secondary-connector-id",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
