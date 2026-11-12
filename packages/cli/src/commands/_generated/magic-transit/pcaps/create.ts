import operation from "../../_operations/magic-transit/pcaps/create.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * create command
 * @generated from apis/overlays/magic-transit.ts
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
			"$0 magic-transit pcaps create\n\nCreate new PCAP request for account."
		)
		.option("filter-v1-destination-address", {
			type: "string",
			description: "The destination IP address of the packet.",
		})
		.option("filter-v1-destination-port", {
			type: "number",
			description: "The destination port of the packet.",
		})
		.option("filter-v1-protocol", {
			type: "number",
			description: "The protocol number of the packet.",
		})
		.option("filter-v1-source-address", {
			type: "string",
			description: "The source IP address of the packet.",
		})
		.option("filter-v1-source-port", {
			type: "number",
			description: "The source port of the packet.",
		})
		.option("offset-time", {
			type: "string",
			description:
				"The RFC 3339 offset timestamp from which to query backwards for packets. Must be within the last 24h. When this field is empty, defaults to time of request.",
		})
		.option("packet-limit", {
			type: "number",
			description: "The limit of packets contained in a packet capture.",
		})
		.option("system", {
			type: "string",
			description: "The system used to collect packet captures.",
			choices: ["magic-transit"],
		})
		.coerce("system", (value) => resolveFileToken(value, "system", "text"))
		.option("time-limit", {
			type: "number",
			description: "The packet capture duration in seconds.",
		})
		.option("type", {
			type: "string",
			description:
				"The type of packet capture. `Simple` captures sampled packets, and `full` captures entire payloads and non-sampled packets.",
			choices: ["simple", "full"],
		})
		.coerce("type", (value) => resolveFileToken(value, "type", "text"))
		.option("byte-limit", {
			type: "number",
			description:
				"The maximum number of bytes to capture. This field only applies to `full` packet captures.",
		})
		.option("colo-name", {
			type: "string",
			description:
				"The name of the data center used for the packet capture. This can be a specific colo (ord02) or a multi-colo name (ORD). This field only applies to `full` packet captures.",
		})
		.option("destination-conf", {
			type: "string",
			description:
				"The full URI for the bucket. This field only applies to `full` packet captures.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.conflicts("offset-time", ["byte-limit", "colo-name", "destination-conf"])
		.implies("offset-time", ["packet-limit"])
		.conflicts("byte-limit", ["offset-time"])
		.implies("byte-limit", ["colo-name", "destination-conf"])
		.conflicts("colo-name", ["offset-time"])
		.implies("colo-name", ["destination-conf"])
		.conflicts("destination-conf", ["offset-time"])
		.implies("destination-conf", ["colo-name"]);
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create PCAP request",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-transit pcaps create",
				classification: {
					safeFlags: ["system", "type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf magic-transit pcaps create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/pcaps`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										filter_v1: {
											destination_address: resolveFileToken(
												argv["filter-v1-destination-address"] as
													| string
													| undefined,
												"filter-v1-destination-address",
												"text"
											),
											destination_port: argv["filter-v1-destination-port"],
											protocol: argv["filter-v1-protocol"],
											source_address: resolveFileToken(
												argv["filter-v1-source-address"] as string | undefined,
												"filter-v1-source-address",
												"text"
											),
											source_port: argv["filter-v1-source-port"],
										},
										offset_time: resolveFileToken(
											argv["offset-time"] as string | undefined,
											"offset-time",
											"text"
										),
										packet_limit: argv["packet-limit"],
										system: argv["system"],
										time_limit: argv["time-limit"],
										type: argv["type"],
										byte_limit: argv["byte-limit"],
										colo_name: resolveFileToken(
											argv["colo-name"] as string | undefined,
											"colo-name",
											"text"
										),
										destination_conf: resolveFileToken(
											argv["destination-conf"] as string | undefined,
											"destination-conf",
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
				if (argv["system"] === undefined) {
					argv["system"] = await promptForRequiredEnumField(
						"system",
						"The system used to collect packet captures.",
						["magic-transit"] as const
					);
				}
				if (argv["time-limit"] === undefined) {
					throw new Error(
						"--time-limit is required (or pass --body with this field set)."
					);
				}
				if (argv["type"] === undefined) {
					argv["type"] = await promptForRequiredEnumField(
						"type",
						"The type of packet capture. \`Simple\` captures sampled packets, and \`full\` captures entire payloads and non-sampled packets.",
						["simple", "full"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					filter_v1: {
						destination_address: resolveFileToken(
							argv["filter-v1-destination-address"] as string | undefined,
							"filter-v1-destination-address",
							"text"
						),
						destination_port: argv["filter-v1-destination-port"],
						protocol: argv["filter-v1-protocol"],
						source_address: resolveFileToken(
							argv["filter-v1-source-address"] as string | undefined,
							"filter-v1-source-address",
							"text"
						),
						source_port: argv["filter-v1-source-port"],
					},
					offset_time: resolveFileToken(
						argv["offset-time"] as string | undefined,
						"offset-time",
						"text"
					),
					packet_limit: argv["packet-limit"],
					system: argv["system"],
					time_limit: argv["time-limit"],
					type: argv["type"],
					byte_limit: argv["byte-limit"],
					colo_name: resolveFileToken(
						argv["colo-name"] as string | undefined,
						"colo-name",
						"text"
					),
					destination_conf: resolveFileToken(
						argv["destination-conf"] as string | undefined,
						"destination-conf",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
