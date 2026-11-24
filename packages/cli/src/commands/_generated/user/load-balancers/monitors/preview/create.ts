import operation from "../../../../_operations/user/load-balancers/monitors/preview/create.js";
/**
 * create command
 * @generated from apis/overlays/user.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient } from "#lib/auth.js";
import { compactBody, parseBody, parseJsonMap } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create <monitor-id>",
	describe: "Preview Monitor",
	usage:
		"$0 user load-balancers monitors preview create <monitor-id>\n\nPreview pools using the specified monitor with provided monitor details. The returned preview_id can be used in the preview endpoint to retrieve the results.",
	flags: {
		"allow-insecure": {
			kind: "boolean",
			brief:
				"Do not validate the certificate when monitor use HTTPS. This parameter is currently only valid for HTTP and HTTPS monitors.",
			default: false,
		},
		"consecutive-down": {
			kind: "parsed",
			brief:
				"To be marked unhealthy the monitored origin must fail this healthcheck N consecutive times.",
			optional: true,
			parse: Number,
		},
		"consecutive-up": {
			kind: "parsed",
			brief:
				"To be marked healthy the monitored origin must pass this healthcheck N consecutive times.",
			optional: true,
			parse: Number,
		},
		description: {
			kind: "parsed",
			brief: "Object description.",
			default: "",
			parse: String,
		},
		"expected-body": {
			kind: "parsed",
			brief:
				"A case-insensitive sub-string to look for in the response body. If this string is not found, the origin will be marked as unhealthy. This parameter is only valid for HTTP and HTTPS monitors.",
			default: "",
			parse: String,
		},
		"expected-codes": {
			kind: "parsed",
			brief:
				"The expected HTTP response code or code range of the health check. This parameter is only valid for HTTP and HTTPS monitors.",
			default: "",
			parse: String,
		},
		"follow-redirects": {
			kind: "boolean",
			brief:
				"Follow redirects if returned by the origin. This parameter is only valid for HTTP and HTTPS monitors.",
			default: false,
		},
		header: {
			kind: "parsed",
			brief:
				'The HTTP request headers to send in the health check. It is recommended you set a Host header by default. The User-Agent header cannot be overridden. This parameter is only valid for HTTP and HTTPS monitors. Provide as a JSON object or @path/to/file.json. Shape: {"<key>": [string]}.',
			optional: true,
			parse: String,
		},
		interval: {
			kind: "parsed",
			brief:
				"The interval between each health check. Shorter intervals may improve failover time, but will increase load on the origins as we check from multiple locations.",
			default: "60",
			parse: Number,
		},
		method: {
			kind: "parsed",
			brief:
				"The method to use for the health check. This defaults to 'GET' for HTTP/HTTPS based checks and 'connection_established' for TCP based health checks.",
			optional: true,
			parse: String,
		},
		path: {
			kind: "parsed",
			brief:
				"The endpoint path you want to conduct a health check against. This parameter is only valid for HTTP and HTTPS monitors.",
			optional: true,
			parse: String,
		},
		port: {
			kind: "parsed",
			brief:
				"The port number to connect to for the health check. Required for TCP, UDP, and SMTP checks. HTTP and HTTPS checks should only define the port when using a non-standard port (HTTP: default 80, HTTPS: default 443).",
			optional: true,
			parse: Number,
		},
		"probe-zone": {
			kind: "parsed",
			brief:
				"Assign this monitor to emulate the specified zone while probing. This parameter is only valid for HTTP and HTTPS monitors.",
			default: "",
			parse: String,
		},
		retries: {
			kind: "parsed",
			brief:
				"The number of retries to attempt in case of a timeout before marking the origin as unhealthy. Retries are attempted immediately.",
			default: "2",
			parse: Number,
		},
		timeout: {
			kind: "parsed",
			brief:
				"The timeout (in seconds) before marking the health check as failed.",
			default: "5",
			parse: Number,
		},
		type: {
			kind: "parsed",
			brief:
				"The protocol to use for the health check. Currently supported protocols are 'HTTP','HTTPS', 'TCP', 'ICMP-PING', 'UDP-ICMP', and 'SMTP'.",
			default: "http",
			choices: ["http", "https", "tcp", "udp_icmp", "icmp_ping", "smtp"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "type", "text"),
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
	operands: [{ placeholder: "monitor-id", brief: "Monitor ID", parse: String }],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "user load-balancers monitors preview create",
				classification: {
					safeFlags: ["allow-insecure", "follow-redirects", "type", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf user load-balancers monitors preview create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/user/load_balancers/monitors/${argv["monitor-id"] == null ? "<monitor-id>" : encodeURIComponent(String(argv["monitor-id"]))}/preview`,
						pathParams: { "monitor-id": String(argv["monitor-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody(
										{
											allow_insecure: argv["allow-insecure"],
											consecutive_down: argv["consecutive-down"],
											consecutive_up: argv["consecutive-up"],
											description: resolveFileToken(
												argv["description"] as string | undefined,
												"description",
												"text"
											),
											expected_body: resolveFileToken(
												argv["expected-body"] as string | undefined,
												"expected-body",
												"text"
											),
											expected_codes: resolveFileToken(
												argv["expected-codes"] as string | undefined,
												"expected-codes",
												"text"
											),
											follow_redirects: argv["follow-redirects"],
											header: parseJsonMap(argv["header"], "header"),
											interval: argv["interval"],
											method: resolveFileToken(
												argv["method"] as string | undefined,
												"method",
												"text"
											),
											path: resolveFileToken(
												argv["path"] as string | undefined,
												"path",
												"text"
											),
											port: argv["port"],
											probe_zone: resolveFileToken(
												argv["probe-zone"] as string | undefined,
												"probe-zone",
												"text"
											),
											retries: argv["retries"],
											timeout: argv["timeout"],
											type: argv["type"],
										},
										[["header"]]
									),
					});
					return;
				}
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, {
							body: bodyData,
							monitor_id: argv["monitor-id"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody(
					{
						allow_insecure: argv["allow-insecure"],
						consecutive_down: argv["consecutive-down"],
						consecutive_up: argv["consecutive-up"],
						description: resolveFileToken(
							argv["description"] as string | undefined,
							"description",
							"text"
						),
						expected_body: resolveFileToken(
							argv["expected-body"] as string | undefined,
							"expected-body",
							"text"
						),
						expected_codes: resolveFileToken(
							argv["expected-codes"] as string | undefined,
							"expected-codes",
							"text"
						),
						follow_redirects: argv["follow-redirects"],
						header: parseJsonMap(argv["header"], "header"),
						interval: argv["interval"],
						method: resolveFileToken(
							argv["method"] as string | undefined,
							"method",
							"text"
						),
						path: resolveFileToken(
							argv["path"] as string | undefined,
							"path",
							"text"
						),
						port: argv["port"],
						probe_zone: resolveFileToken(
							argv["probe-zone"] as string | undefined,
							"probe-zone",
							"text"
						),
						retries: argv["retries"],
						timeout: argv["timeout"],
						type: argv["type"],
					},
					[["header"]]
				);
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						monitor_id: argv["monitor-id"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
