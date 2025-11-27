// context/SettingsContext.js
import React, { createContext, useState, useEffect } from "react";
import { getSettingsAPI } from "../api/settingsApi";

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchSettings = async () => {
    try {
      const data = await getSettingsAPI();
      // Ép kiểu boolean: "true" -> true, "false" -> false
      setMaintenanceMode(data.maintenance_mode_website === "true");
    } catch (err) {
      console.error("Lỗi khi lấy settings", err);
    } finally {
      setLoading(false);
    }
  };

  fetchSettings();
}, []);

  return (
    <SettingsContext.Provider value={{ maintenanceMode, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};
