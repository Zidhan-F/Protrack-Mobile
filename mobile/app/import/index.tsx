import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import api from "../../src/services/api";
import colors from "../../src/styles/colors";

export default function ImportXML() {
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handlePickFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.length) return;

      const picked = result.assets[0];

      if (!picked.name.toLowerCase().endsWith(".xml")) {
        Alert.alert(
          "Format Tidak Didukung",
          "Silakan pilih file dengan ekstensi .xml (hasil export Accurate)."
        );
        return;
      }

      setFile(picked);
    } catch (e: any) {
      Alert.alert("Gagal Memilih File", e.message || "Terjadi kesalahan.");
    }
  }

  async function handleImport() {
    if (!file) {
      Alert.alert("Pilih File", "Silakan pilih file XML terlebih dahulu.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("xml_file", {
        uri: file.uri,
        name: file.name,
        type: "text/xml",
      } as any);

      const res = await api.post("/import-xml", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("Import Berhasil", res.data?.message || "Data XML berhasil di-import ke sistem SPK.", [
        {
          text: "Lihat Data SPK",
          onPress: () => router.push("/spk"),
        },
      ]);

      setFile(null);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Gagal memproses file XML. Pastikan struktur XML sesuai format Accurate.";
      Alert.alert("Gagal Import", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Import XML Accurate</Text>
        <Text style={styles.subtitle}>
          Unggah berkas Delivery Order XML dari software Accurate untuk generate data SPK dan item secara otomatis.
        </Text>
      </View>

      {/* Upload Box */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pilih Berkas XML</Text>

        <TouchableOpacity
          style={[styles.dropzone, file && styles.dropzoneActive]}
          onPress={handlePickFile}
          disabled={loading}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.iconCircle,
              file ? styles.iconCircleActive : styles.iconCircleDefault,
            ]}
          >
            <Ionicons
              name={file ? "document-attach" : "cloud-upload-outline"}
              size={32}
              color={file ? colors.primary : colors.textMuted}
            />
          </View>

          {file ? (
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>
                {file.name}
              </Text>
              <Text style={styles.fileMeta}>
                {file.size ? `${(file.size / 1024).toFixed(1)} KB` : "File XML terpilih"} • Ketuk untuk ganti
              </Text>
            </View>
          ) : (
            <View style={styles.fileInfo}>
              <Text style={styles.pickText}>Pilih File XML dari Perangkat</Text>
              <Text style={styles.pickSubtext}>
                Mendukung format .xml Delivery Order Accurate
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {file && (
          <TouchableOpacity
            style={styles.clearFileButton}
            onPress={() => setFile(null)}
            disabled={loading}
          >
            <Ionicons name="trash-outline" size={16} color={colors.danger} />
            <Text style={styles.clearFileText}>Batalkan pilihan file</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!file || loading) && styles.submitButtonDisabled,
          ]}
          onPress={handleImport}
          disabled={!file || loading}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Mulai Proses Import XML"
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Proses Import XML</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Guide Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Petunjuk Pengerjaan</Text>

        <View style={styles.stepRow}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <Text style={styles.stepText}>
            Export dokumen <Text style={{ fontWeight: "700" }}>Delivery Order</Text> dari Accurate ke format XML.
          </Text>
        </View>

        <View style={styles.stepRow}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <Text style={styles.stepText}>
            Pilih berkas tersebut melalui tombol area unggah di atas.
          </Text>
        </View>

        <View style={styles.stepRow}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <Text style={styles.stepText}>
            Sistem secara otomatis mendaftarkan pelanggan jika belum tersimpan di database.
          </Text>
        </View>

        <View style={styles.stepRow}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>4</Text>
          </View>
          <Text style={styles.stepText}>
            SPK baru beserta detail bahan, ukuran (panjang & lebar), serta kuantitas akan langsung dibuat.
          </Text>
        </View>
      </View>
    </ScrollView>
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
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 14,
  },
  dropzone: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  dropzoneActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  iconCircleDefault: {
    backgroundColor: colors.borderLight,
  },
  iconCircleActive: {
    backgroundColor: "#DBEAFE",
  },
  fileInfo: {
    alignItems: "center",
  },
  fileName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  fileMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  pickText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  pickSubtext: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: "center",
  },
  clearFileButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 10,
    paddingVertical: 6,
  },
  clearFileText: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: "600",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 12,
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginTop: 1,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
});