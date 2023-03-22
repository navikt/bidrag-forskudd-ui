export const dateOrNull = (dateString?: string): Date | null => (dateString ? new Date(dateString) : null);
export const toISOStringOrNull = (date?: Date): string | null => date?.toISOString() ?? null;
export const addDays = (date: Date, days: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
};

export const deductDays = (date: Date, days) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - days);
    return newDate;
};

export const isValidDate = (date: any) => date instanceof Date && isFinite(date.getTime());
