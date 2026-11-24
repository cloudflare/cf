import operation from "../../_operations/diagnostics/traceroutes/create.js";
/**
 * create command
 * @generated from apis/overlays/diagnostics.ts
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Traceroute",
	usage:
		"$0 diagnostics traceroutes create\n\nRun traceroutes from Cloudflare colos.",
	flags: {
		colos: {
			kind: "parsed",
			brief:
				"If no source colo names specified, all colos will be used. China colos are unavailable for traceroutes.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"options-max-ttl": {
			kind: "parsed",
			brief: "Max TTL.",
			optional: true,
			parse: Number,
		},
		"options-packet-type": {
			kind: "parsed",
			brief: "Type of packet sent.",
			optional: true,
			choices: ["icmp", "tcp", "udp", "gre", "gre+icmp"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "options-packet-type", "text"),
		},
		"options-packets-per-ttl": {
			kind: "parsed",
			brief: "Number of packets sent at each TTL.",
			optional: true,
			parse: Number,
		},
		"options-port": {
			kind: "parsed",
			brief:
				"For UDP and TCP, specifies the destination port. For ICMP, specifies the initial ICMP sequence value. Default value 0 will choose the best value to use for each protocol.",
			optional: true,
			parse: Number,
		},
		"options-wait-time": {
			kind: "parsed",
			brief: "Set the time (in seconds) to wait for a response to a probe.",
			optional: true,
			parse: Number,
		},
		targets: {
			kind: "parsed",
			brief: "The targets field",
			variadic: true,
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
				command: "diagnostics traceroutes create",
				classification: {
					safeFlags: ["options-packet-type", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["targets"] === undefined) {
						throw new Error(
							"--targets is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf diagnostics traceroutes create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/diagnostics/traceroute`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										colos: argv["colos"],
										options: {
											max_ttl: argv["options-max-ttl"],
											packet_type: argv["options-packet-type"],
											packets_per_ttl: argv["options-packets-per-ttl"],
											port: argv["options-port"],
											wait_time: argv["options-wait-time"],
										},
										targets: argv["targets"],
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
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					colos: argv["colos"],
					options: {
						max_ttl: argv["options-max-ttl"],
						packet_type: argv["options-packet-type"],
						packets_per_ttl: argv["options-packets-per-ttl"],
						port: argv["options-port"],
						wait_time: argv["options-wait-time"],
					},
					targets: argv["targets"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
