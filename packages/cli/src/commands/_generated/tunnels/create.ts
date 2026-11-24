import operation from "../_operations/tunnels/create.js";
/**
 * create command
 * @generated from apis/overlays/tunnels.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "create",
	describe: "Create a Cloudflare Tunnel",
	usage:
		"$0 tunnels create\n\nCreates a remotely or locally managed Cloudflare Tunnel in an account. After creation, retrieve its token and run cloudflared to establish the connector connection.",
	flags: {
		"config-source": {
			kind: "parsed",
			brief:
				"Indicates if this is a locally or remotely configured tunnel. If `local`, manage the tunnel using a YAML file on the origin machine. If `cloudflare`, manage the tunnel on the Zero Trust dashboard.",
			optional: true,
			choices: ["local", "cloudflare"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "config-source", "text"),
		},
		name: {
			kind: "parsed",
			brief: "A user-friendly name for a tunnel.",
			optional: true,
			parse: String,
		},
		"tunnel-secret": {
			kind: "parsed",
			brief:
				"Sets the password required to run a locally-managed tunnel. Must be at least 32 bytes and encoded as a base64 string.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "tunnels create",
				classification: {
					safeFlags: ["config-source", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"A user-friendly name for a tunnel."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
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
										config_src: argv["config-source"],
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
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					config_src: argv["config-source"],
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
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
