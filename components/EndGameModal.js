import React from "react";
import { Modal, View, StyleSheet, Text } from "react-native";
import BasicButton from "./BasicButton";
import { GameState } from '../types/updated_database';
import { useServices } from '../contexts/ServiceContext';
import { useAuth } from "../contexts/AuthContext.js";
import {SPACING, SIZES, COLORS} from "./theme.js";

export default function EndGameModal({
  visible,
  setModalVisible,
  navigation,
  sessionId,
  title = "End Game",
  description = "Are you sure you want to end the game?\nThis action cannot be undone.",
}) {

    const { sessionService } = useServices();
    const { user } = useAuth();
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
            <BasicButton text="Cancel" onPress={() => setModalVisible(false)} />
            <BasicButton text="End Game" onPress={async () => {
                console.log(sessionId);
                await sessionService.setGameState(sessionId, GameState.FINISHED, user.uid);
                setModalVisible(false);
                navigation.navigate("GameResultScreen");
            }} />
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
