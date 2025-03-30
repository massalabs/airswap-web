import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";

import { Alchemy } from "alchemy-sdk";
import * as buffer from "buffer";

import App from "./App";
import { store } from "./app/store";
import { getAlchemyChain } from "./helpers/alchemy";
import * as serviceWorker from "./serviceWorker";

window.Buffer = buffer.Buffer;

window.alchemy = new Alchemy({
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: getAlchemyChain(+(process.env.REACT_APP_CHAIN_ID || "1")),
});

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
