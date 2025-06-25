import axios from "axios";
import API_URL from "./config";
export const getActiveFooters = async () => {
  try {
    const response = await axios.get(`${API_URL}/footer/`);
    const footers = response.data.footers;

    if (!Array.isArray(footers)) throw new Error("footers is not array");

    const activeFooters = footers
      .filter((parent) => parent.status === "active")
      .map((parent) => ({
        ...parent,
        children: parent.children?.filter((child) => child.status === "active"),
      }));

    return activeFooters;
  } catch (error) {
    throw error;

  }
};
