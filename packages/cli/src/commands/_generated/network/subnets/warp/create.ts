import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/network.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 network subnets warp create\n\nCreate a WARP IP assignment subnet. Currently, only IPv4 subnets can be created. **Network constraints:** - The network must be within one of the following private IP ranges: - `10.0.0.0/8` (RFC 1918) - `172.16.0.0/12` (RFC 1918) - `192.168.0.0/16` (RFC 1918) - `100.64.0.0/10` (RFC 6598 - CGNAT) - The subnet must have a prefix length of `/24` or larger (e.g., `/16`, `/20`, `/24` are valid; `/25`, `/28` are not)"
		)
		.option("comment", {
			type: "string",
			description: "An optional description of the subnet.",
			default: "",
		})
		.option("is-default-network", {
			type: "boolean",
			description:
				"If `true`, this is the default subnet for the account. There can only be one default subnet per account.",
			default: false,
		})
		.option("name", {
			type: "string",
			description: "A user-friendly name for the subnet.",
		})
		.option("network", {
			type: "string",
			description:
				"The private IPv4 or IPv6 range defining the subnet, in CIDR notation.",
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

type Request = SdkRequest<"zero-trust-networks-subnet-create-warp">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create WARP IP subnet",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "network subnets warp create",
				classification: {
					safeFlags: ["is-default-network", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf network subnets warp create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/zerotrust/subnets/warp`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										comment: resolveFileToken(
											argv["comment"] as string | undefined,
											"comment",
											"text"
										),
										is_default_network: argv["is-default-network"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										network: resolveFileToken(
											argv["network"] as string | undefined,
											"network",
											"text"
										),
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
						client.network.subnets.warp.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"A user-friendly name for the subnet."
					);
				}
				if (argv["network"] === undefined) {
					argv["network"] = await promptForRequiredField(
						"network",
						"The private IPv4 or IPv6 range defining the subnet, in CIDR notation."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					comment: resolveFileToken(
						argv["comment"] as string | undefined,
						"comment",
						"text"
					),
					is_default_network: argv["is-default-network"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					network: resolveFileToken(
						argv["network"] as string | undefined,
						"network",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.network.subnets.warp.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
