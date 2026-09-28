import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * psk-generate command
 * @generated from apis/overlays/magic-transit.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 magic-transit ipsec-tunnels psk-generate <ipsec-tunnel-id>\n\nGenerates a Pre-Shared Key for a specific IPsec tunnel used in the IKE session. Use `?validate_only=true` as an optional query parameter to only run validation without persisting changes. After a PSK is generated, the PSK is immediately persisted to Cloudflare's edge and cannot be retrieved later. Store the PSK in a safe place."
		)
		.positional("ipsec-tunnel-id", {
			type: "string",
			description: "Identifier",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request =
	SdkRequest<"magic-ipsec-tunnels-generate-pre-shared-key-(-psk)-for-ipsec-tunnels">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "psk-generate <ipsec-tunnel-id>",
	describe: "Generate Pre-Shared Key (PSK) for IPsec tunnels",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-transit ipsec-tunnels psk-generate",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf magic-transit ipsec-tunnels psk-generate",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/ipsec_tunnels/${argv["ipsec-tunnel-id"] == null ? "<ipsec-tunnel-id>" : encodeURIComponent(String(argv["ipsec-tunnel-id"]))}/psk_generate`,
						pathParams: {
							"ipsec-tunnel-id": String(argv["ipsec-tunnel-id"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				const result = await withProgress(`Creating`, async () =>
					client.magicTransit.ipsecTunnels.pskGenerate({
						account_id: accountId,
						ipsec_tunnel_id: argv["ipsec-tunnel-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
