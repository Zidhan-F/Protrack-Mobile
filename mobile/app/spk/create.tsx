import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import api from "../../src/services/api";
import colors from "../../src/styles/colors";

interface Customer {
  id: number;
  nama_customer: string;
}

interface Department {
  id: number;
  nama_bagian: string;
}

interface DetailItem {
  nama_file: string;
  bahan: string;
  finishing: string;
  panjang: string;
  lebar: string;
  qty: string;
}

interface FormData {
  customer_id: string;
  production_department_id: string;
  tanggal_spk: string;
  deadline_date: string;
  priority: string;
  keterangan: string;
}

export default function CreateSpk() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [deadline, setDeadline] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [customerMode, setCustomerMode] = useState<"manual" | "select">("manual");
  const [manualCustomer, setManualCustomer] = useState("");

  const [form, setForm] = useState<FormData>({
    customer_id: "",
    production_department_id: "",
    tanggal_spk: new Date().toISOString().split("T")[0],
    deadline_date: "",
    priority: "normal",
    keterangan: "",
  });

  const [details, setDetails] = useState<DetailItem[]>([
    {
      nama_file: "",
      bahan: "",
      finishing: "",
      panjang: "",
      lebar: "",
      qty: "1",
    },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [custRes, deptRes] = await Promise.all([
        api.get("/customers"),
        api.get("/departments"),
      ]);
      setCustomers(custRes.data || []);
      setDepartments(deptRes.data || []);

      if (custRes.data?.length > 0) {
        updateForm("customer_id", String(custRes.data[0].id));
      }
      if (deptRes.data?.length > 0) {
        updateForm("production_department_id", String(deptRes.data[0].id));
      }
    } catch (e) {
      console.log("Error loading customers/departments:", e);
    } finally {
      setLoading(false);
    }
  }

  function updateForm(key: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onDateSelected(selectedDate?: Date) {
    setShowDate(false);
    if (selectedDate) {
      setDeadline(selectedDate);
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const tanggal = `${year}-${month}-${day}`;

      updateForm("deadline_date", tanggal);

      const today = new Date();
      const diff = Math.ceil(
        (selectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      let priority = "normal";
      if (diff <= 1) priority = "urgent";
      else if (diff <= 3) priority = "high";

      updateForm("priority", priority);
    }
  }

  function updateDetail(index: number, key: keyof DetailItem, value: string) {
    const data = [...details];
    data[index][key] = value;
    setDetails(data);
  }

  function tambahItem() {
    setDetails([
      ...details,
      {
        nama_file: "",
        bahan: "",
        finishing: "",
        panjang: "",
        lebar: "",
        qty: "1",
      },
    ]);
  }

  function hapusItem(index: number) {
    if (details.length <= 1) {
      Alert.alert("Perhatian", "SPK minimal harus memiliki 1 rincian item.");
      return;
    }
    const data = [...details];
    data.splice(index, 1);
    setDetails(data);
  }

  async function handleSave() {
    let finalCustomerId: string | null = form.customer_id;
    let finalCustomerName: string | null = null;

    if (customerMode === "manual") {
      if (!manualCustomer.trim()) {
        Alert.alert("Perhatian", "Ketik nama pelanggan / customer terlebih dahulu.");
        return;
      }
      finalCustomerName = manualCustomer.trim();
      finalCustomerId = form.customer_id ? form.customer_id : null;
    } else {
      if (!form.customer_id) {
        Alert.alert("Perhatian", "Pilih customer dari daftar terlebih dahulu.");
        return;
      }
    }

    if (!form.production_department_id) {
      Alert.alert("Perhatian", "Pilih departemen produksi.");
      return;
    }
    if (!form.deadline_date) {
      Alert.alert("Perhatian", "Tentukan tanggal deadline SPK.");
      return;
    }

    const hasEmptyItem = details.some((d) => !d.nama_file.trim());
    if (hasEmptyItem) {
      Alert.alert("Perhatian", "Nama file pada rincian item wajib diisi.");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/spk/store", {
        ...form,
        customer_id: customerMode === "select" ? finalCustomerId : null,
        nama_customer: customerMode === "manual" ? finalCustomerName : null,
        details,
      });

      Alert.alert("Berhasil", "Surat Perintah Kerja (SPK) baru berhasil dibuat.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (e: any) {
      const msg =
        e.response?.data?.message || "Gagal menyimpan SPK. Periksa kembali form.";
      Alert.alert("Gagal Menyimpan", msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Memuat formulir SPK...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Kembali"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tambah SPK Baru</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Form Info SPK */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Informasi Dasar</Text>

          {/* Customer */}
          <View style={styles.fieldHeaderRow}>
            <Text style={styles.fieldLabel}>Pelanggan / Customer</Text>
            <View style={styles.modeToggleGroup}>
              <TouchableOpacity
                style={[
                  styles.modeToggleBtn,
                  customerMode === "manual" && styles.modeToggleBtnActive,
                ]}
                onPress={() => setCustomerMode("manual")}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="pencil-outline"
                  size={12}
                  color={customerMode === "manual" ? "#FFFFFF" : colors.textMuted}
                />
                <Text
                  style={[
                    styles.modeToggleText,
                    customerMode === "manual" && styles.modeToggleTextActive,
                  ]}
                >
                  Ketik Manual
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modeToggleBtn,
                  customerMode === "select" && styles.modeToggleBtnActive,
                ]}
                onPress={() => setCustomerMode("select")}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="list-outline"
                  size={12}
                  color={customerMode === "select" ? "#FFFFFF" : colors.textMuted}
                />
                <Text
                  style={[
                    styles.modeToggleText,
                    customerMode === "select" && styles.modeToggleTextActive,
                  ]}
                >
                  Pilih Daftar
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {customerMode === "manual" ? (
            <View style={{ marginBottom: 14 }}>
              <View style={styles.customerInputWrap}>
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={colors.primary}
                  style={styles.customerIcon}
                />
                <TextInput
                  placeholder="Ketik nama pelanggan / customer..."
                  placeholderTextColor={colors.textMuted}
                  style={styles.customerInput}
                  value={manualCustomer}
                  onChangeText={(val) => {
                    setManualCustomer(val);
                    const match = customers.find(
                      (c) => c.nama_customer.toLowerCase() === val.trim().toLowerCase()
                    );
                    if (match) {
                      updateForm("customer_id", String(match.id));
                    } else {
                      updateForm("customer_id", "");
                    }
                  }}
                  autoCapitalize="words"
                />
                {manualCustomer.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setManualCustomer("");
                      updateForm("customer_id", "");
                    }}
                    style={{ padding: 4 }}
                  >
                    <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              {manualCustomer.trim().length > 0 &&
                customers.filter(
                  (c) =>
                    c.nama_customer.toLowerCase().includes(manualCustomer.toLowerCase()) &&
                    c.nama_customer.toLowerCase() !== manualCustomer.trim().toLowerCase()
                ).length > 0 && (
                  <View style={styles.suggestionBox}>
                    <Text style={styles.suggestionTitle}>Saran pelanggan terdaftar:</Text>
                    <View style={styles.chipWrap}>
                      {customers
                        .filter((c) =>
                          c.nama_customer.toLowerCase().includes(manualCustomer.toLowerCase())
                        )
                        .slice(0, 4)
                        .map((c) => (
                          <TouchableOpacity
                            key={c.id}
                            style={styles.chip}
                            onPress={() => {
                              setManualCustomer(c.nama_customer);
                              updateForm("customer_id", String(c.id));
                            }}
                          >
                            <Ionicons name="add-circle-outline" size={13} color={colors.primary} />
                            <Text style={styles.chipText}>{c.nama_customer}</Text>
                          </TouchableOpacity>
                        ))}
                    </View>
                  </View>
                )}
            </View>
          ) : (
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={form.customer_id}
                onValueChange={(val) => updateForm("customer_id", val)}
              >
                <Picker.Item label="-- Pilih dari daftar pelanggan --" value="" />
                {customers.map((c) => (
                  <Picker.Item key={c.id} label={c.nama_customer} value={String(c.id)} />
                ))}
              </Picker>
            </View>
          )}

          {/* Department */}
          <Text style={styles.fieldLabel}>Departemen Produksi</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={form.production_department_id}
              onValueChange={(val) => updateForm("production_department_id", val)}
            >
              {departments.map((d) => (
                <Picker.Item key={d.id} label={d.nama_bagian} value={String(d.id)} />
              ))}
            </Picker>
          </View>

          {/* Deadline Picker */}
          <Text style={styles.fieldLabel}>Batas Waktu (Deadline)</Text>
          <TouchableOpacity
            style={styles.datePickerBtn}
            onPress={() => setShowDate(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={styles.datePickerText}>
              {form.deadline_date
                ? form.deadline_date
                : "Pilih tanggal deadline..."}
            </Text>
          </TouchableOpacity>

          {showDate && (
            <DateTimePicker
              value={deadline}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onValueChange={(_event, date) => onDateSelected(date)}
              onDismiss={() => setShowDate(false)}
              minimumDate={new Date()}
            />
          )}

          {/* Priority */}
          <Text style={styles.fieldLabel}>Prioritas Pengerjaan</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={form.priority}
              onValueChange={(val) => updateForm("priority", val)}
            >
              <Picker.Item label="Normal" value="normal" />
              <Picker.Item label="Tinggi (High)" value="high" />
              <Picker.Item label="Mendesak (Urgent)" value="urgent" />
            </Picker>
          </View>

          {/* Keterangan */}
          <Text style={styles.fieldLabel}>Catatan Tambahan (Opsional)</Text>
          <TextInput
            placeholder="Instruksi khusus pengerjaan..."
            placeholderTextColor={colors.textMuted}
            style={styles.textArea}
            value={form.keterangan}
            onChangeText={(val) => updateForm("keterangan", val)}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Dynamic Items */}
        <View style={styles.card}>
          <View style={styles.cardHeaderBetween}>
            <Text style={styles.cardHeader}>Rincian Item Produksi</Text>
            <TouchableOpacity
              style={styles.addItemBtn}
              onPress={tambahItem}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
              <Text style={styles.addItemBtnText}>Tambah Item</Text>
            </TouchableOpacity>
          </View>

          {details.map((item, index) => (
            <View key={index} style={styles.itemBox}>
              <View style={styles.itemBoxHeader}>
                <Text style={styles.itemBoxIndex}>Item #{index + 1}</Text>
                {details.length > 1 && (
                  <TouchableOpacity
                    onPress={() => hapusItem(index)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.subFieldLabel}>Nama File / Desain *</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: Banner_Promo.pdf"
                placeholderTextColor={colors.textMuted}
                value={item.nama_file}
                onChangeText={(val) => updateDetail(index, "nama_file", val)}
              />

              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.subFieldLabel}>Bahan</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Contoh: Flexi 280gr"
                    placeholderTextColor={colors.textMuted}
                    value={item.bahan}
                    onChangeText={(val) => updateDetail(index, "bahan", val)}
                  />
                </View>

                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.subFieldLabel}>Finishing</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Mata ayam / Lem"
                    placeholderTextColor={colors.textMuted}
                    value={item.finishing}
                    onChangeText={(val) => updateDetail(index, "finishing", val)}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <Text style={styles.subFieldLabel}>Panjang (cm)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={item.panjang}
                    onChangeText={(val) => updateDetail(index, "panjang", val)}
                  />
                </View>

                <View style={{ flex: 1, marginHorizontal: 6 }}>
                  <Text style={styles.subFieldLabel}>Lebar (cm)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={item.lebar}
                    onChangeText={(val) => updateDetail(index, "lebar", val)}
                  />
                </View>

                <View style={{ flex: 1, marginLeft: 6 }}>
                  <Text style={styles.subFieldLabel}>Qty</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="1"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={item.qty}
                    onChangeText={(val) => updateDetail(index, "qty", val)}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.saveBtn, submitting && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Simpan & Terbitkan SPK</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 14,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 14,
  },
  cardHeaderBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  addItemBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  addItemBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 6,
  },
  subFieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
    marginBottom: 4,
  },
  fieldHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  modeToggleGroup: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 2,
    gap: 4,
  },
  modeToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modeToggleBtnActive: {
    backgroundColor: colors.primary,
  },
  modeToggleText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textMuted,
  },
  modeToggleTextActive: {
    color: "#FFFFFF",
  },
  customerInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: colors.background,
  },
  customerIcon: {
    marginRight: 8,
  },
  customerInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    height: "100%",
  },
  suggestionBox: {
    marginTop: 6,
    paddingHorizontal: 2,
  },
  suggestionTitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
    fontWeight: "500",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginBottom: 14,
    backgroundColor: colors.background,
    overflow: "hidden",
  },
  datePickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 14,
    backgroundColor: colors.background,
  },
  datePickerText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.background,
    marginBottom: 10,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.background,
    textAlignVertical: "top",
    minHeight: 80,
  },
  itemBox: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  itemBoxHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  itemBoxIndex: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  formRow: {
    flexDirection: "row",
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 12,
    marginBottom: 20,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textMuted,
  },
});