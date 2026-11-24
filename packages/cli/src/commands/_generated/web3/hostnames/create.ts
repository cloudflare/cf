import operation from "../../_operations/web3/hostnames/create.js";
/**
 * create command
 * @generated from apis/overlays/web3.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import {
	promptForRequiredEnumField,
	promptForRequiredField,
} from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Create Web3 Hostname",
	usage:
		"$0 web3 hostnames create\n\nCreates a new Web3 hostname for serving decentralized web content.",
	flags: {
		description: {
			kind: "parsed",
			brief: "Specify an optional description of the hostname.",
			optional: true,
			parse: String,
		},
		dnslink: {
			kind: "parsed",
			brief: "Specify the DNSLink value used if the target is ipfs.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief:
				"Specify the hostname that points to the target gateway via CNAME.",
			optional: true,
			parse: String,
		},
		target: {
			kind: "parsed",
			brief: "Specify the target gateway of the hostname.",
			optional: true,
			choices: ["ethereum", "ipfs", "ipfs_universal_path"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "target", "text"),
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
				command: "web3 hostnames create",
				classification: {
					safeFlags: ["target", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"Specify the hostname that points to the target gateway via CNAME."
						);
					}
					if (argv["target"] === undefined) {
						argv["target"] = await promptForRequiredEnumField(
							"target",
							"Specify the target gateway of the hostname.",
							["ethereum", "ipfs", "ipfs_universal_path"] as const
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					formatDryRun({
						command: "cf web3 hostnames create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/web3/hostnames`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										dnslink: resolveFileToken(
											argv["dnslink"] as string | undefined,
											"dnslink",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										target: argv["target"],
									}),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, zone_id: zoneId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					dnslink: resolveFileToken(
						argv["dnslink"] as string | undefined,
						"dnslink",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					target: argv["target"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
