import { render } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import { expect } from "chai";
import { describe } from "mocha";
import React from "react";

import { ForskuddPage } from "../../pages/forskudd/ForskuddPage";

describe("ForskuddPage", () => {
    it("should render", async () => {
        render(<ForskuddPage />);
        await waitFor(() => expect(document.querySelector("button")).not.to.be.null);
    });
});
