import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/diagnostics.ts
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
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 diagnostics traceroutes create\n\nRun traceroutes from Cloudflare colos."
		)
		.option("colos", {
			type: "string",
			array: true,
			description:
				"If no source colo names specified, all colos will be used. China colos are unavailable for traceroutes.",
		})
		.option("options-max-ttl", { type: "number", description: "Max TTL." })
		.option("options-packet-type", {
			type: "string",
			description: "Type of packet sent.",
			choices: ["icmp", "tcp", "udp", "gre", "gre+icmp"],
		})
		.coerce("options-packet-type", (value: string | undefined) =>
			resolveFileToken(value, "options-packet-type", "text")
		)
		.option("options-packets-per-ttl", {
			type: "number",
			description: "Number of packets sent at each TTL.",
		})
		.option("options-port", {
			type: "number",
			description:
				"For UDP and TCP, specifies the destination port. For ICMP, specifies the initial ICMP sequence value. Default value 0 will choose the best value to use for each protocol.",
		})
		.option("options-wait-time", {
			type: "number",
			description:
				"Set the time (in seconds) to wait for a response to a probe.",
		})
		.option("targets", {
			type: "string",
			array: true,
			description: "The targets field",
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

type Request = SdkRequest<"diagnostics-traceroute">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Traceroute",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "diagnostics traceroutes create",
				classification: {
					safeFlags: ["options-packet-type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
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
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.diagnostics.traceroutes.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["targets"] === undefined) {
					throw new Error(
						"--targets is required (or pass --body with this field set)."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
					client.diagnostics.traceroutes.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
