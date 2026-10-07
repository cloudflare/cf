import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/tunnels.ts
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
			"$0 tunnels create\n\nCreates a remotely or locally managed Cloudflare Tunnel in an account. After creation, retrieve its token and run cloudflared to establish the connector connection."
		)
		.option("config-source", {
			type: "string",
			description:
				"Indicates if this is a locally or remotely configured tunnel. If `local`, manage the tunnel using a YAML file on the origin machine. If `cloudflare`, manage the tunnel on the Zero Trust dashboard.",
			choices: ["local", "cloudflare"],
			default: "local",
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

type Request = SdkRequest<"cloudflare-tunnel-create-a-cloudflare-tunnel">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create a Cloudflare Tunnel",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "tunnels create",
				classification: {
					safeFlags: ["config-source", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf tunnels create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cfd_tunnel`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										config_src: resolveFileToken(
											argv["config-source"] as string | undefined,
											"config-source",
											"text"
										),
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
						sensitiveBodyPaths: [["tunnel_secret"]],
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.tunnels.create({
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
						"A user-friendly name for a tunnel."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					config_src: resolveFileToken(
						argv["config-source"] as string | undefined,
						"config-source",
						"text"
					),
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
				const result = await withProgress(`Creating`, async () =>
					client.tunnels.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
