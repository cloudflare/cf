import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
 * @generated from apis/overlays/monetization.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 monetization rules edit <rule-id>\n\nApplies a partial update to a single Payment Required rule. Only the fields present in the request body are changed; omitted fields keep their current values. Returns the full resulting rule collection."
		)
		.positional("rule-id", {
			type: "string",
			description: "The unique ID of the payment rule.",
			demandOption: true,
		})
		.option("address", {
			type: "string",
			description:
				"0x-prefixed 20-byte hexadecimal Ethereum address. Mixed-case addresses must carry a valid EIP-55 checksum; all-lowercase or all-uppercase addresses are also accepted. The effective address must pass wallet screening whenever the rule is patched.",
		})
		.option("description", {
			type: "string",
			description: "The description field",
		})
		.option("enabled", { type: "boolean", description: "The enabled field" })
		.option("expression", {
			type: "string",
			description:
				"Wirefilter expression identifying the requests that require payment. Forwarded verbatim to the Rulesets API, which validates its syntax.",
		})
		.option("price", {
			type: "string",
			description:
				'Price in the smallest indivisible unit of the configured payment token, encoded as a decimal string. Must be a canonical decimal integer in [1000, 100000000]: no leading zeros, and a bare JSON number is rejected. The price is required for the fixed-price schemes ("exact" and "upto") and must be at least 1000, the smallest amount the payment facilitator can settle ($0.001 for a 6-decimal token such as USDC), and at most 100000000 ($100 for a 6-decimal token). When the scheme is "origin_controlled" the origin server sets pricing dynamically and the rule carries no price: the field must be omitted — any provided value, including "0", is rejected because it would not be enforced. Responses always encode this as a string and omit it for "origin_controlled" rules; the pattern matches exactly the set of values the server accepts.',
		})
		.option("scheme", {
			type: "string",
			description:
				'X402 payment scheme. "exact" requires the specified payment amount; "upto" permits a payment up to the specified amount; "origin_controlled" lets the origin server set pricing dynamically, in which case the rule carries no price and the price field must be omitted.',
			choices: ["exact", "upto", "origin_controlled"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Partial update to a single payment rule. Only the fields present are modified; omitted fields keep their existing values.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"monetization-patch-rule">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <rule-id>",
	describe: "Update a payment rule",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "monetization rules edit",
				classification: {
					safeFlags: ["enabled", "scheme", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf monetization rules edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/monetization/rules/${argv["rule-id"] == null ? "<rule-id>" : encodeURIComponent(String(argv["rule-id"]))}`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"rule-id": String(argv["rule-id"] ?? ""),
						},
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
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										enabled: argv["enabled"],
										expression: resolveFileToken(
											argv["expression"] as string | undefined,
											"expression",
											"text"
										),
										price: resolveFileToken(
											argv["price"] as string | undefined,
											"price",
											"text"
										),
										scheme: resolveFileToken(
											argv["scheme"] as string | undefined,
											"scheme",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.monetization.rules.edit({
							...bodyData,
							zone_id: zoneId,
							rule_id: argv["rule-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					address: resolveFileToken(
						argv["address"] as string | undefined,
						"address",
						"text"
					),
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					enabled: argv["enabled"],
					expression: resolveFileToken(
						argv["expression"] as string | undefined,
						"expression",
						"text"
					),
					price: resolveFileToken(
						argv["price"] as string | undefined,
						"price",
						"text"
					),
					scheme: resolveFileToken(
						argv["scheme"] as string | undefined,
						"scheme",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.monetization.rules.edit({
						...bodyData,
						zone_id: zoneId,
						rule_id: argv["rule-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
