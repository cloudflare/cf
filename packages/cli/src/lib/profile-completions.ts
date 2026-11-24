export async function savedProfiles(partial: string, includeDefault = true) {
	try {
		const [{ getProfileStore }, { validateProfileName }] = await Promise.all([
			import("./oauth/index.js"),
			import("@cloudflare/workers-auth"),
		]);
		return getProfileStore()
			.configs.list()
			.filter((name) => {
				if (!name.startsWith(partial)) {
					return false;
				}
				if (name === "default") {
					return includeDefault;
				}
				try {
					validateProfileName(name);
					return true;
				} catch {
					return false;
				}
			})
			.sort();
	} catch {
		return [];
	}
}
