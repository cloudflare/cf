import operation from "../../../_operations/containers/registries/credentials/generate.js";
/**
 * generate command
 * @generated from apis/overlays/containers.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "generate <domain>",
	describe: "Generate a JWT to interact with the specified image registry.",
	usage:
		"$0 containers registries credentials generate <domain>\n\nGenerates credentials for accessing a configured container image registry.",
	flags: {
		"expiration-minutes": {
			kind: "parsed",
			brief:
				"The number of minutes Cloudflare managed registry credentials stay valid. Required for managed registries and must remain positive. Cloudflare ignores this value for external registries.",
			optional: true,
			parse: Number,
		},
		permissions: {
			kind: "parsed",
			brief:
				"The permissions for Cloudflare managed registry credentials. Required for managed registries. Cloudflare ignores this value for external registries.",
			variadic: true,
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
			brief:
				"Specifies the configuration for the image registry credential to create. Cloudflare requires both fields for managed registries. For external registries, Cloudflare ignores both fields, and the registry provider determines the returned credentials' permissions and lifetime.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "domain",
			brief: "The domain to get credentials for.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "containers registries credentials generate",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf containers registries credentials generate",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/containers/registries/${argv["domain"] == null ? "<domain>" : encodeURIComponent(String(argv["domain"]))}/credentials`,
						pathParams: { domain: String(argv["domain"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										expiration_minutes: argv["expiration-minutes"],
										permissions: argv["permissions"],
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
						client.send(operation, {
							body: bodyData,
							account_id: accountId,
							domain: argv["domain"],
						})
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					expiration_minutes: argv["expiration-minutes"],
					permissions: argv["permissions"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, {
						body: bodyData,
						account_id: accountId,
						domain: argv["domain"],
					})
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
