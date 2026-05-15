import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";

/* global document, Office, module, require, HTMLElement */

const title = "Contoso Task Pane Add-in";
console.log("index.tsx: Module loaded");

const rootElement: HTMLElement | null = document.getElementById("container");
console.log("index.tsx: Root element:", !!rootElement);
const root = rootElement ? createRoot(rootElement) : undefined;
console.log("index.tsx: Root created:", !!root);

/* Render application after Office initializes */
Office.onReady(() => {
  console.log("index.tsx: Office.onReady triggered");
  root?.render(
    <ErrorBoundary>
      <FluentProvider theme={webLightTheme}>
        <App title={title} />
      </FluentProvider>
    </ErrorBoundary>
  );
  console.log("index.tsx: App rendered");
});

if ((module as any).hot) {
  (module as any).hot.accept("./components/App", () => {
    console.log("index.tsx: Hot reload detected");
    const NextApp = require("./components/App").default;
    root?.render(
      <ErrorBoundary>
        <FluentProvider theme={webLightTheme}>
          <NextApp />
        </FluentProvider>
      </ErrorBoundary>
    );
    console.log("index.tsx: App re-rendered after hot reload");
  });
}
