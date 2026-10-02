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
 * edit command
 * @generated from apis/overlays/tunnels.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 tunnels edit <tunnel-id>\n\nUpdates the name or secret of an existing Cloudflare Tunnel."
		)
		.positional("tunnel-id", {
			type: "string",
			description: "UUID of the tunnel.",
			demandOption: true,
		})
		.option("name", {
			type: "string",
			description: "A user-friendly name for a tunnel.",
		})
		.option("tunnel-secret", {
			type: "string",
			description:
				"Sets the password required to run a locally-managed tunnel. Must be at least 32 bytes and encoded as a base64 string.",
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

type Request = SdkRequest<"cloudflare-tunnel-update-a-cloudflare-tunnel">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "edit <tunnel-id>",
	describe: "Update a Cloudflare Tunnel",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "tunnels edit",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun(
						{
							command: "cf tunnels edit",
							method: "PATCH",
							url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cfd_tunnel/${argv["tunnel-id"] == null ? "<tunnel-id>" : encodeURIComponent(String(argv["tunnel-id"]))}`,
							pathParams: { "tunnel-id": String(argv["tunnel-id"] ?? "") },
							bodyKind: "json",
							body:
								argv.body !== undefined
									? parseBody(argv.body)
									: compactBody({
											name: resolveFileToken(
												argv["name"] as string | undefined,
												"name",
												"text"
											),
											tunnel_secret: resolveFileToken(
												argv["tunnel-secret"] as string | undefined,
												"tunnel-secret",
												"text"
											),
										}),
						},
						{ sensitiveBodyPaths: [["tunnel_secret"]] }
					);
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.tunnels.edit({
							...bodyData,
							account_id: accountId,
							tunnel_id: argv["tunnel-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					tunnel_secret: resolveFileToken(
						argv["tunnel-secret"] as string | undefined,
						"tunnel-secret",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.tunnels.edit({
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
