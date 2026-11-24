import operation from "../../_operations/ssl/keyless-certificates/create.js";
/**
 * create command
 * @generated from apis/overlays/ssl.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Create Keyless SSL Configuration",
	usage:
		"$0 ssl keyless-certificates create\n\nCreates a Keyless SSL configuration that allows SSL/TLS termination without exposing private keys to Cloudflare. Keys remain on your infrastructure.",
	flags: {
		"bundle-method": {
			kind: "parsed",
			brief:
				"A ubiquitous bundle has the highest probability of being verified everywhere, even by clients using outdated or unusual trust stores. An optimal bundle uses the shortest chain and newest intermediates. And the force bundle verifies the chain, but does not otherwise modify it.",
			default: "ubiquitous",
			choices: ["ubiquitous", "optimal", "force"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "bundle-method", "text"),
		},
		certificate: {
			kind: "parsed",
			brief:
				"The zone's SSL certificate or SSL certificate and intermediate(s).",
			optional: true,
			parse: String,
		},
		host: {
			kind: "parsed",
			brief: "The keyless SSL name.",
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "The keyless SSL name.",
			optional: true,
			parse: String,
		},
		port: {
			kind: "parsed",
			brief:
				"The keyless SSL port used to communicate between Cloudflare and the client's Keyless SSL server.",
			default: "24008",
			parse: Number,
		},
		"tunnel-private-ip": {
			kind: "parsed",
			brief: "Private IP of the Key Server Host.",
			optional: true,
			parse: String,
		},
		"tunnel-vnet-id": {
			kind: "parsed",
			brief: "Cloudflare Tunnel Virtual Network ID.",
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
		rules.check((argv) => {
			const groupSet = ["tunnel-private-ip", "tunnel-vnet-id"].some(
				(k) => argv[k] !== undefined
			);
			if (!argv.body && groupSet) {
				const missing = ["tunnel-private-ip", "tunnel-vnet-id"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when any --tunnel-* flag is set`
					);
				}
			}
			return true;
		});
	},
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "ssl keyless-certificates create",
				classification: {
					safeFlags: ["bundle-method", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["certificate"] === undefined) {
						argv["certificate"] = await promptForRequiredField(
							"certificate",
							"The zone's SSL certificate or SSL certificate and intermediate(s)."
						);
					}
					if (argv["host"] === undefined) {
						argv["host"] = await promptForRequiredField(
							"host",
							"The keyless SSL name."
						);
					}
					if (argv["port"] === undefined) {
						throw new Error(
							"--port is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					formatDryRun({
						command: "cf ssl keyless-certificates create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/keyless_certificates`,
						pathParams: {
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										bundle_method: argv["bundle-method"],
										certificate: resolveFileToken(
											argv["certificate"] as string | undefined,
											"certificate",
											"text"
										),
										host: resolveFileToken(
											argv["host"] as string | undefined,
											"host",
											"text"
										),
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										port: argv["port"],
										tunnel: {
											private_ip: resolveFileToken(
												argv["tunnel-private-ip"] as string | undefined,
												"tunnel-private-ip",
												"text"
											),
											vnet_id: resolveFileToken(
												argv["tunnel-vnet-id"] as string | undefined,
												"tunnel-vnet-id",
												"text"
											),
										},
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
					bundle_method: argv["bundle-method"],
					certificate: resolveFileToken(
						argv["certificate"] as string | undefined,
						"certificate",
						"text"
					),
					host: resolveFileToken(
						argv["host"] as string | undefined,
						"host",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					port: argv["port"],
					tunnel: {
						private_ip: resolveFileToken(
							argv["tunnel-private-ip"] as string | undefined,
							"tunnel-private-ip",
							"text"
						),
						vnet_id: resolveFileToken(
							argv["tunnel-vnet-id"] as string | undefined,
							"tunnel-vnet-id",
							"text"
						),
					},
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, zone_id: zoneId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
