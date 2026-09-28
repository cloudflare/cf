import {
	createCommandClient,
	getAccountId,
	getZoneId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/accounts.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 accounts subscriptions create\n\nCreates an account or zone subscription."
		)
		.option("app-install-id", {
			type: "string",
			description: "app install id.",
		})
		.option("component-values", {
			type: "string",
			description:
				"Configurable component values for the subscription. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("frequency", {
			type: "string",
			description: "How often the subscription is renewed automatically.",
			choices: ["weekly", "monthly", "quarterly", "yearly"],
		})
		.option("rate-plan-currency", {
			type: "string",
			description: "The currency applied to the rate plan subscription.",
		})
		.option("rate-plan-externally-managed", {
			type: "boolean",
			description:
				"Whether this rate plan is managed externally from Cloudflare.",
		})
		.option("rate-plan-id", {
			type: "string",
			description: "The ID of the rate plan.",
		})
		.option("rate-plan-is-contract", {
			type: "boolean",
			description:
				"Whether a rate plan is enterprise-based (or newly adopted term contract).",
		})
		.option("rate-plan-public-name", {
			type: "string",
			description: "The full name of the rate plan.",
		})
		.option("rate-plan-scope", {
			type: "string",
			description: "The scope that this rate plan applies to.",
		})
		.option("rate-plan-sets", {
			type: "string",
			array: true,
			description:
				"The list of sets this rate plan applies to. Returns array of strings.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"generated:post:/{account_or_zone}/{account_or_zone_id}/subscriptions">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create Subscription",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "accounts subscriptions create",
				classification: {
					safeFlags: [
						"frequency",
						"rate-plan-externally-managed",
						"rate-plan-is-contract",
						"dry-run",
					],
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
						command: "cf accounts subscriptions create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/${accountOrZone}/${accountOrZoneId}/subscriptions`,
						pathParams: {
							"account-or-zone": String(accountOrZone),
							"account-or-zone-id": String(accountOrZoneId),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										app: {
											install_id: resolveFileToken(
												argv["app-install-id"] as string | undefined,
												"app-install-id",
												"text"
											),
										},
										component_values: parseObjectArray(
											argv["component-values"],
											"component-values"
										),
										frequency: resolveFileToken(
											argv["frequency"] as string | undefined,
											"frequency",
											"text"
										),
										rate_plan: {
											currency: resolveFileToken(
												argv["rate-plan-currency"] as string | undefined,
												"rate-plan-currency",
												"text"
											),
											externally_managed: argv["rate-plan-externally-managed"],
											id: resolveFileToken(
												argv["rate-plan-id"] as string | undefined,
												"rate-plan-id",
												"text"
											),
											is_contract: argv["rate-plan-is-contract"],
											public_name: resolveFileToken(
												argv["rate-plan-public-name"] as string | undefined,
												"rate-plan-public-name",
												"text"
											),
											scope: resolveFileToken(
												argv["rate-plan-scope"] as string | undefined,
												"rate-plan-scope",
												"text"
											),
											sets: argv["rate-plan-sets"],
										},
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
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.accounts.subscriptions.create({
							body: bodyData,
							account_or_zone: accountOrZone,
							account_or_zone_id: accountOrZoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					app: {
						install_id: resolveFileToken(
							argv["app-install-id"] as string | undefined,
							"app-install-id",
							"text"
						),
					},
					component_values: parseObjectArray(
						argv["component-values"],
						"component-values"
					),
					frequency: resolveFileToken(
						argv["frequency"] as string | undefined,
						"frequency",
						"text"
					),
					rate_plan: {
						currency: resolveFileToken(
							argv["rate-plan-currency"] as string | undefined,
							"rate-plan-currency",
							"text"
						),
						externally_managed: argv["rate-plan-externally-managed"],
						id: resolveFileToken(
							argv["rate-plan-id"] as string | undefined,
							"rate-plan-id",
							"text"
						),
						is_contract: argv["rate-plan-is-contract"],
						public_name: resolveFileToken(
							argv["rate-plan-public-name"] as string | undefined,
							"rate-plan-public-name",
							"text"
						),
						scope: resolveFileToken(
							argv["rate-plan-scope"] as string | undefined,
							"rate-plan-scope",
							"text"
						),
						sets: argv["rate-plan-sets"],
					},
				});
				const result = await withProgress(`Creating`, async () =>
					client.accounts.subscriptions.create({
						body: bodyData,
						account_or_zone: accountOrZone,
						account_or_zone_id: accountOrZoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
