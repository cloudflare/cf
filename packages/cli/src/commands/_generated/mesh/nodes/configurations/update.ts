import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/mesh.ts
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
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 mesh nodes configurations update <tunnel-id>\n\nAdds or updates the high-availability configuration for a Mesh node."
		)
		.positional("tunnel-id", {
			type: "string",
			description: "UUID of the tunnel.",
			demandOption: true,
		})
		.option("config-fnr-id", {
			type: "string",
			description:
				"Floating Network Resource ID — the secondary ENI that is moved between nodes on failover.",
		})
		.option("ha-mode", {
			type: "string",
			description:
				"High-availability mode for the Mesh node. `none` means HA is enabled but no provider is configured yet (newly created nodes default to this). `disabled` means HA is explicitly turned off. `aws` uses AWS ENI move for failover. `local` uses virtual IPs (VIPs) on the local interface.",
			choices: ["none", "disabled", "aws", "local"],
		})
		.coerce("ha-mode", (value) => resolveFileToken(value, "ha-mode", "text"))
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
	SdkRequest<"cloudflare-tunnel-configuration-update-warp-connector-configuration">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <tunnel-id>",
	describe: "Update Mesh node HA configuration",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "mesh nodes configurations update",
				classification: {
					safeFlags: ["ha-mode", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf mesh nodes configurations update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/warp_connector/${argv["tunnel-id"] == null ? "<tunnel-id>" : encodeURIComponent(String(argv["tunnel-id"]))}/configurations`,
						pathParams: { "tunnel-id": String(argv["tunnel-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										config: {
											fnr_id: resolveFileToken(
												argv["config-fnr-id"] as string | undefined,
												"config-fnr-id",
												"text"
											),
										},
										ha_mode: argv["ha-mode"],
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
						client.mesh.nodes.configurations.update({
							...bodyData,
							account_id: accountId,
							tunnel_id: argv["tunnel-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["ha-mode"] === undefined) {
					argv["ha-mode"] = await promptForRequiredEnumField(
						"ha-mode",
						"High-availability mode for the Mesh node. \`none\` means HA is enabled but no provider is configured yet (newly created nodes default to this). \`disabled\` means HA is explicitly turned off. \`aws\` uses AWS ENI move for failover. \`local\` uses virtual IPs (VIPs) on the local interface.",
						["none", "disabled", "aws", "local"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					config: {
						fnr_id: resolveFileToken(
							argv["config-fnr-id"] as string | undefined,
							"config-fnr-id",
							"text"
						),
					},
					ha_mode: argv["ha-mode"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.mesh.nodes.configurations.update({
						...bodyData,
						account_id: accountId,
						tunnel_id: argv["tunnel-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
