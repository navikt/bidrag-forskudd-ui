export function removePlaceholder(stringWithPlaceholders: string, ...args: string[]): string {
    return args.reduce((s, v) => s.replace("{}", v), stringWithPlaceholders);
}

export function capitalize(text: string) {
    return text.charAt(0).toUpperCase() + text.toLowerCase().slice(1);
}
