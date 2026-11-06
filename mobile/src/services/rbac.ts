import AsyncStorage from "@react-native-async-storage/async-storage";

export type Role =
  | "admin"
  | "develop"
  | "offset"
  | "plotter"
  | "uv"
  | "finishing";

export interface StoredUser {
  id?: number;
  name?: string;
  email?: string;
  role?: Role | string;
  role_label?: string;
  department_id?: number | null;
}

export const ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  develop: "Operator Develop",
  offset: "Operator Offset",
  plotter: "Operator Plotter",
  uv: "Operator UV",
  finishing: "Operator Finishing",
};

export const ALL_STATUSES = [
  { value: "belum_diproses", label: "Belum Diproses" },
  { value: "sedang_diproses", label: "Sedang Diproses" },
  { value: "menunggu_finishing", label: "Menunggu Finishing" },
  { value: "sedang_finishing", label: "Sedang Finishing" },
  { value: "selesai", label: "Selesai" },
  { value: "terlambat", label: "Terlambat" },
];

// Harus sama dengan User::allowedStatuses() di backend.
export function allowedStatuses(role?: string): string[] {
  if (role === "admin") return ALL_STATUSES.map((s) => s.value);
  if (role === "finishing") return ["sedang_finishing", "selesai"];
  if (role && role in ROLE_LABELS) return ["sedang_diproses", "selesai"];
  return [];
}

export const isAdmin = (role?: string) => role === "admin";

export async function getStoredUser(): Promise<StoredUser | null> {
  try {
    const raw = await AsyncStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
