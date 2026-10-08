import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Image, Text, View, StyleSheet, TextInput, ActivityIndicator,
  FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { COLORS, SIZES, SPACING } from '../components/theme';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree';
import BasicButton from '../components/BasicButton';
import Input from '../components/Input';
import BackButton from '../components/BackButton';
import { useAuth } from '../contexts/AuthContext';
import { useServices } from '../contexts/ServiceContext';

// Updates the 'Just Now' portion
const timeAgo = (date) => {
  if (!date) return 'Just now';
  const now = Date.now();
  const ts = date?.toDate ? date.toDate().getTime() : new Date(date).getTime();
  const diff = Math.floor((now - ts) / 1000);
  if (diff < 10) return 'Just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
};

const JoinSessionScreen = ({ navigation }) => {
  const { user, isAuthenticated } = useAuth();
  const { userService, sessionService } = useServices();

  const [fontsLoaded] = useFonts({ Figtree_400Regular, Figtree_600SemiBold });

  // ── UI state ──────────────────────────────────────────────────────
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [sessionCode, setSessionCode] = useState('');
  const inputRef = useRef(null);

  // ── Data state ────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);           // initial auth/user load
  const [userData, setUserData] = useState(null);
  const [availableGames, setAvailableGames] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // ── Join-via-code state ───────────────────────────────────────────
  const [joiningSession, setJoiningSession] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // ── Auth guard + initial user fetch ──────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      navigation.reset({ index: 0, routes: [{ name: 'WelcomeScreen' }] });
      return;
    }

    const fetchUserData = async () => {
      try {
        if (user?.uid) {
          const data = await userService.getUser(user.uid);
          setUserData(data);
          if (data?.currentSession) {
            navigation.replace('HomeScreen');
            return;
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, user, navigation, userService]);

  // Displays game sessions ordered by creation date
  const fetchAvailableGames = useCallback(async () => {
    try {
      // sessionService.getAvailableSessions() should return an array of
      // session objects: { id, sessionName, isActive, playerCount, ... }
      const sessions = await sessionService.getAvailableSessions();
      setAvailableGames(sessions || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching available games:', err);
    }
  }, [sessionService]);

  // Fetch games once user data is loaded (and on every refresh)
  useEffect(() => {
    if (!loading) {
      fetchAvailableGames();
    }
  }, [loading, fetchAvailableGames]);

  // Test listener (should update live now in addition to current features)
  useEffect(() => {
    const unsubscribe = sessionService.subscribeToSessions(setAvailableGames);
    return unsubscribe;
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAvailableGames();
    setRefreshing(false);
  };

  // ── Enter-code flow ───────────────────────────────────────────────
  const handleEnterCodePress = () => {
    setShowCodeInput(true);
    setErrorMessage('');
    setSessionCode('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleFocus = () => setErrorMessage('');

  const handleJoinSession = async () => {
    console.log("Joining session in JoinSessionScreen");
    setErrorMessage('');

    if (!sessionCode.trim()) {
      setErrorMessage('Please enter a session code');
      return;
    }

    if (userData?.currentSession === sessionCode) {
      navigation.replace('HomeScreen');
      return;
    }

    if (userData?.currentSession) {
      setErrorMessage("You're already in an active session. Please leave it first.");
      return;
    }

    setJoiningSession(true);
    try {
      const session = await sessionService.getSession(sessionCode);
      if (!session) {
        setErrorMessage('Session not found. Please check the code and try again.');
        return;
      }
      if (session.gameState !== 'LOBBY' && session.gameState !== 'ACTIVE') {
        setErrorMessage('This session is not currently active.');
        return;
      }

      if (userData?.sessionsJoined?.[sessionCode]) {
        await userService.setCurrentSession(user.uid, sessionCode);
      } else {
        await userService.addUserToSession(user.uid, sessionCode);
        await userService.setCurrentSession(user.uid, sessionCode);
      }
      console.log(sessionCode)
      console.log(session)
      navigation.navigate('GamePreviewScreen', { sessionCode, session });
    } catch (err) {
      console.error('Error joining session:', err);
      setErrorMessage(err.message || 'Failed to join session. Please try again.');
    } finally {
      setJoiningSession(false);
    }
  };

  // ── Tap a game card -> navigate to game preview (placeholder for now) ──────────
  const handleGameCardPress = (game) => {
    // TODO: navigate to GamePreviewScreen once it exists
    navigation.navigate('GamePreviewScreen', { sessionCode: game.id, session: game });
    console.log('Tapped game:', game.id);
  };

  // ── Loading screen ────────────────────────────────────────────────
  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.navy} />
      </View>
    );
  }

  // ── Game card ─────────────────────────────────────────────────────
  const renderGameCard = ({ item }) => {
    const isActive = item.isActive;
    return (
      <TouchableOpacity style={styles.card} onPress={() => handleGameCardPress(item)} activeOpacity={0.75}>
        <View style={styles.cardLeft}>
          <Text style={styles.cardTitle}>{item.sessionName}</Text>
          <Text style={styles.cardSub}>Players: {item.playerCount ?? 0}</Text>
        </View>
        <View style={styles.cardRight}>
          <View style={[styles.badge, isActive ? styles.badgeActive : styles.badgeLobby]}>
            <Text style={[styles.badgeText, isActive ? styles.badgeTextActive : styles.badgeTextLobby]}>
              {isActive ? 'ACTIVE' : 'LOBBY'}
            </Text>
          </View>
          <Text style={styles.cardCode}>Code: {item.id}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // ── Main render ───────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Back button */}
      <View style={styles.backButtonContainer}>
        <BackButton backgroundColor={COLORS.beige} onPress={() => navigation.goBack()} />
      </View>

      {/* Title */}
      <Text style={styles.title}>Find a Game</Text>

      {/* Top action buttons */}
      <View style={styles.topButtons}>
        <BasicButton backgroundColor={COLORS.navy} text="Enter Code" textColor={COLORS.beige} fontSize={SIZES.body} onPress={handleEnterCodePress} activeOpacity={0.8} flex={1} width={"0%"}></BasicButton>

        <BasicButton backgroundColor={COLORS.yellow} text="Create Game" textColor={COLORS.navy} fontSize={SIZES.body} onPress={() => navigation.navigate("CreateGameScreen")} activeOpacity={0.8} flex={1} width={"0%"}></BasicButton>
      </View>

      {/* Code input (shown when "Enter Code" is tapped) */}
      {showCodeInput && (
        <View style={styles.codeInputWrapper}>
          <View style={styles.inputContainer}>
            <Input 
              ref={inputRef}
              style={[errorMessage ? styles.inputError : null]}
              value={sessionCode}
              backgroundColor={COLORS.white}
              onChangeText={setSessionCode}
              onFocus={handleFocus}
              placeholder="Enter Super Secret Game Code"
              maxLength={20}
              autoCapitalize="none"
              flex={1}
              ></Input>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          </View>
          <BasicButton
            text={joiningSession ? 'Joining...' : 'Join Game'}
            backgroundColor={COLORS.navy}
            textColor={COLORS.beige}
            disabled={joiningSession}
            onPress={handleJoinSession}
            width={"100%"}
          />
        </View>
      )}

      {/* Available games header */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Available Games</Text>
          <Text style={styles.sectionSub}>Updated {timeAgo(lastUpdated)}</Text>
        </View>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.refreshIcon}>↻</Text>
        </TouchableOpacity>
      </View>

      {/* Games list */}
      <FlatList
        data={availableGames}
        keyExtractor={(item) => item.id}
        renderItem={renderGameCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.navy} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No games available right now. Try refreshing!</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.beige,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.beige,
    paddingTop: SPACING.v,
    paddingHorizontal: SPACING.xl,
  },
  backButtonContainer: {
    position: 'absolute',
    top: SPACING.v,
    left: SPACING.md,
  },
  title: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: SIZES.title,
    color: COLORS.navy,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
    marginTop: SPACING.xxxl,
  },
  // ── Top buttons ──────────────────────────────────────────────────
  topButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  // ── Code input ───────────────────────────────────────────────────
  codeInputWrapper: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.xxl
  },
  inputContainer: {
    flexDirection: "row",
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  inputError: {
    borderColor: COLORS.red,
  },
  errorText: {
    color: COLORS.red,
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.body_small,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  // ── Section header ────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: SIZES.body,
    color: COLORS.navy,
  },
  sectionSub: {
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.body_small,
    color: COLORS.gray,
    marginTop: SPACING.xs,
  },
  refreshBtn: {
    padding: SPACING.sm,
  },
  refreshIcon: {
    fontSize: SIZES.body,
    color: COLORS.navy,
  },
  // ── List ──────────────────────────────────────────────────────────
  listContent: {
    paddingBottom: SPACING.v,
    gap: SPACING.md,
  },
  emptyText: {
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.body_small,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: SPACING.v,
  },
  // ── Game card ─────────────────────────────────────────────────────
  card: {
    backgroundColor: '#fff',
    borderRadius: SIZES.radius_component,
    borderWidth: 1.5,
    borderColor: COLORS.navy,
    padding: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: SIZES.body,
    color: COLORS.navy,
    marginBottom: SPACING.sm,
  },
  cardSub: {
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.body_small,
    color: COLORS.navy,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: SPACING.sm,
  },
  cardCode: {
    fontFamily: 'Figtree_400Regular',
    fontSize: SIZES.body_small,
    color: COLORS.navy,
  },
  // ── Badges ────────────────────────────────────────────────────────
  badge: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: SIZES.radius_component_s,
  },
  badgeLobby: {
    backgroundColor: '#F5A623',
  },
  badgeActive: {
    backgroundColor: COLORS.navy,
  },
  badgeText: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: SIZES.body_small,
  },
  badgeTextLobby: {
    color: COLORS.white,
  },
  badgeTextActive: {
    color: COLORS.white,
  },
});

export default JoinSessionScreen;