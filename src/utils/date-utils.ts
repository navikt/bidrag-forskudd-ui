export const dateOrNull = (dateString?: string): Date | null => (dateString ? new Date(dateString) : null);
export const toISODateString = (date?: Date): string | null =>
    date?.toLocaleDateString("sv-SV", { year: "numeric", month: "2-digit", day: "2-digit" }) ?? null;
export const toISODateTimeString = (date?: Date): string | null =>
    date == undefined
        ? null
        : date?.toLocaleDateString("sv-SV", { year: "numeric", month: "2-digit", day: "2-digit" }) +
          "T" +
          date?.toLocaleTimeString() +
          "Z";
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
export const isValidDate = (date: never | Date): boolean =>
    !!(date && date instanceof Date && isFinite(date.getTime()));

export const toDateString = (date: Date) => date.toLocaleDateString("no-NO", { dateStyle: "short" });

export const DDMMYYYYStringToDate = (dateString: string) => {
    const [day, month, year] = dateString.split(".").map((d, i) => {
        if (i === 1) return Number(d) - 1;
        if (i === 2) return Number(d);
        return Number(d);
    });

    return new Date(year, month, day);
};

export const DateToDDMMYYYYString = (date: Date) =>
    date.toLocaleDateString("nb-NO", { year: "numeric", month: "2-digit", day: "2-digit" });

export const DateToMMYYYYString = (date: Date) =>
    date.toLocaleDateString("nb-NO", { year: "numeric", month: "2-digit" });

export const ISODateTimeStringToDDMMYYYYString = (isoDateTimeString: string) => {
    const date = new Date(isoDateTimeString);
    return isValidDate(date) ? DateToDDMMYYYYString(date) : "";
};

export const isFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    return firstDay.getDate() === date.getDate();
};

export const isLastDayOfMonth = (date: Date) => {
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return lastDay.getDate() === date.getDate();
};

export const datesAreFromSameMonthAndYear = (date: Date, testDate: Date) =>
    date.getMonth() === testDate.getMonth() && date.getFullYear() === testDate.getFullYear();

export const getAListOfMonthsFromDate = (fromDate: Date, numberOfMonths: number): Date[] => {
    const months = [];
    for (let i = 0; i <= numberOfMonths - 1; i++) {
        months.push(addMonths(firstDayOfMonth(fromDate), i));
    }
    return months;
};

export const periodCoversMinOneFullCalendarMonth = (startDate: Date, endDate: Date) => {
    const yearsDiff = endDate.getFullYear() - startDate.getFullYear();
    const monthDiff = endDate.getMonth() - startDate.getMonth();
    const endDateIsLastDayOfMonth = isLastDayOfMonth(endDate);

    if (yearsDiff === 0) {
        if (isFirstDayOfMonth(startDate) && endDateIsLastDayOfMonth) return true;

        return monthDiff >= (endDateIsLastDayOfMonth ? 1 : 2);
    }

    return endDateIsLastDayOfMonth || monthDiff + 12 > 1;
};
