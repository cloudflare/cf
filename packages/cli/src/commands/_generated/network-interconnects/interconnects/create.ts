import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/network-interconnects.ts
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
			"$0 network-interconnects interconnects create\n\nCreates a new network interconnect for connecting Cloudflare's network to external networks. Interconnects provide dedicated bandwidth and reduced latency for traffic exchange."
		)
		.option("account", { type: "string", description: "The account field" })
		.option("type", { type: "string", description: "The type field" })
		.option("slot-id", { type: "string", description: "The slot_id field" })
		.option("speed", { type: "string", description: "The speed field" })
		.option("bandwidth", {
			type: "string",
			description:
				"Bandwidth structure as visible through the customer-facing API.",
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
		})
		.option("pairing-key", {
			type: "string",
			description: "Pairing key provided by GCP",
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
		.conflicts("slot-id", ["bandwidth", "pairing-key"])
		.conflicts("speed", ["bandwidth", "pairing-key"])
		.conflicts("bandwidth", ["slot-id", "speed"])
		.implies("bandwidth", ["pairing-key"])
		.conflicts("pairing-key", ["slot-id", "speed"])
		.implies("pairing-key", ["bandwidth"]);
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"create_interconnect">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create a new interconnect",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "network-interconnects interconnects create",
				classification: {
					safeFlags: ["bandwidth", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
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
										bandwidth: resolveFileToken(
											argv["bandwidth"] as string | undefined,
											"bandwidth",
											"text"
										),
										pairing_key: resolveFileToken(
											argv["pairing-key"] as string | undefined,
											"pairing-key",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.networkInterconnects.interconnects.create({
							body: bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["account"] === undefined) {
					argv["account"] = await promptForRequiredField(
						"account",
						"The account field"
					);
				}
				if (argv["type"] === undefined) {
					argv["type"] = await promptForRequiredField("type", "The type field");
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
					bandwidth: resolveFileToken(
						argv["bandwidth"] as string | undefined,
						"bandwidth",
						"text"
					),
					pairing_key: resolveFileToken(
						argv["pairing-key"] as string | undefined,
						"pairing-key",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.networkInterconnects.interconnects.create({
						body: bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
