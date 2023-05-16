import ReactDOM from "react-dom/client";

import { initMock } from "./__mocks__/msw";
import App from "./App";

// This file is only used for development. The entrypoint is under pages folder
initMock();
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(<App />);
