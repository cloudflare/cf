/**
 * update command
 * @generated from apis/overlays/registrar-sandbox.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	requestApi,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, setNestedValue } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "update <domain-name>",
	describe: "Update Registration",
	usage:
		"$0 registrar-sandbox registrations update <domain-name>\n\nUpdates an existing domain registration. By default, the server holds the connection for a bounded, server-defined amount of time while the update completes. Most updates finish within this window and return `200 OK` with a completed workflow status. If the update is still processing after this synchronous wait window, the server returns `202 Accepted`. Poll the URL in `links.self` to track progress. To skip the wait and receive an immediate `202`, send `Prefer: respond-async`. This endpoint currently supports updating `auto_renew` only.",
	flags: {
		prefer: {
			kind: "parsed",
			brief:
				"Set to `respond-async` to receive an immediate `202 Accepted` without\nwaiting for the operation to complete (RFC 7240).",
			optional: true,
			parse: String,
		},
		"auto-renew": {
			kind: "boolean",
			brief:
				"Enable or disable automatic renewal.\nSetting this field to `true` authorizes Cloudflare to charge the\naccount's default payment method up to 30 days before domain expiry\nto renew the domain automatically. Renewal pricing may change over\ntime based on registry pricing.\n",
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"Request to update an existing domain registration.  This endpoint currently supports updating `auto_renew` only. ",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "domain-name",
			brief: "Domain name to update.",
			parse: String,
		},
	],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "registrar-sandbox registrations update",
				classification: {
					safeFlags: ["auto-renew", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const headers: Record<string, string> = {};
				if (argv["prefer"] !== undefined)
					headers["Prefer"] = String(argv["prefer"]);
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf registrar-sandbox registrations update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/registrar-sandbox/registrations/${argv["domain-name"] == null ? "<domain-name>" : encodeURIComponent(String(argv["domain-name"]))}`,
						pathParams: { "domain-name": String(argv["domain-name"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										auto_renew: argv["auto-renew"],
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
					const result = await withProgress(`Updating`, async () =>
						requestApi<unknown>(
							client,
							"PATCH",
							`/accounts/${accountId}/registrar-sandbox/registrations/${encodeURIComponent(String(argv["domain-name"]))}`,
							{
								body: bodyData,
								headers: Object.keys(headers).length > 0 ? headers : undefined,
							}
						)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData: Record<string, unknown> = {};
				if (argv["auto-renew"] !== undefined)
					setNestedValue(bodyData, ["auto_renew"], argv["auto-renew"]);
				const result = await withProgress(`Updating`, async () =>
					requestApi<unknown>(
						client,
						"PATCH",
						`/accounts/${accountId}/registrar-sandbox/registrations/${encodeURIComponent(String(argv["domain-name"]))}`,
						{
							body: bodyData,
							headers: Object.keys(headers).length > 0 ? headers : undefined,
						}
					)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
});

export default command;
