import operation from "../../_operations/network-interconnects/interconnects/create.js";
/**
 * create command
 * @generated from apis/overlays/network-interconnects.ts
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
	describe: "Create a new interconnect",
	usage:
		"$0 network-interconnects interconnects create\n\nCreates a new network interconnect for connecting Cloudflare's network to external networks. Interconnects provide dedicated bandwidth and reduced latency for traffic exchange.",
	flags: {
		account: {
			kind: "parsed",
			brief: "The account field",
			optional: true,
			parse: String,
		},
		type: {
			kind: "parsed",
			brief: "The type field",
			optional: true,
			parse: String,
		},
		"slot-id": {
			kind: "parsed",
			brief: "The slot_id field",
			optional: true,
			parse: String,
		},
		speed: {
			kind: "parsed",
			brief: "The speed field",
			optional: true,
			parse: String,
		},
		bandwidth: {
			kind: "parsed",
			brief: "Bandwidth structure as visible through the customer-facing API.",
			optional: true,
			choices: [
				"50M",
				"100M",
				"200M",
				"300M",
				"400M",
				"500M",
				"1G",
				"2G",
				"5G",
				"10G",
				"20G",
				"50G",
			],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "bandwidth", "text"),
		},
		"pairing-key": {
			kind: "parsed",
			brief: "Pairing key provided by GCP",
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
	rules(rules) {
		rules.conflicts("slot-id", ["bandwidth", "pairing-key"]);
		rules.conflicts("speed", ["bandwidth", "pairing-key"]);
		rules.implies("speed", ["slot-id"]);
		rules.conflicts("bandwidth", ["slot-id", "speed"]);
		rules.implies("bandwidth", ["pairing-key"]);
		rules.conflicts("pairing-key", ["slot-id", "speed"]);
		rules.implies("pairing-key", ["bandwidth"]);
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "network-interconnects interconnects create",
				classification: {
					safeFlags: ["bandwidth", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["account"] === undefined) {
						argv["account"] = await promptForRequiredField(
							"account",
							"The account field"
						);
					}
					if (argv["type"] === undefined) {
						argv["type"] = await promptForRequiredField(
							"type",
							"The type field"
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf network-interconnects interconnects create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cni/interconnects`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										account: resolveFileToken(
											argv["account"] as string | undefined,
											"account",
											"text"
										),
										type: resolveFileToken(
											argv["type"] as string | undefined,
											"type",
											"text"
										),
										slot_id: resolveFileToken(
											argv["slot-id"] as string | undefined,
											"slot-id",
											"text"
										),
										speed: resolveFileToken(
											argv["speed"] as string | undefined,
											"speed",
											"text"
										),
										bandwidth: argv["bandwidth"],
										pairing_key: resolveFileToken(
											argv["pairing-key"] as string | undefined,
											"pairing-key",
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
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					account: resolveFileToken(
						argv["account"] as string | undefined,
						"account",
						"text"
					),
					type: resolveFileToken(
						argv["type"] as string | undefined,
						"type",
						"text"
					),
					slot_id: resolveFileToken(
						argv["slot-id"] as string | undefined,
						"slot-id",
						"text"
					),
					speed: resolveFileToken(
						argv["speed"] as string | undefined,
						"speed",
						"text"
					),
					bandwidth: argv["bandwidth"],
					pairing_key: resolveFileToken(
						argv["pairing-key"] as string | undefined,
						"pairing-key",
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
