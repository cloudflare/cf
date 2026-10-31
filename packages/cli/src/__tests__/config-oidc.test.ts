import { expect, it } from "vite-plus/test";
import { bindings } from "../config.js";

it("exports signing-only identity configuration without a token audience", () => {
	const limits = {
		request_signing: {
			allowed_origins: ["https://api.example"],
			allowed_methods: ["GET"],
		},
	};
	expect(bindings.identity(limits)).toEqual({ type: "identity", ...limits });
});
