import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { SettingsProvider } from "./context/SettingsContext";
import { Provider } from "react-redux";
import "./assets/main.css";
import "./assets/category.css";
import "./assets/Reponsive.css";
import "./assets/Profile.css";
import "./assets/GuitarViewer.css";
import "./assets/Loading.css";
import { BrowserRouter } from "react-router-dom"; // Chỉ cần BrowserRouter ở đây
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./redux"; // Đảm bảo import đúng
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthProvider } from "./context/AuthContext";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      {/* Chỉ bao bọc BrowserRouter ở đây */}
      <BrowserRouter>
        <AuthProvider>
           <SettingsProvider>
            <App />
          </SettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </PersistGate>
  </Provider>
);
