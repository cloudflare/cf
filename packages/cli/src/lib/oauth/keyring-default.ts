import { randomUUID, timingSafeEqual } from "node:crypto";
import {
	generateKey,
	getCloudflareAuthUseKeyringFromEnv,
	resolveKeyProvider,
} from "@cloudflare/workers-auth";
import {
	CF_KEYRING_SERVICE_NAME,
	getCfConfigPath,
	readUserPreferences,
	updateUserPreferences,
} from "@cloudflare/workers-auth/cf";
import { readState, updateState } from "../state.js";
import { log } from "../ui/log.js";

export function enableKeyringByDefault(): void {
	if (
		getCloudflareAuthUseKeyringFromEnv() !== undefined ||
		readUserPreferences().keyring_enabled !== undefined
	) {
		return;
	}

	if (canUseKeyring()) {
		updateUserPreferences({ keyring_enabled: true });
		return;
	}

	if (!readState().keyringFallbackWarned) {
		log.warn(
			"OS keyring storage is unavailable. OAuth credentials will be stored in a plaintext file. cf will try the keyring again on your next login. Use `cf auth login --no-use-keyring` to keep plaintext storage, or set CLOUDFLARE_AUTH_USE_KEYRING=true to require keyring storage."
		);
		updateState({ keyringFallbackWarned: true });
	}
}

function canUseKeyring(): boolean {
	try {
		// A separate entry protects existing credentials while testing the actual
		// backend: an installed tool alone doesn't prove a secret service works.
		const resolution = resolveKeyProvider(
			CF_KEYRING_SERVICE_NAME,
			`keyring-probe-${randomUUID()}`,
			getCfConfigPath()
		);
		if (resolution.kind !== "available") {
			return false;
		}

		const key = generateKey();
		const { provider } = resolution;
		try {
			provider.setKey(key);
			const stored = provider.getKey();
			return (
				stored !== undefined &&
				stored.length === key.length &&
				timingSafeEqual(stored, key)
			);
		} finally {
			provider.deleteKey();
		}
	} catch {
		return false;
	}
}
