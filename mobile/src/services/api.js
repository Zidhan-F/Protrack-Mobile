import axios from "axios";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

// Deteksi otomatis IP host dari Metro Bundler / Expo Go
const getHostIp = () => {
  // 1. Dari expoConfig.hostUri (Expo Router / modern config)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    return hostUri.split(":")[0];
  }

  // 2. Dari expoGoConfig.debuggerHost (Expo Go client)
  const debuggerHost = Constants.expoGoConfig?.debuggerHost;
  if (debuggerHost) {
    return debuggerHost.split(":")[0];
  }

  // 3. Dari manifest2 / manifest legacy
  const manifestHost =
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.manifest?.debuggerHost;
  if (manifestHost) {
    return manifestHost.split(":")[0];
  }

  // 4. Fallback IP Wi-Fi lokal
  return "10.113.254.2";
};

const hostIp = getHostIp();
const BASE_URL = `http://${hostIp}:8000/api`;

console.log("[ProTrack Mobile] Connecting to API:", BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 15000,
});

// Sisipkan token Sanctum pada setiap request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Token tidak valid / kadaluarsa -> paksa login ulang
let redirectingToLogin = false;
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const url = error.config?.url || "";
    const isAuthEndpoint = url.includes("/login") || url.includes("/register");

    if (error.response?.status === 401 && !isAuthEndpoint && !redirectingToLogin) {
      redirectingToLogin = true;
      await AsyncStorage.multiRemove(["token", "user"]);
      router.replace("/login");
      setTimeout(() => {
        redirectingToLogin = false;
      }, 1000);
    }

    return Promise.reject(error);
  }
);

export default api;
