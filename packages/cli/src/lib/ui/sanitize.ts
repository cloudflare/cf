/** Replace characters that can alter or control terminal display. */
export function sanitizeTerminalText(value: string): string {
	return value.replace(/[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/gu, " ");
}
