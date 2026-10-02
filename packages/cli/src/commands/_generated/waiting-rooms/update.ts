import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/waiting-rooms.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient, getZoneId } from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 waiting-rooms update <waiting-room-id>\n\nUpdates a configured waiting room."
		)
		.positional("waiting-room-id", {
			type: "string",
			description: "Waiting room ID",
			demandOption: true,
		})
		.option("additional-routes", {
			type: "string",
			description:
				"Only available for the Waiting Room Advanced subscription. Additional hostname and path combinations to which this waiting room will be applied. There is an implied wildcard at the end of the path. The hostname and path combination must be unique to this and all other waiting rooms. Provide as a JSON array of objects or @path/to/file.json.",
		})
		.option("cookie-attributes-samesite", {
			type: "string",
			description:
				"Configures the SameSite attribute on the waiting room cookie. Value `auto` will be translated to `lax` or `none` depending if **Always Use HTTPS** is enabled. Note that when using value `none`, the secure attribute cannot be set to `never`.",
			choices: ["auto", "lax", "none", "strict"],
		})
		.option("cookie-attributes-secure", {
			type: "string",
			description:
				"Configures the Secure attribute on the waiting room cookie. Value `always` indicates that the Secure attribute will be set in the Set-Cookie header, `never` indicates that the Secure attribute will not be set, and `auto` will set the Secure attribute depending if **Always Use HTTPS** is enabled.",
			choices: ["auto", "always", "never"],
		})
		.option("cookie-suffix", {
			type: "string",
			description:
				"Appends a '_' + a custom suffix to the end of Cloudflare Waiting Room's cookie name(__cf_waitingroom). If `cookie_suffix` is \"abcd\", the cookie name will be `__cf_waitingroom_abcd`. This field is required if using `additional_routes`.",
		})
		.option("custom-page-html", {
			type: "string",
			description:
				"Only available for the Waiting Room Advanced subscription. This is a template html file that will be rendered at the edge. If no custom_page_html is provided, the default waiting room will be used. The template is based on mustache ( https://mustache.github.io/ ). There are several variables that are evaluated by the Cloudflare edge:\n1. {{`waitTimeKnown`}} Acts like a boolean value that indicates the behavior to take when wait time is not available, for instance when queue_all is **true**.\n2. {{`waitTimeFormatted`}} Estimated wait time for the user. For example, five minutes. Alternatively, you can use:\n3. {{`waitTime`}} Number of minutes of estimated wait for a user.\n4. {{`waitTimeHours`}} Number of hours of estimated wait for a user (`Math.floor(waitTime/60)`).\n5. {{`waitTimeHourMinutes`}} Number of minutes above the `waitTimeHours` value (`waitTime%60`).\n6. {{`queueIsFull`}} Changes to **true** when no more people can be added to the queue.\n\nTo view the full list of variables, look at the `cfWaitingRoom` object described under the `json_response_enabled` property in other Waiting Room API calls.",
		})
		.option("default-template-language", {
			type: "string",
			description:
				"The language of the default page template. If no default_template_language is provided, then `en-US` (English) will be used.",
			choices: [
				"en-US",
				"es-ES",
				"de-DE",
				"fr-FR",
				"it-IT",
				"ja-JP",
				"ko-KR",
				"pt-BR",
				"zh-CN",
				"zh-TW",
				"nl-NL",
				"pl-PL",
				"id-ID",
				"tr-TR",
				"ar-EG",
				"ru-RU",
				"fa-IR",
				"bg-BG",
				"hr-HR",
				"cs-CZ",
				"da-DK",
				"fi-FI",
				"lt-LT",
				"lv-LV",
				"ms-MY",
				"nb-NO",
				"ro-RO",
				"el-GR",
				"he-IL",
				"hi-IN",
				"hu-HU",
				"sr-BA",
				"sk-SK",
				"sl-SI",
				"sv-SE",
				"tl-PH",
				"th-TH",
				"uk-UA",
				"vi-VN",
			],
		})
		.option("description", {
			type: "string",
			description:
				"A note that you can use to add more details about the waiting room.",
		})
		.option("disable-session-renewal", {
			type: "boolean",
			description:
				"Only available for the Waiting Room Advanced subscription. Disables automatic renewal of session cookies. If `true`, an accepted user will have session_duration minutes to browse the site. After that, they will have to go through the waiting room again. If `false`, a user's session cookie will be automatically renewed on every request.",
		})
		.option("enabled-origin-commands", {
			type: "string",
			array: true,
			description: "A list of enabled origin commands.",
		})
		.option("host", {
			type: "string",
			description:
				"The host name to which the waiting room will be applied (no wildcards). Please do not include the scheme (http:// or https://). The host and path combination must be unique.",
		})
		.option("json-response-enabled", {
			type: "boolean",
			description:
				'Only available for the Waiting Room Advanced subscription. If `true`, requests to the waiting room with the header `Accept: application/json` will receive a JSON response object with information on the user\'s status in the waiting room as opposed to the configured static HTML page. This JSON response object has one property `cfWaitingRoom` which is an object containing the following fields:\n1. `inWaitingRoom`: Boolean indicating if the user is in the waiting room (always **true**).\n2. `waitTimeKnown`: Boolean indicating if the current estimated wait times are accurate. If **false**, they are not available.\n3. `waitTime`: Valid only when `waitTimeKnown` is **true**. Integer indicating the current estimated time in minutes the user will wait in the waiting room. When `queueingMethod` is **random**, this is set to `waitTime50Percentile`.\n4. `waitTime25Percentile`: Valid only when `queueingMethod` is **random** and `waitTimeKnown` is **true**. Integer indicating the current estimated maximum wait time for the 25% of users that gain entry the fastest (25th percentile).\n5. `waitTime50Percentile`: Valid only when `queueingMethod` is **random** and `waitTimeKnown` is **true**. Integer indicating the current estimated maximum wait time for the 50% of users that gain entry the fastest (50th percentile). In other words, half of the queued users are expected to let into the origin website before `waitTime50Percentile` and half are expected to be let in after it.\n6. `waitTime75Percentile`: Valid only when `queueingMethod` is **random** and `waitTimeKnown` is **true**. Integer indicating the current estimated maximum wait time for the 75% of users that gain entry the fastest (75th percentile).\n7. `waitTimeFormatted`: String displaying the `waitTime` formatted in English for users. If `waitTimeKnown` is **false**, `waitTimeFormatted` will display **unavailable**.\n8. `queueIsFull`: Boolean indicating if the waiting room\'s queue is currently full and not accepting new users at the moment.\n9. `queueAll`: Boolean indicating if all users will be queued in the waiting room and no one will be let into the origin website.\n10. `lastUpdated`: String displaying the timestamp as an ISO 8601 string of the user\'s last attempt to leave the waiting room and be let into the origin website. The user is able to make another attempt after `refreshIntervalSeconds` past this time. If the user makes a request too soon, it will be ignored and `lastUpdated` will not change.\n11. `refreshIntervalSeconds`: Integer indicating the number of seconds after `lastUpdated` until the user is able to make another attempt to leave the waiting room and be let into the origin website. When the `queueingMethod` is `reject`, there is no specified refresh time —\\_it will always be **zero**.\n12. `queueingMethod`: The queueing method currently used by the waiting room. It is either **fifo**, **random**, **passthrough**, or **reject**.\n13. `isFIFOQueue`: Boolean indicating if the waiting room uses a FIFO (First-In-First-Out) queue.\n14. `isRandomQueue`: Boolean indicating if the waiting room uses a Random queue where users gain access randomly.\n15. `isPassthroughQueue`: Boolean indicating if the waiting room uses a passthrough queue. Keep in mind that when passthrough is enabled, this JSON response will only exist when `queueAll` is **true** or `isEventPrequeueing` is **true** because in all other cases requests will go directly to the origin.\n16. `isRejectQueue`: Boolean indicating if the waiting room uses a reject queue.\n17. `isEventActive`: Boolean indicating if an event is currently occurring. Events are able to change a waiting room\'s behavior during a specified period of time. For additional information, look at the event properties `prequeue_start_time`, `event_start_time`, and `event_end_time` in the documentation for creating waiting room events. Events are considered active between these start and end times, as well as during the prequeueing period if it exists.\n18. `isEventPrequeueing`: Valid only when `isEventActive` is **true**. Boolean indicating if an event is currently prequeueing users before it starts.\n19. `timeUntilEventStart`: Valid only when `isEventPrequeueing` is **true**. Integer indicating the number of minutes until the event starts.\n20. `timeUntilEventStartFormatted`: String displaying the `timeUntilEventStart` formatted in English for users. If `isEventPrequeueing` is **false**, `timeUntilEventStartFormatted` will display **unavailable**.\n21. `timeUntilEventEnd`: Valid only when `isEventActive` is **true**. Integer indicating the number of minutes until the event ends.\n22. `timeUntilEventEndFormatted`: String displaying the `timeUntilEventEnd` formatted in English for users. If `isEventActive` is **false**, `timeUntilEventEndFormatted` will display **unavailable**.\n23. `shuffleAtEventStart`: Valid only when `isEventActive` is **true**. Boolean indicating if the users in the prequeue are shuffled randomly when the event starts.\n24. `turnstile`: Empty when turnstile isn\'t enabled. String displaying an html tag to display the Turnstile widget. Please add the `{{{turnstile}}}` tag to the `custom_html` template to ensure the Turnstile widget appears.\n25. `infiniteQueue`: Boolean indicating whether the response is for a user in the infinite queue.\n\nAn example cURL to a waiting room could be:\n\n\tcurl -X GET "https://example.com/waitingroom" \\\n\t\t-H "Accept: application/json"\n\nIf `json_response_enabled` is **true** and the request hits the waiting room, an example JSON response when `queueingMethod` is **fifo** and no event is active could be:\n\n\t{\n\t\t"cfWaitingRoom": {\n\t\t\t"inWaitingRoom": true,\n\t\t\t"waitTimeKnown": true,\n\t\t\t"waitTime": 10,\n\t\t\t"waitTime25Percentile": 0,\n\t\t\t"waitTime50Percentile": 0,\n\t\t\t"waitTime75Percentile": 0,\n\t\t\t"waitTimeFormatted": "10 minutes",\n\t\t\t"queueIsFull": false,\n\t\t\t"queueAll": false,\n\t\t\t"lastUpdated": "2020-08-03T23:46:00.000Z",\n\t\t\t"refreshIntervalSeconds": 20,\n\t\t\t"queueingMethod": "fifo",\n\t\t\t"isFIFOQueue": true,\n\t\t\t"isRandomQueue": false,\n\t\t\t"isPassthroughQueue": false,\n\t\t\t"isRejectQueue": false,\n\t\t\t"isEventActive": false,\n\t\t\t"isEventPrequeueing": false,\n\t\t\t"timeUntilEventStart": 0,\n\t\t\t"timeUntilEventStartFormatted": "unavailable",\n\t\t\t"timeUntilEventEnd": 0,\n\t\t\t"timeUntilEventEndFormatted": "unavailable",\n\t\t\t"shuffleAtEventStart": false\n\t\t}\n\t}\n\nIf `json_response_enabled` is **true** and the request hits the waiting room, an example JSON response when `queueingMethod` is **random** and an event is active could be:\n\n\t{\n\t\t"cfWaitingRoom": {\n\t\t\t"inWaitingRoom": true,\n\t\t\t"waitTimeKnown": true,\n\t\t\t"waitTime": 10,\n\t\t\t"waitTime25Percentile": 5,\n\t\t\t"waitTime50Percentile": 10,\n\t\t\t"waitTime75Percentile": 15,\n\t\t\t"waitTimeFormatted": "5 minutes to 15 minutes",\n\t\t\t"queueIsFull": false,\n\t\t\t"queueAll": false,\n\t\t\t"lastUpdated": "2020-08-03T23:46:00.000Z",\n\t\t\t"refreshIntervalSeconds": 20,\n\t\t\t"queueingMethod": "random",\n\t\t\t"isFIFOQueue": false,\n\t\t\t"isRandomQueue": true,\n\t\t\t"isPassthroughQueue": false,\n\t\t\t"isRejectQueue": false,\n\t\t\t"isEventActive": true,\n\t\t\t"isEventPrequeueing": false,\n\t\t\t"timeUntilEventStart": 0,\n\t\t\t"timeUntilEventStartFormatted": "unavailable",\n\t\t\t"timeUntilEventEnd": 15,\n\t\t\t"timeUntilEventEndFormatted": "15 minutes",\n\t\t\t"shuffleAtEventStart": true\n\t\t}\n\t}',
		})
		.option("name", {
			type: "string",
			description:
				"A unique name to identify the waiting room. Only alphanumeric characters, hyphens and underscores are allowed.",
		})
		.option("new-users-per-minute", {
			type: "number",
			description:
				"Sets the number of new users that will be let into the route every minute. This value is used as baseline for the number of users that are let in per minute. So it is possible that there is a little more or little less traffic coming to the route based on the traffic patterns at that time around the world.",
		})
		.option("path", {
			type: "string",
			description:
				"Sets the path within the host to enable the waiting room on. The waiting room will be enabled for all subpaths as well. If there are two waiting rooms on the same subpath, the waiting room for the most specific path will be chosen. Wildcards and query parameters are not supported.",
		})
		.option("queue-all", {
			type: "boolean",
			description:
				"If queue_all is `true`, all the traffic that is coming to a route will be sent to the waiting room. No new traffic can get to the route once this field is set and estimated time will become unavailable.",
		})
		.option("queueing-method", {
			type: "string",
			description:
				"Sets the queueing method used by the waiting room. Changing this parameter from the **default** queueing method is only available for the Waiting Room Advanced subscription. Regardless of the queueing method, if `queue_all` is enabled or an event is prequeueing, users in the waiting room will not be accepted to the origin. These users will always see a waiting room page that refreshes automatically. The valid queueing methods are:\n1. `fifo` **(default)**: First-In-First-Out queue where customers gain access in the order they arrived.\n2. `random`: Random queue where customers gain access randomly, regardless of arrival time.\n3. `passthrough`: Users will pass directly through the waiting room and into the origin website. As a result, any configured limits will not be respected while this is enabled. This method can be used as an alternative to disabling a waiting room (with `suspended`) so that analytics are still reported. This can be used if you wish to allow all traffic normally, but want to restrict traffic during a waiting room event, or vice versa.\n4. `reject`: Users will be immediately rejected from the waiting room. As a result, no users will reach the origin website while this is enabled. This can be used if you wish to reject all traffic while performing maintenance, block traffic during a specified period of time (an event), or block traffic while events are not occurring. Consider a waiting room used for vaccine distribution that only allows traffic during sign-up events, and otherwise blocks all traffic. For this case, the waiting room uses `reject`, and its events override this with `fifo`, `random`, or `passthrough`. When this queueing method is enabled and neither `queueAll` is enabled nor an event is prequeueing, the waiting room page **will not refresh automatically**.",
			choices: ["fifo", "random", "passthrough", "reject"],
		})
		.option("queueing-status-code", {
			type: "number",
			description: "HTTP status code returned to a user while in the queue.",
		})
		.option("session-duration", {
			type: "number",
			description:
				"Lifetime of a cookie (in minutes) set by Cloudflare for users who get access to the route. If a user is not seen by Cloudflare again in that time period, they will be treated as a new user that visits the route.",
		})
		.option("suspended", {
			type: "boolean",
			description:
				"Suspends or allows traffic going to the waiting room. If set to `true`, the traffic will not go to the waiting room.",
		})
		.option("total-active-users", {
			type: "number",
			description:
				"Sets the total number of active user sessions on the route at a point in time. A route is a combination of host and path on which a waiting room is available. This value is used as a baseline for the total number of active user sessions on the route. It is possible to have a situation where there are more or less active users sessions on the route based on the traffic patterns at that time around the world.",
		})
		.option("turnstile-action", {
			type: "string",
			description:
				"Which action to take when a bot is detected using Turnstile. `log` will\nhave no impact on queueing behavior, simply keeping track of how many\nbots are detected in Waiting Room Analytics. `infinite_queue` will send\nbots to a false queueing state, where they will never reach your\norigin. `infinite_queue` requires Advanced Waiting Room.\n",
			choices: ["log", "infinite_queue"],
		})
		.option("turnstile-mode", {
			type: "string",
			description:
				"Which Turnstile widget type to use for detecting bot traffic. See\n[the Turnstile documentation](https://developers.cloudflare.com/turnstile/concepts/widget/#widget-types)\nfor the definitions of these widget types. Set to `off` to disable the\nTurnstile integration entirely. Setting this to anything other than\n`off` or `invisible` requires Advanced Waiting Room.\n",
			choices: [
				"off",
				"invisible",
				"visible_non_interactive",
				"visible_managed",
			],
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

type Request = SdkRequest<"waiting-room-update-waiting-room">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <waiting-room-id>",
	describe: "Update waiting room",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "waiting-rooms update",
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
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf waiting-rooms update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/zones/${argv.zone ?? argv.zoneId ?? "<zone>"}/waiting_rooms/${argv["waiting-room-id"] == null ? "<waiting-room-id>" : encodeURIComponent(String(argv["waiting-room-id"]))}`,
						pathParams: {
							"waiting-room-id": String(argv["waiting-room-id"] ?? ""),
							"zone-id": String(argv.zone ?? argv["zone-id"] ?? ""),
						},
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
											samesite: resolveFileToken(
												argv["cookie-attributes-samesite"] as
													| string
													| undefined,
												"cookie-attributes-samesite",
												"text"
											),
											secure: resolveFileToken(
												argv["cookie-attributes-secure"] as string | undefined,
												"cookie-attributes-secure",
												"text"
											),
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
										default_template_language: resolveFileToken(
											argv["default-template-language"] as string | undefined,
											"default-template-language",
											"text"
										),
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
										queueing_method: resolveFileToken(
											argv["queueing-method"] as string | undefined,
											"queueing-method",
											"text"
										),
										queueing_status_code: argv["queueing-status-code"],
										session_duration: argv["session-duration"],
										suspended: argv["suspended"],
										total_active_users: argv["total-active-users"],
										turnstile_action: resolveFileToken(
											argv["turnstile-action"] as string | undefined,
											"turnstile-action",
											"text"
										),
										turnstile_mode: resolveFileToken(
											argv["turnstile-mode"] as string | undefined,
											"turnstile-mode",
											"text"
										),
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
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.waitingRooms.update({
							body: bodyData,
							zone_id: zoneId,
							waiting_room_id: argv["waiting-room-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
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

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					additional_routes: parseObjectArray(
						argv["additional-routes"],
						"additional-routes"
					),
					cookie_attributes: {
						samesite: resolveFileToken(
							argv["cookie-attributes-samesite"] as string | undefined,
							"cookie-attributes-samesite",
							"text"
						),
						secure: resolveFileToken(
							argv["cookie-attributes-secure"] as string | undefined,
							"cookie-attributes-secure",
							"text"
						),
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
					default_template_language: resolveFileToken(
						argv["default-template-language"] as string | undefined,
						"default-template-language",
						"text"
					),
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
					queueing_method: resolveFileToken(
						argv["queueing-method"] as string | undefined,
						"queueing-method",
						"text"
					),
					queueing_status_code: argv["queueing-status-code"],
					session_duration: argv["session-duration"],
					suspended: argv["suspended"],
					total_active_users: argv["total-active-users"],
					turnstile_action: resolveFileToken(
						argv["turnstile-action"] as string | undefined,
						"turnstile-action",
						"text"
					),
					turnstile_mode: resolveFileToken(
						argv["turnstile-mode"] as string | undefined,
						"turnstile-mode",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.waitingRooms.update({
						body: bodyData,
						zone_id: zoneId,
						waiting_room_id: argv["waiting-room-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
