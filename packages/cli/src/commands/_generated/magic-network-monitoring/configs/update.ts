import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
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
 * update command
 * @generated from apis/overlays/magic-network-monitoring.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 magic-network-monitoring configs update\n\nUpdate an existing network monitoring configuration, requires the entire configuration to be updated at once."
		)
		.option("default-sampling", {
			type: "number",
			description:
				"Fallback sampling rate of flow messages being sent in packets per second. This should match the packet sampling rate configured on the router.",
		})
		.option("name", { type: "string", description: "The account name." })
		.option("router-ips", {
			type: "string",
			array: true,
			description: "The router_ips field",
		})
		.option("warp-devices", {
			type: "string",
			description:
				"The warp_devices field. Provide as a JSON array of objects or @path/to/file.json.",
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
	SdkRequest<"magic-network-monitoring-configuration-update-an-entire-account-configuration">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update",
	describe: "Update an entire account configuration",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-network-monitoring configs update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf magic-network-monitoring configs update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/mnm/config`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										default_sampling: argv["default-sampling"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										router_ips: argv["router-ips"],
										warp_devices: parseObjectArray(
											argv["warp-devices"],
											"warp-devices"
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
						client.magicNetworkMonitoring.configs.update({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["default-sampling"] === undefined) {
					throw new Error(
						"--default-sampling is required (or pass --body with this field set)."
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"The account name."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					default_sampling: argv["default-sampling"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					router_ips: argv["router-ips"],
					warp_devices: parseObjectArray(argv["warp-devices"], "warp-devices"),
				});
				const result = await withProgress(`Updating`, async () =>
					client.magicNetworkMonitoring.configs.update({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
