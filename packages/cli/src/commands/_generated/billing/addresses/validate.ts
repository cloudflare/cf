import operation from "../../_operations/billing/addresses/validate.js";
/**
 * validate command
 * @generated from apis/overlays/billing.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "validate",
	describe: "Validate Billing Address",
	usage:
		"$0 billing addresses validate\n\nValidates a billing address and returns validated address suggestions. Authentication is not enforced to support pre-signup address validation flows, so credentials are accepted but not required.",
	flags: {
		address: {
			kind: "parsed",
			brief: "Address line 1.",
			optional: true,
			parse: String,
		},
		address2: {
			kind: "parsed",
			brief: "Address line 2.",
			optional: true,
			parse: String,
		},
		city: { kind: "parsed", brief: "City.", optional: true, parse: String },
		country: {
			kind: "parsed",
			brief: "Country code.",
			optional: true,
			parse: String,
		},
		state: {
			kind: "parsed",
			brief: "State or province.",
			optional: true,
			parse: String,
		},
		zipcode: {
			kind: "parsed",
			brief: "Postal or zip code.",
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
				command: "billing addresses validate",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf billing addresses validate",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/billing/address-validation`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										address: resolveFileToken(
											argv["address"] as string | undefined,
											"address",
											"text"
										),
										address2: resolveFileToken(
											argv["address2"] as string | undefined,
											"address2",
											"text"
										),
										city: resolveFileToken(
											argv["city"] as string | undefined,
											"city",
											"text"
										),
										country: resolveFileToken(
											argv["country"] as string | undefined,
											"country",
											"text"
										),
										state: resolveFileToken(
											argv["state"] as string | undefined,
											"state",
											"text"
										),
										zipcode: resolveFileToken(
											argv["zipcode"] as string | undefined,
											"zipcode",
											"text"
										),
									}),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Validating`, async () =>
						client.send(operation, { body: bodyData })
					);
					formatOutput(result, { successLabel: `Validated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					address: resolveFileToken(
						argv["address"] as string | undefined,
						"address",
						"text"
					),
					address2: resolveFileToken(
						argv["address2"] as string | undefined,
						"address2",
						"text"
					),
					city: resolveFileToken(
						argv["city"] as string | undefined,
						"city",
						"text"
					),
					country: resolveFileToken(
						argv["country"] as string | undefined,
						"country",
						"text"
					),
					state: resolveFileToken(
						argv["state"] as string | undefined,
						"state",
						"text"
					),
					zipcode: resolveFileToken(
						argv["zipcode"] as string | undefined,
						"zipcode",
						"text"
					),
				});
				const result = await withProgress(`Validating`, async () =>
					client.send(operation, { body: bodyData })
				);
				formatOutput(result, { successLabel: `Validated` });
			}
		),
});

export default command;
