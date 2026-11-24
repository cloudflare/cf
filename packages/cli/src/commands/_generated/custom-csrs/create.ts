import operation from "../_operations/custom-csrs/create.js";
/**
 * create command
 * @generated from apis/overlays/custom-csrs.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	getZoneId,
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
	describe: "Create Custom CSR",
	usage:
		"$0 custom-csrs create\n\nGenerate a new custom Certificate Signing Request (CSR) for an account or zone. Cloudflare generates and securely stores the private key associated with the CSR.\n\nRuns against your account. Pass --zone to run against a zone instead. CLOUDFLARE_ZONE_ID is ignored.",
	flags: {
		"common-name": {
			kind: "parsed",
			brief:
				"The common name (domain) for the CSR. Must be at most 64 characters.",
			optional: true,
			parse: String,
		},
		country: {
			kind: "parsed",
			brief: "Two-letter ISO 3166-1 alpha-2 country code.",
			optional: true,
			parse: String,
		},
		description: {
			kind: "parsed",
			brief: "Optional description for the CSR.",
			optional: true,
			parse: String,
		},
		"key-type": {
			kind: "parsed",
			brief:
				"Key algorithm to use for the CSR. Defaults to rsa2048 if not specified.",
			default: "rsa2048",
			choices: ["rsa2048", "p256v1"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "key-type", "text"),
		},
		locality: {
			kind: "parsed",
			brief: "City or locality name.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Human-readable name for the CSR.",
			optional: true,
			parse: String,
		},
		organization: {
			kind: "parsed",
			brief: "Organization name.",
			optional: true,
			parse: String,
		},
		"organizational-unit": {
			kind: "parsed",
			brief: "Organizational unit name.",
			optional: true,
			parse: String,
		},
		sans: {
			kind: "parsed",
			brief:
				"Subject Alternative Names for the CSR. At least one SAN is required.",
			variadic: true,
			optional: true,
			parse: String,
		},
		state: {
			kind: "parsed",
			brief: "State or province name.",
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
			brief: "Request body for creating a custom CSR.",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "custom-csrs create",
				classification: {
					safeFlags: ["key-type", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["common-name"] === undefined) {
						argv["common-name"] = await promptForRequiredField(
							"common-name",
							"The common name (domain) for the CSR. Must be at most 64 characters."
						);
					}
					if (argv["country"] === undefined) {
						argv["country"] = await promptForRequiredField(
							"country",
							"Two-letter ISO 3166-1 alpha-2 country code."
						);
					}
					if (argv["locality"] === undefined) {
						argv["locality"] = await promptForRequiredField(
							"locality",
							"City or locality name."
						);
					}
					if (argv["organization"] === undefined) {
						argv["organization"] = await promptForRequiredField(
							"organization",
							"Organization name."
						);
					}
					if (argv["sans"] === undefined) {
						throw new Error(
							"--sans is required (or pass --body with this field set)."
						);
					}
					if (argv["state"] === undefined) {
						argv["state"] = await promptForRequiredField(
							"state",
							"State or province name."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId =
						argv.zone === undefined
							? await resolveAccountIdSilent()
							: undefined;
					const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
					const accountOrZoneId =
						argv.zone ?? __cfDryRunAccountId ?? "<account-id>";
					formatDryRun({
						command: "cf custom-csrs create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/custom_csrs`,
						pathParams: {
							"account-or-zone": String(accountOrZone),
							"account-or-zone-id": String(accountOrZoneId),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										common_name: resolveFileToken(
											argv["common-name"] as string | undefined,
											"common-name",
											"text"
										),
										country: resolveFileToken(
											argv["country"] as string | undefined,
											"country",
											"text"
										),
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										key_type: argv["key-type"],
										locality: resolveFileToken(
											argv["locality"] as string | undefined,
											"locality",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										organization: resolveFileToken(
											argv["organization"] as string | undefined,
											"organization",
											"text"
										),
										organizational_unit: resolveFileToken(
											argv["organizational-unit"] as string | undefined,
											"organizational-unit",
											"text"
										),
										sans: argv["sans"],
										state: resolveFileToken(
											argv["state"] as string | undefined,
											"state",
											"text"
										),
									}),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountOrZone = argv.zone === undefined ? "accounts" : "zones";
				const accountOrZoneId =
					accountOrZone === "zones"
						? await getZoneId({ zone: argv.zone }, client, {
								quiet: argv.quiet,
							})
						: argv.local
							? LOCAL_ACCOUNT_ID
							: await getAccountId();
				if (accountOrZone === "zones") {
					argv.zoneId = accountOrZoneId;
				} else {
					argv.accountId = accountOrZoneId;
				}

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_or_zone: accountOrZone,
							account_or_zone_id: accountOrZoneId,
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					common_name: resolveFileToken(
						argv["common-name"] as string | undefined,
						"common-name",
						"text"
					),
					country: resolveFileToken(
						argv["country"] as string | undefined,
						"country",
						"text"
					),
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					key_type: argv["key-type"],
					locality: resolveFileToken(
						argv["locality"] as string | undefined,
						"locality",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					organization: resolveFileToken(
						argv["organization"] as string | undefined,
						"organization",
						"text"
					),
					organizational_unit: resolveFileToken(
						argv["organizational-unit"] as string | undefined,
						"organizational-unit",
						"text"
					),
					sans: argv["sans"],
					state: resolveFileToken(
						argv["state"] as string | undefined,
						"state",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
