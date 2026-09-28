import { describe, expect, it } from "vitest";
import {
	accountOrZonePathParamLocal,
	hasAccountOrZoneScope,
} from "../../../generator/util.js";

describe("account-or-zone path classification", () => {
	it("recognizes only the adjacent placeholder pair", () => {
		expect(
			hasAccountOrZoneScope(
				"/{account_or_zone}/{account_or_zone_id}/load_balancers"
			)
		).toBe(true);
		expect(
			hasAccountOrZoneScope("/prefix/{account_or_zone}/{account_or_zone_id}")
		).toBe(true);

		expect(
			hasAccountOrZoneScope(
				"/{account_or_zone}/nested/{account_or_zone_id}/load_balancers"
			)
		).toBe(false);
		expect(
			hasAccountOrZoneScope(
				"/{account_or_zone_id}/{account_or_zone}/load_balancers"
			)
		).toBe(false);
		expect(hasAccountOrZoneScope("/things/{account_or_zone}")).toBe(false);
	});

	it("maps only the paired placeholders to generated locals", () => {
		const path = "/{account_or_zone}/{account_or_zone_id}/load_balancers";
		expect(accountOrZonePathParamLocal(path, "account_or_zone")).toBe(
			"accountOrZone"
		);
		expect(accountOrZonePathParamLocal(path, "account_or_zone_id")).toBe(
			"accountOrZoneId"
		);
		expect(accountOrZonePathParamLocal(path, "load_balancer_id")).toBe(
			undefined
		);
		expect(
			accountOrZonePathParamLocal(
				"/things/{account_or_zone}",
				"account_or_zone"
			)
		).toBe(undefined);
	});
});
