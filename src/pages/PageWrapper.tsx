import "../index.css";

import { MDXProvider, useMDXComponents } from "@mdx-js/react";
import { ArrowRightIcon } from "@navikt/aksel-icons";
import { BodyLong, BodyShort, Heading, Label } from "@navikt/ds-react";
import { useThemedStylesWithMdx } from "@theme-ui/mdx";
import React, { PropsWithChildren } from "react";
import { Theme, ThemeUIProvider } from "theme-ui";

interface PageWrapperProps {
    name: string;
}
const mdxComponents = { Heading, BodyShort, ArrowRightIcon, BodyLong, Label };

const theme: Theme = {
    config: {
        useRootStyles: false,
    },
    fonts: {
        body: 'var(--a-font-family,"Source Sans Pro",Arial,sans-serif)',
    },
    fontWeights: {
        body: "var(--a-font-weight-regular)",
    },
    lineHeights: {
        body: "var(--a-font-line-height-medium)",
    },
    styles: {
        root: {
            fontFamily: 'var(--a-font-family,"Source Sans Pro",Arial,sans-serif)',
            lineHeight: "var(--a-font-line-height-medium)",
            fontWeight: "var(--a-font-weight-regular)",
            fontSize: "var(--a-font-size-large)",
        },
        ul: {
            marginTop: "5px",
        },
        p: {
            maxWidth: "65rem",
            fontWeight: "var(--a-font-weight-regular)",
        },
        h1: {
            fontSize: "var(--a-font-size-heading-xlarge)",
        },
        h2: {
            fontSize: "var(--a-font-size-heading-large)",
            marginTop: 0,
        },
        h3: {
            fontSize: "var(--a-font-size-heading-medium)",
        },
        h4: {
            fontSize: "var(--a-font-size-heading-small)",
            marginBottom: "5px",
        },
        h5: {
            fontSize: "var(--a-font-size-heading-xsmall)",
            marginTop: "5px",
            marginBottom: "5px",
        },
    },
};

export default function PageWrapper({ children, name }: PropsWithChildren<PageWrapperProps>) {
    const componentsWithStyles = useThemedStylesWithMdx(useMDXComponents());
    return (
        <ThemeUIProvider theme={theme}>
            <MDXProvider components={{ ...mdxComponents, ...componentsWithStyles }}>
                <div className={name}>{children}</div>
            </MDXProvider>
        </ThemeUIProvider>
    );
}
