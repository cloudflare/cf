import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * set-operator-price command
 * @generated from apis/overlays/pay-per-use.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 pay-per-use pricing set-operator-price <operator-id>\n\nProposes a required price, withdraws a pending proposal, accepts an operator's default pay-per-use price, or resumes an accepted price before its scheduled expiry. Propose, accept_default, and resume require an enabled operator with a verified name, an enabled publisher zone, and matching billing classifications."
		)
		.positional("operator-id", {
			type: "string",
			description: "Stable pay-per-use operator identifier.",
			demandOption: true,
		})
		.option("action", {
			type: "string",
			description: "The action field",
			choices: ["propose", "withdraw", "accept_default", "resume"],
		})
		.option("price-usd-microcents", {
			type: "number",
			description:
				"Price in microcents. Must be a multiple of 100,000 ($0.001) between $0.001 and $9,999.999.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Pay-per-use publisher price action",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"pay-per-crawl.postPPUPublisherPriceAction">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "set-operator-price <operator-id>",
	describe: "Set a pay-per-use operator price",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "pay-per-use pricing set-operator-price",
				classification: {
					safeFlags: ["action", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf pay-per-use pricing set-operator-price",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/pay-per-use/operators/${argv["operator-id"] == null ? "<operator-id>" : encodeURIComponent(String(argv["operator-id"]))}/price`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
							"operator-id": String(argv["operator-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										action: resolveFileToken(
											argv["action"] as string | undefined,
											"action",
											"text"
										),
										price_usd_microcents: argv["price-usd-microcents"],
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
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.payPerUse.pricing.setOperatorPrice({
							body: bodyData,
							zone_id: zoneId,
							operator_id: argv["operator-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["action"] === undefined) {
					argv["action"] = await promptForRequiredEnumField(
						"action",
						"The action field",
						["propose", "withdraw", "accept_default", "resume"] as const
					);
				}

				if (
					argv["action"] === "propose" &&
					argv["price-usd-microcents"] === undefined
				) {
					throw new Error(
						"--price-usd-microcents is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					action: resolveFileToken(
						argv["action"] as string | undefined,
						"action",
						"text"
					),
					price_usd_microcents: argv["price-usd-microcents"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.payPerUse.pricing.setOperatorPrice({
						body: bodyData,
						zone_id: zoneId,
						operator_id: argv["operator-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
