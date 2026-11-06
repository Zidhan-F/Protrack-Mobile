import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import api from "../../src/services/api";
import colors from "../../src/styles/colors";
import { getStoredUser, isAdmin } from "../../src/services/rbac";

interface Spk {
  id: number;
  no_spk: string;
  priority: string;
  status: string;
  deadline_date: string;
  customer?: {
    nama_customer: string;
  };
  department?: {
    nama_bagian: string;
  };
}

const FILTER_OPTIONS = [
  { label: "Semua", value: "" },
  { label: "Belum Diproses", value: "belum_diproses" },
  { label: "Sedang Diproses", value: "sedang_diproses" },
  { label: "Tunggu Finishing", value: "menunggu_finishing" },
  { label: "Sedang Finishing", value: "sedang_finishing" },
  { label: "Selesai", value: "selesai" },
  { label: "Terlambat", value: "terlambat" },
];

export default function SpkIndex() {
  const params = useLocalSearchParams();
  const [activeFilter, setActiveFilter] = useState<string>(
    (params.status as string) || ""
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState("");
  const [spks, setSpks] = useState<Spk[]>([]);
  const [role, setRole] = useState<string | undefined>(undefined);

  useEffect(() => {
    getStoredUser().then((u) => setRole(u?.role));
  }, []);

  const loadData = async (keyword = "", isSearching = false) => {
    if (isSearching) {
      setSearching(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await api.get("/spk", {
        params: {
          search: keyword,
          status: activeFilter || undefined,
          priority: params.priority || undefined,
          deadline: params.deadline || undefined,
          sort: "deadline_date",
          direction: "asc",
        },
      });

      setSpks(res.data.data ?? res.data ?? []);
    } catch (err) {
      console.log("Error loading SPK list:", err);
    } finally {
      setLoading(false);
      setSearching(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData(search);
    }, [activeFilter, params.priority, params.deadline])
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(search, true);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(search);
  };

  const getProgress = (status: string) => {
    switch (status) {
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
        return 50;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
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

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return { bg: colors.dangerLight, text: colors.danger, label: "URGENT" };
      case "high":
        return { bg: colors.warningLight, text: colors.warning, label: "TINGGI" };
      default:
        return { bg: colors.borderLight, text: colors.textMuted, label: "NORMAL" };
    }
  };

  const getRemainingInfo = (deadline: string) => {
    if (!deadline) return { text: "-", isUrgent: false };
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const end = new Date(deadline);
    end.setHours(0, 0, 0, 0);

    const diff = Math.floor((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diff > 1) return { text: `${diff} hari lagi`, isUrgent: false };
    if (diff === 1) return { text: "Besok", isUrgent: true };
    if (diff === 0) return { text: "Hari ini", isUrgent: true };
    return { text: `Lewat ${Math.abs(diff)} hari`, isUrgent: true };
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Data SPK</Text>
          <Text style={styles.headerSubtitle}>Surat Perintah Kerja Produksi</Text>
        </View>

        {isAdmin(role) && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/spk/create")}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Buat SPK Baru"
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Tambah</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Input */}
      <View style={styles.searchWrap}>
        <Ionicons
          name="search-outline"
          size={20}
          color={colors.textMuted}
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Cari no SPK, pelanggan, status..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearch("")}
            style={styles.clearSearchButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTER_OPTIONS.map((f) => {
            const isSelected = activeFilter === f.value;
            return (
              <TouchableOpacity
                key={f.value}
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipActive,
                ]}
                onPress={() => setActiveFilter(f.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List / Loading / Empty */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Memuat daftar SPK...</Text>
        </View>
      ) : (
        <FlatList
          data={spks}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name="document-text-outline"
                  size={42}
                  color={colors.textMuted}
                />
              </View>
              <Text style={styles.emptyTitle}>Tidak Ditemukan SPK</Text>
              <Text style={styles.emptySubtitle}>
                {search.length > 0
                  ? `Tidak ada data yang cocok dengan "${search}".`
                  : "Belum ada SPK untuk status yang dipilih."}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const progress = getProgress(item.status);
            const statusBadge = getStatusBadge(item.status);
            const priorityBadge = getPriorityBadge(item.priority);
            const remaining = getRemainingInfo(item.deadline_date);

            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => router.push(`/spk/detail/${item.id}`)}
              >
                {/* Top Row: SPK No & Priority */}
                <View style={styles.cardTopRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.spkNo}>{item.no_spk}</Text>
                    <Text style={styles.spkCustomer} numberOfLines={1}>
                      {item.customer?.nama_customer || "Customer Umum"}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: priorityBadge.bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        { color: priorityBadge.text },
                      ]}
                    >
                      {priorityBadge.label}
                    </Text>
                  </View>
                </View>

                {/* Info Rows */}
                <View style={styles.metaRow}>
                  <Ionicons
                    name="business-outline"
                    size={16}
                    color={colors.textMuted}
                  />
                  <Text style={styles.metaText}>
                    {item.department?.nama_bagian || "Tanpa Departemen"}
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={colors.textMuted}
                  />
                  <Text style={styles.metaText}>
                    Deadline: {item.deadline_date || "-"}
                  </Text>
                  <View
                    style={[
                      styles.remainingBadge,
                      remaining.isUrgent && styles.remainingBadgeUrgent,
                    ]}
                  >
                    <Text
                      style={[
                        styles.remainingText,
                        remaining.isUrgent && styles.remainingTextUrgent,
                      ]}
                    >
                      {remaining.text}
                    </Text>
                  </View>
                </View>

                {/* Status & Progress Bar */}
                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusBadge.bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        { color: statusBadge.text },
                      ]}
                    >
                      {statusBadge.label}
                    </Text>
                  </View>

                  <Text style={styles.progressPercent}>{progress}% Selesai</Text>
                </View>

                <View style={styles.progressBarTrack}>
                  <View
                    style={[styles.progressBarFill, { width: `${progress}%` }]}
                  />
                </View>

                {/* Actions */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.detailButton}
                    onPress={() => router.push(`/spk/detail/${item.id}`)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="eye-outline"
                      size={16}
                      color={colors.primary}
                    />
                    <Text style={styles.detailButtonText}>Detail SPK</Text>
                  </TouchableOpacity>

                  {isAdmin(role) && (
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => router.push(`/spk/edit/${item.id}`)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name="create-outline"
                        size={16}
                        color={colors.text}
                      />
                      <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 14,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 46,
    fontSize: 14,
    color: colors.text,
  },
  clearSearchButton: {
    padding: 6,
  },
  filterContainer: {
    marginVertical: 12,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted,
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  spkNo: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
  spkCustomer: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  metaText: {
    fontSize: 13,
    color: colors.text,
  },
  remainingBadge: {
    backgroundColor: colors.borderLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  remainingBadgeUrgent: {
    backgroundColor: colors.warningLight,
  },
  remainingText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "600",
  },
  remainingTextUrgent: {
    color: colors.warning,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 14,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  detailButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
  },
  detailButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.borderLight,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
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
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.borderLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
});