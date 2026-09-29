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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/magic-transit.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 magic-transit sites wans create <site-id>\n\nCreates a new Site WAN."
		)
		.positional("site-id", {
			type: "string",
			description: "Identifier",
			demandOption: true,
		})
		.option("health-check-rate", {
			type: "string",
			description:
				"Magic WAN health check rate for tunnels created on this link. The default value is `mid`.",
			choices: ["low", "mid", "high"],
			default: "mid",
		})
		.option("load-balance-inner-flows", {
			type: "boolean",
			description: "The load_balance_inner_flows field",
			default: true,
		})
		.option("name", { type: "string", description: "The name field" })
		.option("physport", { type: "number", description: "The physport field" })
		.option("priority", { type: "number", description: "The priority field" })
		.option("static-addressing-address", {
			type: "string",
			description: "A valid CIDR notation representing an IP range.",
		})
		.option("static-addressing-gateway-address", {
			type: "string",
			description: "A valid IPv4 address.",
		})
		.option("static-addressing-secondary-address", {
			type: "string",
			description: "A valid CIDR notation representing an IP range.",
		})
		.option("vlan-tag", {
			type: "number",
			description: "VLAN ID. Use zero for untagged.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.check((argv) => {
			const groupSet = [
				"static-addressing-address",
				"static-addressing-gateway-address",
				"static-addressing-secondary-address",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = [
					"static-addressing-address",
					"static-addressing-gateway-address",
				].filter((k) => argv[k] === undefined);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --static_addressing-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"magic-site-wans-create-wan">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <site-id>",
	describe: "Create a new Site WAN",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-transit sites wans create",
				classification: {
					safeFlags: [
						"health-check-rate",
						"load-balance-inner-flows",
						"dry-run",
					],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf magic-transit sites wans create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/sites/${argv["site-id"] == null ? "<site-id>" : encodeURIComponent(String(argv["site-id"]))}/wans`,
						pathParams: { "site-id": String(argv["site-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										health_check_rate: resolveFileToken(
											argv["health-check-rate"] as string | undefined,
											"health-check-rate",
											"text"
										),
										load_balance_inner_flows: argv["load-balance-inner-flows"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										physport: argv["physport"],
										priority: argv["priority"],
										static_addressing: {
											address: resolveFileToken(
												argv["static-addressing-address"] as string | undefined,
												"static-addressing-address",
												"text"
											),
											gateway_address: resolveFileToken(
												argv["static-addressing-gateway-address"] as
													| string
													| undefined,
												"static-addressing-gateway-address",
												"text"
											),
											secondary_address: resolveFileToken(
												argv["static-addressing-secondary-address"] as
													| string
													| undefined,
												"static-addressing-secondary-address",
												"text"
											),
										},
										vlan_tag: argv["vlan-tag"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.magicTransit.sites.wans.create({
							...bodyData,
							account_id: accountId,
							site_id: argv["site-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["physport"] === undefined) {
					throw new Error(
						"--physport is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					health_check_rate: resolveFileToken(
						argv["health-check-rate"] as string | undefined,
						"health-check-rate",
						"text"
					),
					load_balance_inner_flows: argv["load-balance-inner-flows"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					physport: argv["physport"],
					priority: argv["priority"],
					static_addressing: {
						address: resolveFileToken(
							argv["static-addressing-address"] as string | undefined,
							"static-addressing-address",
							"text"
						),
						gateway_address: resolveFileToken(
							argv["static-addressing-gateway-address"] as string | undefined,
							"static-addressing-gateway-address",
							"text"
						),
						secondary_address: resolveFileToken(
							argv["static-addressing-secondary-address"] as string | undefined,
							"static-addressing-secondary-address",
							"text"
						),
					},
					vlan_tag: argv["vlan-tag"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.magicTransit.sites.wans.create({
						...bodyData,
						account_id: accountId,
						site_id: argv["site-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
