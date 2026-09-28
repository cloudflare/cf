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
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust access targets create\n\nCreates a new infrastructure access target in the account."
		)
		.option("hostname", {
			type: "string",
			description:
				"A non-unique field that refers to a target. Case insensitive, maximum\nlength of 255 characters, supports the use of special characters dash\nand period, does not support spaces, and must start and end with an\nalphanumeric character.",
		})
		.option("ip-ipv4-ip-addr", {
			type: "string",
			description: "IP address of the target",
		})
		.option("ip-ipv4-virtual-network-id", {
			type: "string",
			description:
				"(optional) Private virtual network identifier for the target. If omitted, the default virtual network ID will be used.",
		})
		.option("ip-ipv6-ip-addr", {
			type: "string",
			description: "IP address of the target",
		})
		.option("ip-ipv6-virtual-network-id", {
			type: "string",
			description:
				"(optional) Private virtual network identifier for the target. If omitted, the default virtual network ID will be used.",
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

type Request = SdkRequest<"infra-targets-post">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create new target",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust access targets create",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust access targets create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/infrastructure/targets`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										hostname: resolveFileToken(
											argv["hostname"] as string | undefined,
											"hostname",
											"text"
										),
										ip: {
											ipv4: {
												ip_addr: resolveFileToken(
													argv["ip-ipv4-ip-addr"] as string | undefined,
													"ip-ipv4-ip-addr",
													"text"
												),
												virtual_network_id: resolveFileToken(
													argv["ip-ipv4-virtual-network-id"] as
														| string
														| undefined,
													"ip-ipv4-virtual-network-id",
													"text"
												),
											},
											ipv6: {
												ip_addr: resolveFileToken(
													argv["ip-ipv6-ip-addr"] as string | undefined,
													"ip-ipv6-ip-addr",
													"text"
												),
												virtual_network_id: resolveFileToken(
													argv["ip-ipv6-virtual-network-id"] as
														| string
														| undefined,
													"ip-ipv6-virtual-network-id",
													"text"
												),
											},
										},
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
						client.zeroTrust.access.targets.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["hostname"] === undefined) {
					argv["hostname"] = await promptForRequiredField(
						"hostname",
						"A non-unique field that refers to a target. Case insensitive, maximum length of 255 characters, supports the use of special characters dash and period, does not support spaces, and must start and end with an alphanumeric character."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					hostname: resolveFileToken(
						argv["hostname"] as string | undefined,
						"hostname",
						"text"
					),
					ip: {
						ipv4: {
							ip_addr: resolveFileToken(
								argv["ip-ipv4-ip-addr"] as string | undefined,
								"ip-ipv4-ip-addr",
								"text"
							),
							virtual_network_id: resolveFileToken(
								argv["ip-ipv4-virtual-network-id"] as string | undefined,
								"ip-ipv4-virtual-network-id",
								"text"
							),
						},
						ipv6: {
							ip_addr: resolveFileToken(
								argv["ip-ipv6-ip-addr"] as string | undefined,
								"ip-ipv6-ip-addr",
								"text"
							),
							virtual_network_id: resolveFileToken(
								argv["ip-ipv6-virtual-network-id"] as string | undefined,
								"ip-ipv6-virtual-network-id",
								"text"
							),
						},
					},
				});
				const result = await withProgress(`Creating`, async () =>
					client.zeroTrust.access.targets.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
