export const dateOrNull = (dateString?: string): Date | null => (dateString ? new Date(dateString) : null);
export const toISOStringOrNull = (date?: Date): string | null => date?.toISOString() ?? null;
