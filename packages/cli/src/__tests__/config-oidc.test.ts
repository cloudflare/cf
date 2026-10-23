import { expect, it } from "vite-plus/test";
import { bindings } from "../config.js";

it("exports the shared explicit OIDC binding factory through cf/config", () => {
	expect(
		bindings.oidc({
			identity_id: "orders",
			audience: "urn:orders",
			allowed_audiences: ["urn:orders", "urn:reports"],
		})
	).toEqual({
		type: "oidc",
		identity_id: "orders",
		audience: "urn:orders",
		allowed_audiences: ["urn:orders", "urn:reports"],
	});
});
