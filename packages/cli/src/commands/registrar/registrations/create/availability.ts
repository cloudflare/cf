import { domainToASCII } from "node:url";
import { withProgress } from "#lib/progress.js";
import { sanitizeTerminalText } from "#lib/ui/sanitize.js";
import type { Cloudflare } from "#lib/auth.js";

export interface RegistrationPricing {
	currency: string;
	registration_cost: string;
	renewal_cost: string;
}

/**
 * Authoritatively require a standard, registrable domain with usable pricing.
 * Callers can run this gate both before collecting input and immediately
 * before presenting the final quote.
 */
export async function requireRegistrationAvailability(
	client: Cloudflare,
	accountId: string,
	domain: string
): Promise<RegistrationPricing> {
	const displayDomain = sanitizeTerminalText(domain);
	const expectedDomain = domainToASCII(
		domain.trim().replace(/\.$/, "")
	).toLowerCase();
	const availability = await withProgress(`Checking availability`, () =>
		client.registrar.registrations.check({
			account_id: accountId,
			domains: [domain],
		})
	);
	const matches =
		expectedDomain === ""
			? []
			: availability.domains.filter(
					(candidate) => candidate.name.toLowerCase() === expectedDomain
				);
	const checked = matches.length === 1 ? matches[0] : undefined;
	if (!checked) {
		throw new Error(
			`The availability check returned no result for ${displayDomain}, so cf cannot safely register it.`
		);
	}
	if (checked.registrable !== true && checked.reason === "domain_premium") {
		throw new Error(
			`${displayDomain} is a premium domain (domain_premium). Premium registration is not supported by this API, so cf will not submit it.`
		);
	}
	if (checked.registrable !== true) {
		const reason =
			checked.reason === undefined
				? ""
				: ` (${sanitizeTerminalText(checked.reason)})`;
		throw new Error(
			`${displayDomain} is not available for registration${reason}.`
		);
	}
	// The API contract reports premium domains as non-registrable with
	// `reason: domain_premium`. Keep a premium-specific fallback in case an
	// inconsistent response ever marks one registrable.
	if (checked.tier === "premium") {
		throw new Error(
			`${displayDomain} is a premium domain. Premium registration is not supported by this API, so cf will not submit it.`
		);
	}
	if (checked.tier !== "standard") {
		throw new Error(
			`${displayDomain} is not confirmed as a standard domain. This API only supports standard registrations, so cf will not submit it.`
		);
	}
	if (!checked.pricing) {
		throw new Error(
			`The availability check returned no pricing for ${displayDomain}, so cf cannot safely register it.`
		);
	}
	return checked.pricing;
}
