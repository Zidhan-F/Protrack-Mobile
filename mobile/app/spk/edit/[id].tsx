import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "../../../src/services/api";
import colors from "../../../src/styles/colors";

interface DetailItem {
  id?: number;
  nama_file: string;
  bahan: string;
  finishing: string;
  panjang: string | number;
  lebar: string | number;
  qty: string | number;
}

export default function EditSpk() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [deadline, setDeadline] = useState(new Date());

  const [form, setForm] = useState({
    no_spk: "",
    deadline_date: "",
    priority: "normal",
  });

  const [details, setDetails] = useState<DetailItem[]>([]);
  const [newItems, setNewItems] = useState<DetailItem[]>([]);

  useEffect(() => {
    getDetail();
  }, [id]);

  async function getDetail() {
    try {
      const res = await api.get(`/spk/${id}`);
      const data = res.data;

      setForm({
        no_spk: data.no_spk || "",
        deadline_date: data.deadline_date || "",
        priority: data.priority || "normal",
      });

      if (data.deadline_date) {
        setDeadline(new Date(data.deadline_date));
      }

      setDetails(data.details || []);
    } catch (e) {
      console.log("Error loading SPK for edit:", e);
      Alert.alert("Gagal Memuat", "Tidak dapat mengambil data SPK untuk diedit.");
    } finally {
      setLoading(false);
    }
  }

  function onDateSelected(selectedDate?: Date) {
    setShowDate(false);
    if (!selectedDate) return;

    setDeadline(selectedDate);

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const tanggal = `${year}-${month}-${day}`;

    const diffDays = Math.floor(
      (new Date(tanggal).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) /
        86400000
    );

    const autoPriority =
      diffDays <= 1 ? "urgent" : diffDays <= 3 ? "high" : "normal";

    setForm((prev) => ({
      ...prev,
      deadline_date: tanggal,
      priority: autoPriority,
    }));
  }

  function updateDetail(index: number, key: keyof DetailItem, value: any) {
    const data = [...details];
    data[index] = { ...data[index], [key]: value };
    setDetails(data);
  }

  function tambahItem() {
    setNewItems([
      ...newItems,
      {
        nama_file: "",
        bahan: "",
        panjang: "",
        lebar: "",
        qty: "1",
        finishing: "",
      },
    ]);
  }

  function updateNewItem(index: number, key: keyof DetailItem, value: any) {
    const data = [...newItems];
    data[index] = { ...data[index], [key]: value };
    setNewItems(data);
  }

  function hapusItemBaru(index: number) {
    const data = [...newItems];
    data.splice(index, 1);
    setNewItems(data);
  }

  function hapusDetail(detailId?: number) {
    if (!detailId) return;

    Alert.alert(
      "Konfirmasi Hapus",
      "Apakah Anda yakin ingin menghapus item produksi ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/spk-detail/${detailId}`);
              await getDetail();
            } catch (e) {
              Alert.alert("Gagal", "Tidak dapat menghapus item produksi.");
            }
          },
        },
      ]
    );
  }

  async function simpan() {
    if (!form.deadline_date) {
      Alert.alert("Perhatian", "Tanggal deadline wajib diisi.");
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/spk/${id}/update`, {
        deadline_date: form.deadline_date,
        priority: form.priority,
        details,
        newItems,
      });

      Alert.alert("Berhasil", "Perubahan SPK berhasil disimpan.", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (e: any) {
      const msg =
        e.response?.data?.message || "Gagal memperbarui data SPK. Silakan coba lagi.";
      Alert.alert("Gagal Menyimpan", msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Memuat data SPK...</Text>
      </View>
    );
  }

  const priorityMeta =
    form.priority === "urgent"
      ? { bg: colors.dangerLight, text: colors.danger, label: "URGENT (<= 1 Hari)" }
      : form.priority === "high"
      ? { bg: colors.warningLight, text: colors.warning, label: "HIGH (<= 3 Hari)" }
      : { bg: colors.successLight, text: colors.success, label: "NORMAL" };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Kembali"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Edit SPK</Text>
          <Text style={styles.headerSubtitle}>{form.no_spk}</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Card: Informasi Utama */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informasi SPK</Text>

          <Text style={styles.label}>Nomor SPK</Text>
          <View style={styles.inputDisabledWrap}>
            <Ionicons name="document-text-outline" size={18} color={colors.textMuted} />
            <Text style={styles.inputDisabledText}>{form.no_spk}</Text>
          </View>

          <Text style={styles.label}>Tanggal Deadline</Text>
          <TouchableOpacity
            style={styles.dateSelector}
            onPress={() => setShowDate(true)}
            accessibilityRole="button"
            accessibilityLabel="Pilih tanggal deadline"
          >
            <View style={styles.dateTextWrap}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={styles.dateText}>
                {form.deadline_date || "Pilih tanggal deadline"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          {showDate && (
            <DateTimePicker
              value={deadline}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onValueChange={(_event, date) => onDateSelected(date)}
              onDismiss={() => setShowDate(false)}
            />
          )}

          <Text style={styles.label}>Prioritas Pengerjaan</Text>
          <View style={[styles.priorityBadge, { backgroundColor: priorityMeta.bg }]}>
            <Ionicons name="flash" size={16} color={priorityMeta.text} />
            <Text style={[styles.priorityText, { color: priorityMeta.text }]}>
              {priorityMeta.label}
            </Text>
          </View>
          <Text style={styles.priorityHint}>
            Prioritas dihitung otomatis berdasarkan sisa hari menuju deadline.
          </Text>
        </View>

        {/* Card: Rincian Item yang Ada */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Rincian Item Produksi</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{details.length} item</Text>
            </View>
          </View>

          {details.length === 0 ? (
            <Text style={styles.emptyItemText}>
              Tidak ada rincian item. Tambahkan item di bawah.
            </Text>
          ) : (
            details.map((item, index) => (
              <View key={item.id ?? index} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemIndexWrap}>
                    <Text style={styles.itemIndexText}>#{index + 1}</Text>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                      {item.nama_file || "Item Tanpa Nama"}
                    </Text>
                  </View>
                  {item.id && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => hapusDetail(item.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Hapus item ${index + 1}`}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.danger} />
                      <Text style={styles.deleteButtonText}>Hapus</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={styles.subLabel}>Nama File</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: Banner_Promo_1x2.pdf"
                  placeholderTextColor={colors.textMuted}
                  value={item.nama_file}
                  onChangeText={(v) => updateDetail(index, "nama_file", v)}
                />

                <Text style={styles.subLabel}>Bahan</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: Flexi 280gr / Albatros"
                  placeholderTextColor={colors.textMuted}
                  value={item.bahan}
                  onChangeText={(v) => updateDetail(index, "bahan", v)}
                />

                <Text style={styles.subLabel}>Finishing</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: Mata ayam 4 sisi / Selongsong"
                  placeholderTextColor={colors.textMuted}
                  value={item.finishing}
                  onChangeText={(v) => updateDetail(index, "finishing", v)}
                />

                <View style={styles.row}>
                  <View style={styles.half}>
                    <Text style={styles.subLabel}>Panjang (cm)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      value={String(item.panjang ?? "")}
                      onChangeText={(v) => updateDetail(index, "panjang", v)}
                    />
                  </View>
                  <View style={styles.half}>
                    <Text style={styles.subLabel}>Lebar (cm)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      value={String(item.lebar ?? "")}
                      onChangeText={(v) => updateDetail(index, "lebar", v)}
                    />
                  </View>
                </View>

                <Text style={styles.subLabel}>Jumlah (Qty)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={String(item.qty ?? "")}
                  onChangeText={(v) => updateDetail(index, "qty", v)}
                />
              </View>
            ))
          )}
        </View>

        {/* Card: Tambah Item Baru */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Item Tambahan Baru</Text>
              <Text style={styles.sectionSubtitle}>
                Tambahkan item bila ada spesifikasi tambahan
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={tambahItem}
              accessibilityRole="button"
              accessibilityLabel="Tambah item baru"
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Item</Text>
            </TouchableOpacity>
          </View>

          {newItems.length === 0 ? (
            <View style={styles.emptyNewItemWrap}>
              <Ionicons name="add-circle-outline" size={28} color={colors.textMuted} />
              <Text style={styles.emptyNewItemText}>
                Belum ada item baru ditambahkan. Tekan tombol &quot;+ Item&quot; di atas jika
                ada penambahan item produksi.
              </Text>
            </View>
          ) : (
            newItems.map((item, index) => (
              <View key={`new-${index}`} style={styles.newItemCard}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemIndexWrap}>
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>Baru</Text>
                    </View>
                    <Text style={styles.itemTitle}>Item #{index + 1}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => hapusItemBaru(index)}
                    accessibilityRole="button"
                    accessibilityLabel={`Batalkan item baru ${index + 1}`}
                  >
                    <Ionicons name="close-circle-outline" size={18} color={colors.danger} />
                    <Text style={styles.deleteButtonText}>Batal</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.subLabel}>Nama File</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: Brosur_A4.pdf"
                  placeholderTextColor={colors.textMuted}
                  value={item.nama_file}
                  onChangeText={(v) => updateNewItem(index, "nama_file", v)}
                />

                <Text style={styles.subLabel}>Bahan</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: Art Paper 150gr"
                  placeholderTextColor={colors.textMuted}
                  value={item.bahan}
                  onChangeText={(v) => updateNewItem(index, "bahan", v)}
                />

                <Text style={styles.subLabel}>Finishing</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: Laminasi Doff"
                  placeholderTextColor={colors.textMuted}
                  value={item.finishing}
                  onChangeText={(v) => updateNewItem(index, "finishing", v)}
                />

                <View style={styles.row}>
                  <View style={styles.half}>
                    <Text style={styles.subLabel}>Panjang (cm)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      value={String(item.panjang)}
                      onChangeText={(v) => updateNewItem(index, "panjang", v)}
                    />
                  </View>
                  <View style={styles.half}>
                    <Text style={styles.subLabel}>Lebar (cm)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="0"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      value={String(item.lebar)}
                      onChangeText={(v) => updateNewItem(index, "lebar", v)}
                    />
                  </View>
                </View>

                <Text style={styles.subLabel}>Jumlah (Qty)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={String(item.qty)}
                  onChangeText={(v) => updateNewItem(index, "qty", v)}
                />
              </View>
            ))
          )}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.saveButton, submitting && styles.buttonDisabled]}
          onPress={simpan}
          disabled={submitting}
          accessibilityRole="button"
          accessibilityLabel="Simpan Perubahan SPK"
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 54 : 44,
    paddingBottom: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22,
  },
  headerTitleWrap: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
    marginTop: 2,
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
    marginTop: 12,
    marginBottom: 6,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textMuted,
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    minHeight: 44,
  },
  inputDisabledWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.borderLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    minHeight: 44,
    gap: 8,
  },
  inputDisabledText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    minHeight: 46,
  },
  dateTextWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primaryDark,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "700",
  },
  priorityHint: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 6,
    lineHeight: 16,
  },
  countBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  emptyItemText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    paddingVertical: 16,
  },
  itemCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemIndexWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  itemIndexText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
    flexShrink: 1,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minHeight: 32,
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.danger,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  half: {
    flex: 1,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minHeight: 36,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyNewItemWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.background,
    gap: 8,
  },
  emptyNewItemText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
  newItemCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  newBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  saveButton: {
    backgroundColor: colors.primary,
    minHeight: 52,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});