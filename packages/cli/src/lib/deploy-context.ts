import * as clack from "@clack/prompts";
import {
	fetchKVGetValueBase,
	fetchListResultBase,
	fetchResultBase,
	getSanitizeLogs,
} from "@cloudflare/workers-utils";
import { USER_AGENT } from "../version.js";
import { confirm, prompt, select } from "./dialog.js";
import type { DeployHelpersContext } from "@cloudflare/deploy-helpers";
import type { Logger } from "@cloudflare/workers-utils";

/**
 * Build the deploy-helpers context that `initDeployHelpersContext` needs.
 *
 * deploy-helpers uses module-level globals for fetch/logger/confirm/prompt,
 * set once via `initDeployHelpersContext`. This factory creates cf-specific
 * implementations that bridge cf's auth/UX stack to those globals.
 *
 * The `*Base` functions from workers-utils take explicit (userAgent, logger,
 * credentials) args; the context-bound versions close over them so
 * deploy-helpers callers don't need to thread auth through every call.
 */
export function createDeployContext(authToken: string): DeployHelpersContext {
	const credentials = { apiToken: authToken };
	const userAgent = USER_AGENT;

	const isDebug = !!process.env.DEBUG;
	const logger: Logger = {
		loggerLevel: isDebug ? "debug" : "log",
		debug: isDebug
			? (...args: unknown[]) =>
					clack.log.message(args.join(" "), { spacing: 0 })
			: () => {},
		// workers-utils' fetch layer routes potentially-sensitive payloads
		// (request/response bodies, headers, auth tokens) through this
		// channel instead of plain `debug`. Without it, `DEBUG=1` shows the
		// request/response *envelope* but never the body — so a failing API
		// call's actual error message is invisible. Mirror wrangler's
		// convention: redact by default (WRANGLER_LOG_SANITIZE defaults
		// true), include raw payloads only when the user opts in.
		debugWithSanitization: isDebug
			? (label: string, ...args: unknown[]) => {
					if (getSanitizeLogs()) {
						clack.log.message(
							`${label} omitted; set WRANGLER_LOG_SANITIZE=false to include sanitized data`,
							{ spacing: 0 }
						);
					} else {
						clack.log.message([label, ...args].join(" "), {
							spacing: 0,
						});
					}
				}
			: () => {},
		log: (...args: unknown[]) =>
			clack.log.message(args.join(" "), { spacing: 0 }),
		info: (...args: unknown[]) =>
			clack.log.message(args.join(" "), { spacing: 0 }),
		warn: (...args: unknown[]) =>
			clack.log.warn(String(args.join(" ")), { spacing: 0 }),
		error: (...args: unknown[]) =>
			clack.log.error(String(args.join(" ")), { spacing: 0 }),
	};

	// The fetch closures capture auth credentials and user-agent,
	// delegating to workers-utils' *Base functions. Parameter types
	// are inferred from DeployHelpersContext to avoid global vs undici
	// RequestInit conflicts.
	const ctx: DeployHelpersContext = {
		fetchResult: (complianceConfig, resource, init, queryParams, abortSignal) =>
			fetchResultBase(
				complianceConfig,
				resource,
				init,
				userAgent,
				logger,
				queryParams,
				abortSignal,
				credentials
			),

		fetchListResult: (complianceConfig, resource, init, queryParams) =>
			fetchListResultBase(
				complianceConfig,
				resource,
				init,
				userAgent,
				logger,
				queryParams,
				credentials
			),

		// Same implementation as fetchListResult — workers-utils has no
		// separate paged-list base function; both fetch all pages.
		fetchPagedListResult: (complianceConfig, resource, init, queryParams) =>
			// TODO: actually move fetchPagedListREsult into workers-utils...
			fetchListResultBase(
				complianceConfig,
				resource,
				init,
				userAgent,
				logger,
				queryParams,
				credentials
			),

		fetchKVGetValue: (complianceConfig, accountId, namespaceId, key) =>
			fetchKVGetValueBase(
				complianceConfig,
				accountId,
				namespaceId,
				key,
				userAgent,
				logger,
				credentials
			),

		logger,

		confirm: (text, options) =>
			confirm(text, {
				defaultValue: options?.defaultValue ?? false,
				fallbackValue: options?.fallbackValue ?? options?.defaultValue ?? false,
			}),

		prompt: (text, options) =>
			prompt(text, {
				defaultValue: options?.defaultValue,
				fallbackValue: options?.defaultValue ?? "",
			}),

		select: (text, options) => select(text, options),
	};

	return ctx;
}
