import { expect } from "chai";
import { describe } from "mocha";

import { isValidDate } from "../../utils/date-utils";

describe("DateUtils", () => {
    it("isValidDate should return false for null", () => {
        const isValid = isValidDate(null);
        expect(isValid).equals(false);
    });

    it("isValidDate should return false for undefined", () => {
        const isValid = isValidDate(undefined);
        expect(isValid).equals(false);
    });

    it("isValidDate should return true for Date object", () => {
        const isValid = isValidDate(new Date());
        expect(isValid).equals(true);
    });
});
