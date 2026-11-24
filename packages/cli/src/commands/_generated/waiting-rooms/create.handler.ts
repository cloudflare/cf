import operation from "../_operations/waiting-rooms/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "waiting-rooms create",
			classification: {
				safeFlags: [
					"cookie-attributes-samesite",
					"cookie-attributes-secure",
					"default-template-language",
					"disable-session-renewal",
					"json-response-enabled",
					"queue-all",
					"queueing-method",
					"suspended",
					"turnstile-action",
					"turnstile-mode",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["host"] === undefined) {
					argv["host"] = await promptForRequiredField(
						"host",
						"The host name to which the waiting room will be applied (no wildcards). Please do not include the scheme (http:// or https://). The host and path combination must be unique."
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"A unique name to identify the waiting room. Only alphanumeric characters, hyphens and underscores are allowed."
					);
				}
				if (argv["new-users-per-minute"] === undefined) {
					throw new Error(
						"--new-users-per-minute is required (or pass --body with this field set)."
					);
				}
				if (argv["total-active-users"] === undefined) {
					throw new Error(
						"--total-active-users is required (or pass --body with this field set)."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				formatDryRun({
					command: "cf waiting-rooms create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/waiting_rooms`,
					pathParams: { "zone-id": String(argv.zone ?? argv["zone-id"] ?? "") },
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody({
									additional_routes: parseObjectArray(
										argv["additional-routes"],
										"additional-routes"
									),
									cookie_attributes: {
										samesite: argv["cookie-attributes-samesite"],
										secure: argv["cookie-attributes-secure"],
									},
									cookie_suffix: resolveFileToken(
										argv["cookie-suffix"] as string | undefined,
										"cookie-suffix",
										"text"
									),
									custom_page_html: resolveFileToken(
										argv["custom-page-html"] as string | undefined,
										"custom-page-html",
										"text"
									),
									default_template_language: argv["default-template-language"],
									description: resolveFileToken(
										argv["description"] as string | undefined,
										"description",
										"text"
									),
									disable_session_renewal: argv["disable-session-renewal"],
									enabled_origin_commands: argv["enabled-origin-commands"],
									host: resolveFileToken(
										argv["host"] as string | undefined,
										"host",
										"text"
									),
									json_response_enabled: argv["json-response-enabled"],
									name: resolveFileToken(
										argv["name"] as string | undefined,
										"name",
										"text"
									),
									new_users_per_minute: argv["new-users-per-minute"],
									path: resolveFileToken(
										argv["path"] as string | undefined,
										"path",
										"text"
									),
									queue_all: argv["queue-all"],
									queueing_method: argv["queueing-method"],
									queueing_status_code: argv["queueing-status-code"],
									session_duration: argv["session-duration"],
									suspended: argv["suspended"],
									total_active_users: argv["total-active-users"],
									turnstile_action: argv["turnstile-action"],
									turnstile_mode: argv["turnstile-mode"],
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
				additional_routes: parseObjectArray(
					argv["additional-routes"],
					"additional-routes"
				),
				cookie_attributes: {
					samesite: argv["cookie-attributes-samesite"],
					secure: argv["cookie-attributes-secure"],
				},
				cookie_suffix: resolveFileToken(
					argv["cookie-suffix"] as string | undefined,
					"cookie-suffix",
					"text"
				),
				custom_page_html: resolveFileToken(
					argv["custom-page-html"] as string | undefined,
					"custom-page-html",
					"text"
				),
				default_template_language: argv["default-template-language"],
				description: resolveFileToken(
					argv["description"] as string | undefined,
					"description",
					"text"
				),
				disable_session_renewal: argv["disable-session-renewal"],
				enabled_origin_commands: argv["enabled-origin-commands"],
				host: resolveFileToken(
					argv["host"] as string | undefined,
					"host",
					"text"
				),
				json_response_enabled: argv["json-response-enabled"],
				name: resolveFileToken(
					argv["name"] as string | undefined,
					"name",
					"text"
				),
				new_users_per_minute: argv["new-users-per-minute"],
				path: resolveFileToken(
					argv["path"] as string | undefined,
					"path",
					"text"
				),
				queue_all: argv["queue-all"],
				queueing_method: argv["queueing-method"],
				queueing_status_code: argv["queueing-status-code"],
				session_duration: argv["session-duration"],
				suspended: argv["suspended"],
				total_active_users: argv["total-active-users"],
				turnstile_action: argv["turnstile-action"],
				turnstile_mode: argv["turnstile-mode"],
			});
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, zone_id: zoneId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
