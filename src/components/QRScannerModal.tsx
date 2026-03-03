import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Colors } from "@/src/constants/theme";

interface QRScannerModalProps {
  visible: boolean;
  title?: string;
  onScan: (data: string) => void;
  onClose: () => void;
}

export default function QRScannerModal({
  visible,
  title = "Scan QR Code",
  onScan,
  onClose,
}: QRScannerModalProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    onScan(data);
    // Reset scanned state after closing so it can scan again next time
    setTimeout(() => setScanned(false), 500);
  };

  const handleClose = () => {
    setScanned(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Camera or Permission Request */}
        <View style={styles.cameraContainer}>
          {!permission ? (
            <ActivityIndicator size="large" color={Colors.primary} />
          ) : !permission.granted ? (
            <View style={styles.permissionContainer}>
              <Ionicons
                name="camera-outline"
                size={64}
                color={Colors.textSecondary}
              />
              <Text style={styles.permissionTitle}>Camera Access Required</Text>
              <Text style={styles.permissionText}>
                We need camera access to scan QR codes for supplier and batch
                identification.
              </Text>
              <TouchableOpacity
                style={styles.permissionButton}
                onPress={requestPermission}
              >
                <Text style={styles.permissionButtonText}>
                  Grant Permission
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                barcodeScannerSettings={{
                  barcodeTypes: ["qr", "ean13", "ean8", "code128", "code39"],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              />
              {/* Overlay with cutout — positioned on top of camera, not as child */}
              <View
                style={[StyleSheet.absoluteFillObject, styles.overlay]}
                pointerEvents="none"
              >
                {/* Top */}
                <View style={styles.overlaySection} />
                {/* Middle Row */}
                <View style={styles.middleRow}>
                  <View style={styles.overlaySection} />
                  {/* Scanning Frame */}
                  <View style={styles.scanFrame}>
                    {/* Corner Markers */}
                    <View style={[styles.corner, styles.cornerTL]} />
                    <View style={[styles.corner, styles.cornerTR]} />
                    <View style={[styles.corner, styles.cornerBL]} />
                    <View style={[styles.corner, styles.cornerBR]} />
                  </View>
                  <View style={styles.overlaySection} />
                </View>
                {/* Bottom */}
                <View style={styles.overlaySection}>
                  <Text style={styles.instructionText}>
                    Position the QR code within the frame
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Manual Entry Hint */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={handleClose} style={styles.manualButton}>
            <Ionicons name="keypad-outline" size={20} color={Colors.primary} />
            <Text style={styles.manualButtonText}>Enter Manually Instead</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const FRAME_SIZE = 250;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  cameraContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  overlaySection: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
  middleRow: {
    flexDirection: "row",
    height: FRAME_SIZE,
  },
  scanFrame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    backgroundColor: "transparent",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: Colors.primary,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  instructionText: {
    color: "#ccc",
    fontSize: 14,
    marginTop: 24,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: "rgba(0,0,0,0.8)",
    alignItems: "center",
  },
  manualButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 12,
  },
  manualButtonText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },
  permissionContainer: {
    alignItems: "center",
    paddingHorizontal: 40,
  },
  permissionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
