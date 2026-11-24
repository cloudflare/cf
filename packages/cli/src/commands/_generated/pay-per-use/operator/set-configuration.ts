import operation from "../../_operations/pay-per-use/operator/set-configuration.js";
/**
 * set-configuration command
 * @generated from apis/overlays/pay-per-use.ts
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
	command: "set-configuration",
	describe: "Set pay-per-use operator configuration",
	usage:
		"$0 pay-per-use operator set-configuration\n\nCreates or updates the pay-per-use operator configuration for an account. Creating an enabled configuration or re-enabling a disabled billable operator requires completed Stripe onboarding, while non-billable operators do not; an already-enabled operator is not affected by later Stripe status changes. A Cloudflare-verified operator's name and default price cannot be changed.",
	flags: {
		"default-price-usd-microcents": {
			kind: "parsed",
			brief:
				"Default price in microcents. 1 USD = 100,000,000 microcents. Must be a multiple of 100,000 ($0.001) between $0.001 and $9,999.999.",
			optional: true,
			parse: Number,
		},
		enabled: { kind: "boolean", brief: "The enabled field", optional: true },
		name: {
			kind: "parsed",
			brief: "The name field",
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
			brief: "Pay-per-use operator configuration",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "pay-per-use operator set-configuration",
				classification: {
					safeFlags: ["enabled", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["default-price-usd-microcents"] === undefined) {
						throw new Error(
							"--default-price-usd-microcents is required (or pass --body with this field set)."
						);
					}
					if (argv["enabled"] === undefined) {
						throw new Error(
							"--enabled is required (or pass --body with this field set)."
						);
					}
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"The name field"
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf pay-per-use operator set-configuration",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/pay-per-use/operator/configuration`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										default_price_usd_microcents:
											argv["default-price-usd-microcents"],
										enabled: argv["enabled"],
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
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					default_price_usd_microcents: argv["default-price-usd-microcents"],
					enabled: argv["enabled"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
