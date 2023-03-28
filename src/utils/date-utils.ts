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

export const addMonths = (date: Date, months: number) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
};

export const deductMonths = (date: Date, months: number) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() - months);
    return newDate;
};

export const lastDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
export const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

export const isValidDate = (date: any) => date && date instanceof Date && isFinite(date.getTime());

export const DDMMYYYYStringToDate = (dateString: string) => {
    const [day, month, year] = dateString.split(".").map((d, i) => {
        if (i === 1) return Number(d) - 1;
        if (i === 2) return Number(d);
        return Number(d);
    });

    return new Date(year, month, day);
};

export const DateToDDMMYYYYString = (date: Date) =>
    date.toLocaleDateString("nb-NO", { year: "numeric", month: "numeric", day: "numeric" });

export const ISODateTimeStringToDDMMYYYYString = (isoDateTimeString: string) => {
    const date = new Date(isoDateTimeString);
    return isValidDate(date) ? DateToDDMMYYYYString(date) : "";
};
