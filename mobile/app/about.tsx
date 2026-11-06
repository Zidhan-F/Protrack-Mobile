import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import colors from "../src/styles/colors";

export default function About() {
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
        <Text style={styles.headerTitle}>Tentang Aplikasi</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* App Logo & Info */}
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Ionicons name="clipboard" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>ProTrack Mobile</Text>
          <Text style={styles.version}>Versi 1.0.0 (Expo Go Build)</Text>
        </View>

        {/* Description Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Deskripsi Sistem</Text>
          <Text style={styles.cardText}>
            ProTrack Mobile merupakan aplikasi monitoring alur kerja proses
            produksi percetakan. Aplikasi ini memudahkan tim operasional dan
            administrator dalam memantau status SPK secara langsung, melacak
            tahapan pengerjaan per departemen, serta mengunggah data produksi
            melalui file XML secara efisien.
          </Text>
        </View>

        {/* Development Team Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Tim Pengembang</Text>

          <View style={styles.memberRow}>
            <View style={styles.memberIconCircle}>
              <Ionicons name="person-outline" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.memberName}>Nayla Raina Nazhirah</Text>
              <Text style={styles.memberNim}>NIM 411231018</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.memberRow}>
            <View style={styles.memberIconCircle}>
              <Ionicons name="person-outline" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.memberName}>Brigita Juniati Mendrofa</Text>
              <Text style={styles.memberNim}>NIM 411231153</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.memberRow}>
            <View style={styles.memberIconCircle}>
              <Ionicons name="person-outline" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.memberName}>Muhammad Zidhan Fadillah</Text>
              <Text style={styles.memberNim}>NIM 411231016</Text>
            </View>
          </View>
        </View>
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
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 22,
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
  logoWrap: {
    alignItems: "center",
    marginVertical: 20,
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },
  version: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeading: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  cardText: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  memberIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  memberName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  memberNim: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 8,
  },
});