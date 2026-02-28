import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { COLORS, SIZES } from "../components/theme";
import {
  Figtree_400Regular,
  Figtree_600SemiBold,
  useFonts,
} from "@expo-google-fonts/figtree";

// Mock session
const MOCK_SESSION = {
  sessionId: "Game3",
  sessionName: "Tech Trek",
  sessionCode: "Game3",
  gameState: "ACTIVE", // LOBBY | ACTIVE | FINISHED
  createdBy: "uid_thuan",
  startTime: new Date("2026-01-14T00:17:00").toISOString(),
  endTime: new Date("2026-01-14T03:16:00").toISOString(),
  participants: {
    uid_tokyo: { displayName: "Tokyo", points: 120 },
    uid_thuan: { displayName: "Thuan", points: 85 },
  },
  artifacts: {
    artifact_1: true,
    artifact_2: true,
    artifact_3: true,
  },
};

const MOCK_ARTIFACTS = [
  {
    id: "artifact_1",
    name: "Whistle",
    hint: "This iconic red-brick landmark at Georgia Tech features shining 'TECH' signs above. Just down its staircase lies a scenic lawn with brick pathways — a peaceful spot where students often pass by and unwind.",
  },
  {
    id: "artifact_2",
    name: "Band Uniform and Band Hat",
    hint: "A lively outdoor field where students run, play, and compete. Whether it's soccer, flag football, or a casual jog on the track, this multi-purpose space is always buzzing with activity.",
  },
  {
    id: "artifact_3",
    name: "2022 Original Blue Donkey (Blankey) cup",
    hint: "A cozy campus spot known for late-night study sessions and specialty drinks that fuel GT students through their toughest problem sets.",
  },
];

const CURRENT_USER = { uid: "uid_player_new", displayName: "Alex" };

function formatDate(iso) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const STATE_COLORS = {
  LOBBY:    { bg: COLORS.gold,  text: COLORS.navy },
  ACTIVE:   { bg: COLORS.navy,  text: COLORS.beige },
  FINISHED: { bg: COLORS.gray,  text: COLORS.navy },
};

export default function GamePreviewScreen({ navigation }) {
  const [fontsLoaded] = useFonts({ Figtree_400Regular, Figtree_600SemiBold });

  const [session, setSession] = useState(MOCK_SESSION);
  const [artifacts] = useState(MOCK_ARTIFACTS);
  const [hasJoined, setHasJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [toast, setToast] = useState(null);

  if (!fontsLoaded) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.navy} />
      </View>
    );
  }

  const isCreator = CURRENT_USER.uid === session.createdBy;
  const participants = Object.entries(session.participants).map(([uid, data]) => ({
    uid,
    ...data,
  }));

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleJoin() {
    setJoining(true);
    await new Promise((r) => setTimeout(r, 800));
    setHasJoined(true);
    setSession((prev) => ({
      ...prev,
      participants: {
        ...prev.participants,
        [CURRENT_USER.uid]: { displayName: CURRENT_USER.displayName, points: 0 },
      },
    }));
    setJoining(false);
    showToast("You joined the game!");
  }

  function handleLeave() {
    const updated = { ...session.participants };
    delete updated[CURRENT_USER.uid];
    setSession((prev) => ({ ...prev, participants: updated }));
    setHasJoined(false);
    showToast("You left the game.", "info");
  }

  function handleStartGame() {
    setSession((prev) => ({ ...prev, gameState: "ACTIVE" }));
    showToast("Game started! 🎉");
  }

  function handleEndGame() {
    setSession((prev) => ({ ...prev, gameState: "FINISHED" }));
    showToast("Game ended. Results are in.", "info");
  }

  function getButtonConfig() {
    if (isCreator) {
      if (session.gameState === "LOBBY")
        return { primary: { label: "Start Game", action: handleStartGame, color: COLORS.navy }, secondary: { label: "Cancel" } };
      if (session.gameState === "ACTIVE")
        return { primary: { label: "End Game", action: handleEndGame, color: COLORS.red }, secondary: { label: "Cancel" } };
      return { primary: null, secondary: { label: "Back to Games" } };
    }
    if (session.gameState === "LOBBY" && !hasJoined)
      return { primary: { label: "Join Game", action: handleJoin, color: COLORS.navy }, secondary: { label: "Cancel" } };
    if (session.gameState === "LOBBY" && hasJoined)
      return { primary: { label: "Waiting for Host…", disabled: true, color: COLORS.gray }, secondary: { label: "Cancel" }, leaveMsg: true };
    if (session.gameState === "ACTIVE" && !hasJoined)
      return { primary: { label: "Join Game", action: handleJoin, color: COLORS.navy }, secondary: { label: "Cancel" } };
    if (session.gameState === "ACTIVE" && hasJoined)
      return { primary: { label: "Go to Game →", action: () => navigation.replace("HomeScreen"), color: COLORS.navy }, secondary: { label: "Cancel" }, leaveMsg: true };
    return { primary: null, secondary: { label: "Back to Games" } };
  }

  const btnConfig = getButtonConfig();
  const stateStyle = STATE_COLORS[session.gameState] || STATE_COLORS.LOBBY;

  return (
    <SafeAreaView style={styles.root}>
      {/* Toast */}
      {toast && (
        <View style={[styles.toast, { backgroundColor: toast.type === "info" ? COLORS.navy : "#15803D" }]}>
          <Text style={styles.toastText}>{toast.msg}</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Game Preview</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Game Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Game Information</Text>
          {[
            ["Name",    session.sessionName],
            ["Code",    session.sessionCode],
            ["Creator", participants.find((p) => p.uid === session.createdBy)?.displayName || "—"],
            ["Start",   formatDate(session.startTime)],
            ["End",     formatDate(session.endTime)],
          ].map(([k, v]) => (
            <View key={k} style={styles.infoRow}>
              <Text style={styles.infoKey}>{k}</Text>
              <Text style={styles.infoVal}>{v}</Text>
            </View>
          ))}
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>Status</Text>
            <View style={[styles.badge, { backgroundColor: stateStyle.bg }]}>
              <Text style={[styles.badgeText, { color: stateStyle.text }]}>{session.gameState}</Text>
            </View>
          </View>
        </View>

        {/* Participants Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>
            Participants ({Object.keys(session.participants).length})
          </Text>
          {participants.map((p) => (
            <View key={p.uid} style={styles.participantRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {p.displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.participantName}>{p.displayName}</Text>
              {session.gameState !== "LOBBY" && (
                <Text style={styles.points}>{p.points} pts</Text>
              )}
            </View>
          ))}
        </View>

        {/* Artifacts Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Artifacts to Find ({artifacts.length})</Text>
          {artifacts.map((art, i) => (
            <View key={art.id} style={styles.artifactRow}>
              <View style={[styles.pinDot, { backgroundColor: i === 2 ? "#C05621" : COLORS.red }]} />
              <View style={styles.artifactContent}>
                <Text style={styles.artifactName}>{art.name}</Text>
                <Text style={styles.artifactHint}>💡 {art.hint}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Spacer so content clears the bottom bar */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom Action Area */}
      <View style={styles.bottomBar}>
        {btnConfig.leaveMsg && (
          <View style={styles.leaveMsgRow}>
            {hasJoined && <Text style={styles.leaveMsg}>You joined. </Text>}
            <TouchableOpacity onPress={handleLeave}>
              <Text style={styles.leaveLink}>Tap here to leave the game</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.btnRow}>
          {btnConfig.secondary && (
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.secondaryBtnText}>{btnConfig.secondary.label}</Text>
            </TouchableOpacity>
          )}
          {btnConfig.primary && (
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                {
                  backgroundColor: btnConfig.primary.disabled ? COLORS.gray : btnConfig.primary.color,
                  flex: btnConfig.secondary ? 1 : undefined,
                },
              ]}
              onPress={btnConfig.primary.disabled ? undefined : btnConfig.primary.action}
              disabled={btnConfig.primary.disabled || joining}
            >
              {joining ? (
                <ActivityIndicator color={COLORS.beige} />
              ) : (
                <Text style={styles.primaryBtnText}>{btnConfig.primary.label}</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.beige,
  },
  root: {
    flex: 1,
    backgroundColor: COLORS.beige,
  },
  toast: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
    zIndex: 999,
  },
  toastText: {
    color: COLORS.white,
    fontFamily: "Figtree_600SemiBold",
    fontSize: SIZES.body_small,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
    backgroundColor: COLORS.beige,
  },
  backBtn: {
    width: 32,
    alignItems: "center",
  },
  backBtnText: {
    fontSize: 32,
    color: COLORS.navy,
    lineHeight: 36,
  },
  headerTitle: {
    fontFamily: "Figtree_600SemiBold",
    fontSize: SIZES.heading,
    color: COLORS.navy,
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardLabel: {
    fontFamily: "Figtree_600SemiBold",
    fontSize: SIZES.body,
    color: COLORS.navy,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  infoKey: {
    fontFamily: "Figtree_600SemiBold",
    fontSize: SIZES.body_small,
    color: COLORS.navy,
    minWidth: 70,
  },
  infoVal: {
    fontFamily: "Figtree_400Regular",
    fontSize: SIZES.body_small,
    color: COLORS.navy,
    flexShrink: 1,
    textAlign: "right",
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontFamily: "Figtree_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.8,
  },
  participantRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.beige,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: "Figtree_600SemiBold",
    fontSize: SIZES.body_small,
    color: COLORS.navy,
  },
  participantName: {
    flex: 1,
    fontFamily: "Figtree_400Regular",
    fontSize: SIZES.body_small,
    color: COLORS.navy,
  },
  points: {
    fontFamily: "Figtree_600SemiBold",
    fontSize: SIZES.body_small,
    color: COLORS.navy,
  },
  artifactRow: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
  },
  pinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 3,
    flexShrink: 0,
  },
  artifactContent: {
    flex: 1,
  },
  artifactName: {
    fontFamily: "Figtree_600SemiBold",
    fontSize: SIZES.body_small,
    color: COLORS.navy,
    marginBottom: 4,
  },
  artifactHint: {
    fontFamily: "Figtree_400Regular",
    fontSize: 12,
    color: COLORS.navy,
    lineHeight: 18,
  },
  bottomBar: {
    backgroundColor: COLORS.beige,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
  },
  leaveMsgRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  leaveMsg: {
    fontFamily: "Figtree_400Regular",
    fontSize: 12,
    color: COLORS.navy,
  },
  leaveLink: {
    fontFamily: "Figtree_400Regular",
    fontSize: 12,
    color: "#2563EB",
    textDecorationLine: "underline",
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: COLORS.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontFamily: "Figtree_600SemiBold",
    fontSize: SIZES.body_small,
    color: COLORS.navy,
  },
  primaryBtn: {
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    fontFamily: "Figtree_600SemiBold",
    fontSize: SIZES.body_small,
    color: COLORS.beige,
  },
});
