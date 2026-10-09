import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/origin-post-quantum-encryption.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 origin-post-quantum-encryption update\n\nInstructs Cloudflare to use Post-Quantum (PQ) key agreement algorithms when connecting to your origin. Preferred instructs Cloudflare to opportunistically send a Post-Quantum keyshare in the first message to the origin (for fastest connections when the origin supports and prefers PQ), supported means that PQ algorithms are advertised but only used when requested by the origin, and off means that PQ algorithms are not advertised."
		)
		.option("value", {
			type: "string",
			description: "Value of the Origin Post Quantum Encryption Setting.",
			choices: ["preferred", "supported", "off"],
		})
		.coerce("value", (value) => resolveFileToken(value, "value", "text"))
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

type Request =
	SdkRequest<"zone-cache-settings-change-origin-post-quantum-encryption-setting">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update",
	describe: "Change Origin Post-Quantum Encryption setting",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "origin-post-quantum-encryption update",
				classification: {
					safeFlags: ["value", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf origin-post-quantum-encryption update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/cache/origin_post_quantum_encryption`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										value: argv["value"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.originPostQuantumEncryption.update({
							...bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["value"] === undefined) {
					argv["value"] = await promptForRequiredEnumField(
						"value",
						"Value of the Origin Post Quantum Encryption Setting.",
						["preferred", "supported", "off"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					value: argv["value"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.originPostQuantumEncryption.update({
						...bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
