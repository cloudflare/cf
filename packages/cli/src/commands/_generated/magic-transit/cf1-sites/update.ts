import operation from "../../_operations/magic-transit/cf1-sites/update.js";
/**
 * update command
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <cf1-site-id>",
	describe: "Update CF1 Site",
	usage:
		"$0 magic-transit cf1-sites update <cf1-site-id>\n\nPartially updates a specific CF1 Site for an account. Only the fields included in the request body are modified; omitted fields retain their existing values.",
	flags: {
		description: {
			kind: "parsed",
			brief: "A human-provided description of the CF1 Site.",
			optional: true,
			parse: String,
		},
		"location-lat": {
			kind: "parsed",
			brief: "Latitude of the CF1 Site.",
			optional: true,
			parse: Number,
		},
		"location-long": {
			kind: "parsed",
			brief: "Longitude of the CF1 Site.",
			optional: true,
			parse: Number,
		},
		"location-name": {
			kind: "parsed",
			brief: "Name of nearest town, city, or village.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief:
				"A human-provided name describing the CF1 Site that should be unique within the account.",
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
			brief:
				"Partial update payload for a CF1 Site. All properties are optional; only fields supplied in the request body are modified.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{ placeholder: "cf1-site-id", brief: "Identifier", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-transit cf1-sites update",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf magic-transit cf1-sites update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/cf1_sites/${argv["cf1-site-id"] == null ? "<cf1-site-id>" : encodeURIComponent(String(argv["cf1-site-id"]))}`,
						pathParams: { "cf1-site-id": String(argv["cf1-site-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										location: {
											lat: argv["location-lat"],
											long: argv["location-long"],
											name: resolveFileToken(
												argv["location-name"] as string | undefined,
												"location-name",
												"text"
											),
										},
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
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
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							cf1_site_id: argv["cf1-site-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					location: {
						lat: argv["location-lat"],
						long: argv["location-long"],
						name: resolveFileToken(
							argv["location-name"] as string | undefined,
							"location-name",
							"text"
						),
					},
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						cf1_site_id: argv["cf1-site-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
