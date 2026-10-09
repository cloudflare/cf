import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/web3.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage("$0 web3 hostnames create\n\nCreate Web3 Hostname")
		.option("description", {
			type: "string",
			description: "Specify an optional description of the hostname.",
		})
		.option("dnslink", {
			type: "string",
			description: "Specify the DNSLink value used if the target is ipfs.",
		})
		.option("name", {
			type: "string",
			description:
				"Specify the hostname that points to the target gateway via CNAME.",
		})
		.option("target", {
			type: "string",
			description: "Specify the target gateway of the hostname.",
			choices: ["ethereum", "ipfs", "ipfs_universal_path"],
		})
		.coerce("target", (value) => resolveFileToken(value, "target", "text"))
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

type Request = SdkRequest<"web3-hostname-create-web3-hostname">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create Web3 Hostname",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "web3 hostnames create",
				classification: {
					safeFlags: ["target", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
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
				const client = await createCommandClient(argv);
				const zoneId = await getZoneId({ zone: argv.zone }, client, {
					quiet: argv.quiet,
				});
				argv.zoneId = zoneId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.web3.hostnames.create({
							...bodyData,
							zone_id: zoneId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
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

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
					client.web3.hostnames.create({
						...bodyData,
						zone_id: zoneId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
