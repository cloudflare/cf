import operation from "../../../_operations/zero-trust/devices/networks/update.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
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
			"$0 zero-trust devices networks update <network-id>\n\nUpdates a configured device managed network."
		)
		.positional("network-id", {
			type: "string",
			description: "API UUID.",
			demandOption: true,
		})
		.option("network-config-sha256", {
			type: "string",
			description:
				"The SHA-256 hash of the TLS certificate presented by the host found at tls_sockaddr. If absent, regular certificate verification (trusted roots, valid timestamp, etc) will be used to validate the certificate.",
		})
		.option("network-config-tls-sockaddr", {
			type: "string",
			description:
				'A network address of the form "host:port" that the WARP client will use to detect the presence of a TLS host.',
		})
		.option("name", {
			type: "string",
			description:
				"The name of the device managed network. This name must be unique.",
		})
		.option("type", {
			type: "string",
			description: "The type of device managed network.",
			choices: ["tls"],
		})
		.coerce("type", (value) => resolveFileToken(value, "type", "text"))
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		})
		.check((argv) => {
			const groupSet = [
				"network-config-sha256",
				"network-config-tls-sockaddr",
			].some((k) => argv[k] !== undefined);
			if (groupSet) {
				const missing = ["network-config-tls-sockaddr"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --config-* flag is set`
					);
				}
			}
			return true;
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <network-id>",
	describe: "Update a device managed network",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust devices networks update",
				classification: {
					safeFlags: ["type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust devices networks update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/devices/networks/${argv["network-id"] == null ? "<network-id>" : encodeURIComponent(String(argv["network-id"]))}`,
						pathParams: { "network-id": String(argv["network-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										config: {
											sha256: resolveFileToken(
												argv["network-config-sha256"] as string | undefined,
												"network-config-sha256",
												"text"
											),
											tls_sockaddr: resolveFileToken(
												argv["network-config-tls-sockaddr"] as
													| string
													| undefined,
												"network-config-tls-sockaddr",
												"text"
											),
										},
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										type: argv["type"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							network_id: argv["network-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					config: {
						sha256: resolveFileToken(
							argv["network-config-sha256"] as string | undefined,
							"network-config-sha256",
							"text"
						),
						tls_sockaddr: resolveFileToken(
							argv["network-config-tls-sockaddr"] as string | undefined,
							"network-config-tls-sockaddr",
							"text"
						),
					},
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					type: argv["type"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						network_id: argv["network-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
