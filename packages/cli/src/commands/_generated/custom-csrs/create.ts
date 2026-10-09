import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/custom-csrs.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 custom-csrs create\n\nGenerate a new custom Certificate Signing Request (CSR) for an account or zone. Cloudflare generates and securely stores the private key associated with the CSR."
		)
		.option("common-name", {
			type: "string",
			description:
				"The common name (domain) for the CSR. Must be at most 64 characters.",
		})
		.option("country", {
			type: "string",
			description: "Two-letter ISO 3166-1 alpha-2 country code.",
		})
		.option("description", {
			type: "string",
			description: "Optional description for the CSR.",
		})
		.option("key-type", {
			type: "string",
			description:
				"Key algorithm to use for the CSR. Defaults to rsa2048 if not specified.",
			choices: ["rsa2048", "p256v1"],
			default: "rsa2048",
		})
		.coerce("key-type", (value: string | undefined) =>
			resolveFileToken(value, "key-type", "text")
		)
		.option("locality", {
			type: "string",
			description: "City or locality name.",
		})
		.option("name", {
			type: "string",
			description: "Human-readable name for the CSR.",
		})
		.option("organization", {
			type: "string",
			description: "Organization name.",
		})
		.option("organizational-unit", {
			type: "string",
			description: "Organizational unit name.",
		})
		.option("sans", {
			type: "string",
			array: true,
			description:
				"Subject Alternative Names for the CSR. At least one SAN is required.",
		})
		.option("state", { type: "string", description: "State or province name." })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Request body for creating a custom CSR.",
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"generated:post:/{account_or_zone}/{account_or_zone_id}/custom_csrs">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create Custom CSR",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "custom-csrs create",
				classification: {
					safeFlags: ["key-type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
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

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.customCsrs.create({
							...bodyData,
							account_or_zone: accountOrZone,
							account_or_zone_id: accountOrZoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
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

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
					client.customCsrs.create({
						...bodyData,
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
