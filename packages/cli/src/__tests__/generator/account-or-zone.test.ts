import { describe, expect, it } from "vite-plus/test";
import { hasAccountOrZoneScope } from "../../../generator/util.js";

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
});
