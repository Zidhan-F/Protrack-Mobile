import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BarChart, PieChart } from "react-native-chart-kit";
import api from "../../src/services/api";
import colors from "../../src/styles/colors";

interface LatestSpk {
  id: number;
  no_spk: string;
  status: string;
  customer?: {
    nama_customer: string;
  };
  department?: {
    nama_bagian: string;
  };
}

const screenWidth = Dimensions.get("window").width;

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const [dashboard, setDashboard] = useState({
    totalSpk: 0,
    belumDiproses: 0,
    sedangDiproses: 0,
    menungguFinishing: 0,
    sedangFinishing: 0,
    selesai: 0,
    spkTerlambat: 0,
    deadlineBesok: 0,
    urgent: 0,
    statusChart: [] as number[],
    departmentChart: [] as number[],
    latestSpks: [] as LatestSpk[],
  });

  const loadDashboard = async () => {
    try {
      const [dashRes, notifRes] = await Promise.allSettled([
        api.get("/dashboard"),
        api.get("/notifications"),
      ]);

      if (dashRes.status === "fulfilled") {
        const d = dashRes.value.data;
        setDashboard({
          totalSpk: d.totalSpk ?? 0,
          belumDiproses: d.belumDiproses ?? 0,
          sedangDiproses: d.sedangDiproses ?? 0,
          menungguFinishing: d.menungguFinishing ?? 0,
          sedangFinishing: d.sedangFinishing ?? 0,
          selesai: d.selesai ?? 0,
          spkTerlambat: d.spkTerlambat ?? 0,
          deadlineBesok: d.deadlineBesok ?? 0,
          urgent: d.urgent ?? 0,
          statusChart: d.statusChart ?? [0, 0, 0, 0, 0, 0],
          departmentChart: d.departmentChart ?? [0, 0, 0, 0, 0],
          latestSpks: d.latestSpks ?? [],
        });
      }

      if (notifRes.status === "fulfilled") {
        setUnreadNotifications(notifRes.value.data.unread_count ?? 0);
      }
    } catch (err) {
      console.log("Dashboard load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Memuat data dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header with Notification Bell */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.brandTitle}>ProTrack</Text>
          <Text style={styles.brandSubtitle}>Monitoring Produksi Percetakan</Text>
        </View>

        <TouchableOpacity
          style={styles.notifButton}
          onPress={() => router.push("/notifications" as any)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Buka Notifikasi"
        >
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
          {unreadNotifications > 0 && (
            <View style={styles.notifBadge}>
              <Text style={styles.notifBadgeText}>
                {unreadNotifications > 99 ? "99+" : unreadNotifications}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Actionable Alerts (Deadline & Late) */}
      {dashboard.deadlineBesok > 0 && (
        <TouchableOpacity
          style={styles.warningBox}
          activeOpacity={0.8}
          onPress={() => router.push("/spk?deadline=besok")}
        >
          <View style={styles.alertIconWrap}>
            <Ionicons name="time-outline" size={20} color={colors.warning} />
          </View>
          <View style={styles.alertTextWrap}>
            <Text style={styles.alertHeading}>Perhatian Deadline Besok</Text>
            <Text style={styles.alertBody}>
              Terdapat {dashboard.deadlineBesok} SPK yang harus selesai besok.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.warning} />
        </TouchableOpacity>
      )}

      {dashboard.spkTerlambat > 0 && (
        <TouchableOpacity
          style={styles.dangerBox}
          activeOpacity={0.8}
          onPress={() => router.push("/spk?status=terlambat")}
        >
          <View style={styles.alertIconWrapDanger}>
            <Ionicons name="alert-circle-outline" size={20} color={colors.danger} />
          </View>
          <View style={styles.alertTextWrap}>
            <Text style={styles.alertHeadingDanger}>SPK Melewati Deadline</Text>
            <Text style={styles.alertBodyDanger}>
              Ada {dashboard.spkTerlambat} SPK yang telah melewati batas waktu produksi.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.danger} />
        </TouchableOpacity>
      )}

      {/* KPI Stat Cards Grid */}
      <Text style={styles.sectionTitle}>Ringkasan Produksi</Text>

      <View style={styles.statsGrid}>
        <StatCard
          label="Total SPK"
          count={dashboard.totalSpk}
          icon="folder-open-outline"
          accentColor={colors.primary}
          bgColor={colors.primaryLight}
          route="/spk"
        />
        <StatCard
          label="Belum Diproses"
          count={dashboard.belumDiproses}
          icon="hourglass-outline"
          accentColor={colors.textMuted}
          bgColor={colors.borderLight}
          route="/spk?status=belum_diproses"
        />
        <StatCard
          label="Sedang Diproses"
          count={dashboard.sedangDiproses}
          icon="sync-outline"
          accentColor={colors.primary}
          bgColor={colors.primaryLight}
          route="/spk?status=sedang_diproses"
        />
        <StatCard
          label="Tunggu Finishing"
          count={dashboard.menungguFinishing}
          icon="pause-circle-outline"
          accentColor={colors.warning}
          bgColor={colors.warningLight}
          route="/spk?status=menunggu_finishing"
        />
        <StatCard
          label="Sedang Finishing"
          count={dashboard.sedangFinishing}
          icon="construct-outline"
          accentColor={colors.info}
          bgColor={colors.infoLight}
          route="/spk?status=sedang_finishing"
        />
        <StatCard
          label="Selesai"
          count={dashboard.selesai}
          icon="checkmark-circle-outline"
          accentColor={colors.success}
          bgColor={colors.successLight}
          route="/spk?status=selesai"
        />
      </View>

      {/* Bar Chart: Status Produksi */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="bar-chart-outline" size={20} color={colors.primary} />
          <Text style={styles.cardTitle}>Status Alur Produksi</Text>
        </View>

        {dashboard.statusChart.reduce((a, b) => a + (b || 0), 0) > 0 ? (
          <BarChart
            width={screenWidth - 64}
            height={220}
            fromZero
            yAxisLabel=""
            yAxisSuffix=""
            data={{
              labels: ["Belum", "Proses", "Tunggu", "Finish", "Selesai", "Telat"],
              datasets: [
                {
                  data:
                    dashboard.statusChart.length === 6
                      ? dashboard.statusChart
                      : [0, 0, 0, 0, 0, 0],
                },
              ],
            }}
            chartConfig={{
              backgroundGradientFrom: colors.card,
              backgroundGradientTo: colors.card,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(15, 23, 42, ${opacity})`,
              propsForBackgroundLines: {
                stroke: colors.borderLight,
              },
              propsForLabels: {
                fontSize: 10,
                fontWeight: "600",
              },
            }}
            withInnerLines={true}
            showValuesOnTopOfBars={true}
            style={styles.chart}
          />
        ) : (
          <View style={styles.emptyChartWrap}>
            <Ionicons name="bar-chart-outline" size={32} color={colors.textMuted} />
            <Text style={styles.emptyChartText}>Belum ada data alur status produksi.</Text>
          </View>
        )}
      </View>

      {/* Pie Chart: Distribusi Departemen */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="pie-chart-outline" size={20} color={colors.primary} />
          <Text style={styles.cardTitle}>Distribusi Departemen</Text>
        </View>

        {dashboard.departmentChart.reduce((a, b) => a + (b || 0), 0) > 0 ? (
          <PieChart
            data={[
              {
                name: "Develop",
                population: dashboard.departmentChart[0] || 0,
                color: "#3B82F6",
                legendFontColor: colors.text,
                legendFontSize: 12,
              },
              {
                name: "Offset",
                population: dashboard.departmentChart[1] || 0,
                color: "#EC4899",
                legendFontColor: colors.text,
                legendFontSize: 12,
              },
              {
                name: "Plotter",
                population: dashboard.departmentChart[2] || 0,
                color: "#10B981",
                legendFontColor: colors.text,
                legendFontSize: 12,
              },
              {
                name: "UV",
                population: dashboard.departmentChart[3] || 0,
                color: "#F59E0B",
                legendFontColor: colors.text,
                legendFontSize: 12,
              },
              {
                name: "Finishing",
                population: dashboard.departmentChart[4] || 0,
                color: "#8B5CF6",
                legendFontColor: colors.text,
                legendFontSize: 12,
              },
            ]}
            width={screenWidth - 64}
            height={200}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            chartConfig={{
              backgroundGradientFrom: colors.card,
              backgroundGradientTo: colors.card,
              color: (opacity = 1) => `rgba(15, 23, 42, ${opacity})`,
            }}
          />
        ) : (
          <View style={styles.emptyChartWrap}>
            <Ionicons name="pie-chart-outline" size={32} color={colors.textMuted} />
            <Text style={styles.emptyChartText}>Belum ada data distribusi departemen.</Text>
          </View>
        )}
      </View>

      {/* Latest SPK List */}
      <View style={styles.card}>
        <View style={styles.cardHeaderBetween}>
          <View style={styles.cardHeader}>
            <Ionicons name="time-outline" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>SPK Terbaru</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/spk")}
            activeOpacity={0.7}
          >
            <Text style={styles.linkText}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        {dashboard.latestSpks.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>Belum ada data SPK yang tercatat.</Text>
          </View>
        ) : (
          dashboard.latestSpks.map((item, index) => {
            const badge = getStatusBadge(item.status);
            const isLast = index === dashboard.latestSpks.length - 1;

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.spkRow, isLast && { borderBottomWidth: 0 }]}
                activeOpacity={0.7}
                onPress={() => router.push(`/spk/detail/${item.id}`)}
              >
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.spkNo}>{item.no_spk}</Text>
                  <Text style={styles.spkCustomer} numberOfLines={1}>
                    {item.customer?.nama_customer || "Customer Umum"}
                  </Text>
                  <Text style={styles.spkDept}>
                    {item.department?.nama_bagian || "Tanpa Departemen"}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: badge.bg },
                  ]}
                >
                  <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                    {badge.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

function StatCard({ label, count, icon, accentColor, bgColor, route }: any) {
  return (
    <TouchableOpacity
      style={styles.statCard}
      activeOpacity={0.75}
      onPress={() => router.push(route)}
    >
      <View style={[styles.statIconCircle, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={20} color={accentColor} />
      </View>
      <Text style={styles.statCount}>{count}</Text>
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingTop: 54,
    paddingBottom: 36,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textMuted,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  notifButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  notifBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: colors.danger,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.card,
  },
  notifBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.warningLight,
    borderWidth: 1,
    borderColor: "#FDBA74",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  alertIconWrap: {
    marginRight: 10,
  },
  alertTextWrap: {
    flex: 1,
  },
  alertHeading: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.warning,
  },
  alertBody: {
    fontSize: 12,
    color: "#9A3412",
    marginTop: 2,
  },
  dangerBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  alertIconWrapDanger: {
    marginRight: 10,
  },
  alertHeadingDanger: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.danger,
  },
  alertBodyDanger: {
    fontSize: 12,
    color: "#991B1B",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  statCard: {
    width: "48%",
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statCount: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: "500",
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardHeaderBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  linkText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
  },
  chart: {
    marginTop: 10,
    borderRadius: 12,
    marginLeft: -10,
  },
  emptyWrap: {
    paddingVertical: 24,
    alignItems: "center",
  },
  emptyChartWrap: {
    paddingVertical: 36,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyChartText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  spkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  spkNo: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  spkCustomer: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  spkDept: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: "600",
    marginTop: 2,
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
});