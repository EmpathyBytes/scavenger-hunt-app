import React from "react";
import { Modal, View, StyleSheet, Text } from "react-native";
import BasicButton from "./BasicButton";
import { SIZES, SPACING, COLORS } from "./theme";

export default function LocationModal({
  visible,
  setModalVisible,
  title = "Location found!",
  description = "More information about the location will appear here.",
}) {
  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalDescription}>{description}</Text>
          <BasicButton text="Close" onPress={() => setModalVisible(false)} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: COLORS.beige,
    padding: SPACING.xl,
    borderRadius: SIZES.radius_container,
    width: "80%",
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: SIZES.heading,
    fontWeight: "600",
    marginBottom: SPACING.md,
  },
  modalDescription: {
    fontSize: SIZES.body,
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
});
