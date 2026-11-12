import { describe, expect, it } from "vite-plus/test";
import { generateFiles } from "../../helpers/cli-plugin.js";
import type { CommandMeta } from "../../../lib/command-meta.js";

function variant(target: string, targetDesc: string, valueDesc: string) {
	return {
		type: "object",
		properties: {
			target: { type: "string", enum: [target], description: targetDesc },
			value: { type: "string", description: valueDesc },
		},
	};
}

function optionDescription(name: string): string | undefined {
	const files = generateFiles({
		openapi: "3.0.3",
		info: { title: "oneOf descriptions", version: "1" },
		paths: {
			"/rules": {
				post: {
					"x-fern-sdk-group-name": "rules",
					"x-fern-sdk-method-name": "create",
					summary: "Create a rule",
					requestBody: {
						required: true,
						content: {
							"application/json": {
								schema: {
									type: "object",
									properties: {
										configuration: {
											oneOf: [
												variant("ip", "Set the target to `ip` for an IP address.", "The IP address to match."),
												variant("ip6", "Set the target to `ip6` for an IPv6 address.", "The IPv6 address to match."),
												variant("country", "Set the target to `country` for a country.", "A country code."),
											],
										},
									},
								},
							},
						},
					},
					responses: { "200": { description: "OK" } },
				},
			},
		},
	});
	const metadata = JSON.parse(files.get("_meta/commands.json") ?? "") as {
		commands: CommandMeta[];
	};
	return metadata.commands
		.find((c) => c.command === "cf rules create")
		?.options.find((o) => o.name === name)?.description;
}

describe("flags merged from oneOf variants", () => {
	it("describes every enum value of the variant-selecting flag", () => {
		const description = optionDescription("configuration-target") ?? "";
		expect(description).toContain("ip6");
		expect(description).toContain("country");
	});

	it("does not describe --configuration-value as only the first variant", () => {
		const description = optionDescription("configuration-value") ?? "";
		expect(description).not.toBe("The IP address to match.");
	});
});
