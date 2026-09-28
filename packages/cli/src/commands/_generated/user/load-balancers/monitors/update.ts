import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/user.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 user load-balancers monitors update <monitor-id>\n\nModify a configured monitor."
		)
		.positional("monitor-id", {
			type: "string",
			description: "Monitor ID",
			demandOption: true,
		})
		.option("allow-insecure", {
			type: "boolean",
			description:
				"Do not validate the certificate when monitor use HTTPS. This parameter is currently only valid for HTTP and HTTPS monitors.",
		})
		.option("consecutive-down", {
			type: "number",
			description:
				"To be marked unhealthy the monitored origin must fail this healthcheck N consecutive times.",
		})
		.option("consecutive-up", {
			type: "number",
			description:
				"To be marked healthy the monitored origin must pass this healthcheck N consecutive times.",
		})
		.option("description", {
			type: "string",
			description: "Object description.",
		})
		.option("expected-body", {
			type: "string",
			description:
				"A case-insensitive sub-string to look for in the response body. If this string is not found, the origin will be marked as unhealthy. This parameter is only valid for HTTP and HTTPS monitors.",
		})
		.option("expected-codes", {
			type: "string",
			description:
				"The expected HTTP response code or code range of the health check. This parameter is only valid for HTTP and HTTPS monitors.",
		})
		.option("follow-redirects", {
			type: "boolean",
			description:
				"Follow redirects if returned by the origin. This parameter is only valid for HTTP and HTTPS monitors.",
		})
		.option("interval", {
			type: "number",
			description:
				"The interval between each health check. Shorter intervals may improve failover time, but will increase load on the origins as we check from multiple locations.",
		})
		.option("method", {
			type: "string",
			description:
				"The method to use for the health check. This defaults to 'GET' for HTTP/HTTPS based checks and 'connection_established' for TCP based health checks.",
		})
		.option("path", {
			type: "string",
			description:
				"The endpoint path you want to conduct a health check against. This parameter is only valid for HTTP and HTTPS monitors.",
		})
		.option("port", {
			type: "number",
			description:
				"The port number to connect to for the health check. Required for TCP, UDP, and SMTP checks. HTTP and HTTPS checks should only define the port when using a non-standard port (HTTP: default 80, HTTPS: default 443).",
		})
		.option("probe-zone", {
			type: "string",
			description:
				"Assign this monitor to emulate the specified zone while probing. This parameter is only valid for HTTP and HTTPS monitors.",
		})
		.option("retries", {
			type: "number",
			description:
				"The number of retries to attempt in case of a timeout before marking the origin as unhealthy. Retries are attempted immediately.",
		})
		.option("timeout", {
			type: "number",
			description:
				"The timeout (in seconds) before marking the health check as failed.",
		})
		.option("type", {
			type: "string",
			description:
				"The protocol to use for the health check. Currently supported protocols are 'HTTP','HTTPS', 'TCP', 'ICMP-PING', 'UDP-ICMP', and 'SMTP'.",
			choices: ["http", "https", "tcp", "udp_icmp", "icmp_ping", "smtp"],
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

type Request = SdkRequest<"load-balancer-monitors-update-monitor">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <monitor-id>",
	describe: "Update Monitor",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "user load-balancers monitors update",
				classification: {
					safeFlags: ["allow-insecure", "follow-redirects", "type", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf user load-balancers monitors update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/user/load_balancers/monitors/${argv["monitor-id"] == null ? "<monitor-id>" : encodeURIComponent(String(argv["monitor-id"]))}`,
						pathParams: { "monitor-id": String(argv["monitor-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
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
										type: resolveFileToken(
											argv["type"] as string | undefined,
											"type",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.user.loadBalancers.monitors.update({
							body: bodyData,
							monitor_id: argv["monitor-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
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
					type: resolveFileToken(
						argv["type"] as string | undefined,
						"type",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.user.loadBalancers.monitors.update({
						body: bodyData,
						monitor_id: argv["monitor-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
