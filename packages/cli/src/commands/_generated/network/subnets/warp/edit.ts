import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * edit command
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 network subnets warp edit <subnet-id>\n\nUpdates a WARP IP assignment subnet. **Update constraints:** - The `network` field cannot be modified for WARP subnets. Only `name`, `comment`, and `is_default_network` can be updated. - IPv6 subnets cannot be updated"
		)
		.positional("subnet-id", {
			type: "string",
			description: "The UUID of the subnet.",
			demandOption: true,
		})
		.option("comment", {
			type: "string",
			description: "An optional description of the subnet.",
		})
		.option("is-default-network", {
			type: "boolean",
			description:
				"If `true`, this is the default subnet for the account. There can only be one default subnet per account.",
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

type Request = SdkRequest<"zero-trust-networks-subnet-update-warp">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <subnet-id>",
	describe: "Update WARP IP subnet",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "network subnets warp edit",
				classification: {
					safeFlags: ["is-default-network", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf network subnets warp edit",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/zerotrust/subnets/warp/${argv["subnet-id"] == null ? "<subnet-id>" : encodeURIComponent(String(argv["subnet-id"]))}`,
						pathParams: { "subnet-id": String(argv["subnet-id"] ?? "") },
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
					const result = await withProgress(`Updating`, async () =>
						client.network.subnets.warp.edit({
							...bodyData,
							account_id: accountId,
							subnet_id: argv["subnet-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
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
				const result = await withProgress(`Updating`, async () =>
					client.network.subnets.warp.edit({
						...bodyData,
						account_id: accountId,
						subnet_id: argv["subnet-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
