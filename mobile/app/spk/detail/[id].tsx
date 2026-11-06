import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import api from "../../../src/services/api";
import colors from "../../../src/styles/colors";
import {
  ALL_STATUSES,
  allowedStatuses,
  getStoredUser,
  isAdmin,
} from "../../../src/services/rbac";

export default function DetailSPK() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [spk, setSpk] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [role, setRole] = useState<string | undefined>(undefined);

  useEffect(() => {
    getStoredUser().then((u) => setRole(u?.role));
  }, []);

  useEffect(() => {
    loadDetail();
  }, [id]);

  async function loadDetail() {
    setLoading(true);
    try {
      const res = await api.get(`/spk/${String(id)}`);
      setSpk(res.data);
      setStatus(res.data.status);
    } catch (err: any) {
      console.log("Error loading SPK detail:", err);
      Alert.alert("Gagal", "Tidak dapat memuat detail SPK.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus() {
    if (!status) return;

    try {
      setUpdating(true);
      const res = await api.post(`/spk/${id}/update-status`, { status });
      Alert.alert("Berhasil", res.data.message || "Status berhasil diperbarui.");
      loadDetail();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Status gagal diperbarui.";
      Alert.alert("Gagal", msg);
    } finally {
      setUpdating(false);
    }
  }

  function getProgress() {
    if (!spk) return 0;
    switch (spk.status) {
      case "belum_diproses":
        return 0;
      case "sedang_diproses":
        return 50;
      case "menunggu_finishing":
        return 75;
      case "sedang_finishing":
        return 90;
      case "selesai":
        return 100;
      default:
        return 0;
    }
  }

  const getStatusBadge = (statusName: string) => {
    switch (statusName) {
      case "selesai":
        return { bg: colors.successLight, text: colors.success, label: "Selesai" };
      case "terlambat":
        return { bg: colors.dangerLight, text: colors.danger, label: "Terlambat" };
      case "sedang_diproses":
        return { bg: colors.primaryLight, text: colors.primary, label: "Diproses" };
      case "menunggu_finishing":
        return { bg: colors.warningLight, text: colors.warning, label: "Tunggu Finishing" };
      case "sedang_finishing":
        return { bg: colors.infoLight, text: colors.info, label: "Finishing" };
      default:
        return { bg: colors.borderLight, text: colors.textMuted, label: "Belum Diproses" };
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Memuat detail SPK...</Text>
      </View>
    );
  }

  if (!spk) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Data SPK tidak ditemukan.</Text>
        <TouchableOpacity style={styles.backHomeBtn} onPress={() => router.back()}>
          <Text style={styles.backHomeBtnText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const progress = getProgress();
  const currentBadge = getStatusBadge(spk.status);

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

        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Rincian SPK</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {spk.no_spk}
          </Text>
        </View>

        {isAdmin(role) ? (
          <TouchableOpacity
            style={styles.editHeaderButton}
            onPress={() => router.push(`/spk/edit/${spk.id}`)}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.editHeaderButton} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress & Current Status Card */}
        <View style={styles.card}>
          <View style={styles.progressTop}>
            <View>
              <Text style={styles.cardHeader}>Progress Pengerjaan</Text>
              <Text style={styles.progressPercent}>{progress}% Selesai</Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                { backgroundColor: currentBadge.bg },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: currentBadge.text },
                ]}
              >
                {currentBadge.label}
              </Text>
            </View>
          </View>

          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* SPK Overview Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Informasi SPK</Text>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Nomor SPK</Text>
            <Text style={styles.valueStrong}>{spk.no_spk}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.label}>Pelanggan</Text>
            <Text style={styles.value}>
              {spk.customer?.nama_customer || "-"}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.label}>Departemen</Text>
            <Text style={styles.value}>
              {spk.department?.nama_bagian || "-"}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.label}>Tanggal Pembuatan</Text>
            <Text style={styles.value}>{spk.tanggal_spk || "-"}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.label}>Batas Waktu (Deadline)</Text>
            <Text
              style={[
                styles.value,
                spk.status === "terlambat" && { color: colors.danger, fontWeight: "700" },
              ]}
            >
              {spk.deadline_date || "-"}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.label}>Prioritas</Text>
            <Text style={[styles.value, { textTransform: "uppercase" }]}>
              {spk.priority || "NORMAL"}
            </Text>
          </View>

          {spk.keterangan ? (
            <>
              <View style={styles.divider} />
              <View style={{ paddingTop: 8 }}>
                <Text style={styles.label}>Catatan Tambahan</Text>
                <Text style={styles.keteranganText}>{spk.keterangan}</Text>
              </View>
            </>
          ) : null}
        </View>

        {/* Items List */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>
            Detail Item Produksi ({spk.details?.length || 0})
          </Text>

          {spk.details?.length > 0 ? (
            spk.details.map((item: any, idx: number) => (
              <View
                key={item.id || idx}
                style={[
                  styles.itemCard,
                  idx === spk.details.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <View style={styles.itemHeader}>
                  <Ionicons
                    name="document-outline"
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={styles.itemFileName} numberOfLines={1}>
                    {item.nama_file || `Item #${idx + 1}`}
                  </Text>
                  <View style={styles.qtyBadge}>
                    <Text style={styles.qtyBadgeText}>Qty: {item.qty}</Text>
                  </View>
                </View>

                <View style={styles.itemMetaGrid}>
                  <Text style={styles.itemMetaText}>
                    <Text style={{ color: colors.textMuted }}>Bahan: </Text>
                    {item.bahan || "-"}
                  </Text>
                  <Text style={styles.itemMetaText}>
                    <Text style={{ color: colors.textMuted }}>Ukuran: </Text>
                    {item.panjang} x {item.lebar} cm
                  </Text>
                  {item.finishing ? (
                    <Text style={styles.itemMetaText}>
                      <Text style={{ color: colors.textMuted }}>Finishing: </Text>
                      {item.finishing}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Tidak ada item rincian.</Text>
          )}
        </View>

        {/* Update Status Action Card (hanya jika role punya status yang boleh diubah) */}
        {allowedStatuses(role).length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Pembaruan Status</Text>
          <Text style={styles.cardSubtitle}>
            Ubah status untuk mengupdate progress produksi dan mencatat riwayat log.
          </Text>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={status}
              onValueChange={(val) => setStatus(val)}
              enabled={!updating}
            >
              {ALL_STATUSES.filter(
                (s) =>
                  s.value === spk.status ||
                  allowedStatuses(role).includes(s.value)
              ).map((s) => (
                <Picker.Item key={s.value} label={s.label} value={s.value} />
              ))}
            </Picker>
          </View>

          <TouchableOpacity
            style={[
              styles.updateBtn,
              (updating || status === spk.status) && styles.updateBtnDisabled,
            ]}
            onPress={updateStatus}
            disabled={updating || status === spk.status}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Simpan Perubahan Status"
          >
            {updating ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="save-outline" size={18} color="#FFFFFF" />
                <Text style={styles.updateBtnText}>Simpan Status</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        )}

        {/* Progress History Logs */}
        {spk.progress_logs?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Riwayat Perubahan Status</Text>

            {spk.progress_logs.map((log: any, index: number) => {
              const isLast = index === spk.progress_logs.length - 1;
              return (
                <View key={log.id || index} style={styles.timelineRow}>
                  <View style={styles.timelineTrack}>
                    <View style={styles.timelineDot} />
                    {!isLast && <View style={styles.timelineLine} />}
                  </View>

                  <View style={styles.timelineContent}>
                    <Text style={styles.logStatus}>
                      Status: {log.new_status?.replaceAll("_", " ")}
                    </Text>
                    {log.catatan && (
                      <Text style={styles.logNote}>{log.catatan}</Text>
                    )}
                    <Text style={styles.logTime}>
                      {log.created_at ? new Date(log.created_at).toLocaleString("id-ID") : "-"}
                      {log.user?.name ? ` • oleh ${log.user.name}` : ""}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
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
  headerTitleWrap: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  editHeaderButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 12,
  },
  progressTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 4,
  },
  label: {
    fontSize: 13,
    color: colors.textMuted,
  },
  value: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  valueStrong: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },
  keteranganText: {
    fontSize: 13,
    color: colors.text,
    marginTop: 4,
    lineHeight: 18,
  },
  itemCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  itemFileName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  qtyBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  qtyBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },
  itemMetaGrid: {
    gap: 2,
    paddingLeft: 26,
  },
  itemMetaText: {
    fontSize: 12,
    color: colors.text,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.background,
    overflow: "hidden",
    marginBottom: 12,
  },
  updateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  updateBtnDisabled: {
    opacity: 0.5,
  },
  updateBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  timelineRow: {
    flexDirection: "row",
    paddingVertical: 6,
  },
  timelineTrack: {
    alignItems: "center",
    width: 24,
    marginRight: 10,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  logStatus: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
    textTransform: "capitalize",
  },
  logNote: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  logTime: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textMuted,
  },
  errorText: {
    fontSize: 15,
    color: colors.danger,
    marginBottom: 14,
  },
  backHomeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  backHomeBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    paddingVertical: 8,
  },
});