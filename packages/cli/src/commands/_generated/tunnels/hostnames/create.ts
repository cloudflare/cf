import operation from "../../_operations/tunnels/hostnames/create.js";
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
	command: "create <tunnel-id>",
	describe: "Create a tunnel hostname",
	usage:
		"$0 tunnels hostnames create <tunnel-id>\n\nAssigns a hostname to a tunnel. If the tunnel has no active hostnames, the new hostname is always canonical.",
	flags: {
		canonical: {
			kind: "boolean",
			brief:
				"Set to `true` to make the new hostname canonical, replacing any existing canonical hostname.\nIf `false` or omitted, the new hostname is canonical only if the tunnel has no active hostnames.\n",
			optional: true,
		},
		hostname: {
			kind: "parsed",
			brief:
				"A single DNS label assigned to the tunnel. The value is normalized to lowercase and may contain only letters, digits, and internal hyphens.",
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
	operands: [
		{ placeholder: "tunnel-id", brief: "UUID of the tunnel.", parse: String },
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "tunnels hostnames create",
				classification: {
					safeFlags: ["canonical", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["hostname"] === undefined) {
						argv["hostname"] = await promptForRequiredField(
							"hostname",
							"A single DNS label assigned to the tunnel. The value is normalized to lowercase and may contain only letters, digits, and internal hyphens."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf tunnels hostnames create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/tunnels/${argv["tunnel-id"] == null ? "<tunnel-id>" : encodeURIComponent(String(argv["tunnel-id"]))}/hostnames`,
						pathParams: { "tunnel-id": String(argv["tunnel-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										canonical: argv["canonical"],
										hostname: resolveFileToken(
											argv["hostname"] as string | undefined,
											"hostname",
											"text"
										),
									}),
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
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							tunnel_id: argv["tunnel-id"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					canonical: argv["canonical"],
					hostname: resolveFileToken(
						argv["hostname"] as string | undefined,
						"hostname",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						tunnel_id: argv["tunnel-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
