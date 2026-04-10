import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { COLORS, SIZES } from '../components/theme';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree';
import BasicButton from '../components/BasicButton';

const STEPS = [
  {
    num: '1',
    title: 'Join or create a game',
    desc: 'Browse open games or enter a game code. Any player can host a hunt.',
  },
  {
    num: '2',
    title: 'Wait in the lobby',
    desc: 'Gather your group and wait for the host to kick things off.',
  },
  {
    num: '3',
    title: 'Hunt for artifacts',
    desc: 'Explore campus, find artifacts nearby, and earn points.',
  },
  {
    num: '4',
    title: 'See the results',
    desc: 'The host ends the game and the leaderboard is revealed!',
  },
];

const AboutUsScreen = ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
  });

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>About Us</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Hero */}
        <View style={styles.heroSection}>
          <Image
            style={styles.icon}
            source={require('../assets/empathybytes.png')}
          />
          <Text style={styles.appName}>Empathy Bytes</Text>
          <Text style={styles.appSub}>COMMUNITY SCAVENGER HUNT</Text>
        </View>

        {/* What is Empathy Bytes */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>WHAT IS EMPATHY BYTES?</Text>
          <Text style={styles.cardBody}>
            A student-run research project at Georgia Tech creating immersive
            technology and media centered around empathy. We think outside
            traditional modes of communication to create radical, unique
            experiences — currently focused on identifying and presenting
            distinct communities connected to Georgia Tech.
          </Text>
        </View>

        {/* Dashed divider */}
        <View style={styles.dashedDivider}>
          {[...Array(12)].map((_, i) => (
            <View key={i} style={styles.dash} />
          ))}
        </View>

        {/* How to Play */}
        <Text style={styles.sectionLabel}>HOW TO PLAY</Text>
        <View style={styles.stepsContainer}>
          {STEPS.map((step) => (
            <View key={step.num} style={styles.stepRow}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{step.num}</Text>
              </View>
              <View style={styles.stepTextWrap}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Dashed divider */}
        <View style={styles.dashedDivider}>
          {[...Array(12)].map((_, i) => (
            <View key={i} style={styles.dash} />
          ))}
        </View>

        {/* Website button — auto-sizes to text, no oversized box */}
        <TouchableOpacity
          style={styles.websiteBtn}
          onPress={() => Linking.openURL('https://educast.library.gatech.edu')}
          activeOpacity={0.8}
        >
          <Text style={styles.websiteBtnText} numberOfLines={1}>
            Visit the Empathy Bytes Website
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

export default AboutUsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.beige,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 6,
  },
  backBtn: {
    marginRight: 8,
    paddingRight: 6,
  },
  backArrow: {
    fontSize: 32,
    color: COLORS.navy,
    fontFamily: 'Figtree_600SemiBold',
    lineHeight: 36,
  },
  pageTitle: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 28,
    color: COLORS.navy,
    marginLeft: 96,
    marginTop: 15,
  },

  // Scroll
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Hero
  heroSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  appName: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 22,
    color: COLORS.navy,
  },
  appSub: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 11,
    color: '#999',
    letterSpacing: 1.2,
    marginTop: 3,
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 12,
    color: COLORS.navy,
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  cardBody: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13.5,
    color: '#555',
    lineHeight: 21,
    textAlign: 'center',
  },

  // Dashed divider
  dashedDivider: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    marginVertical: 16,
  },
  dash: {
    width: 6,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(26, 39, 68, 0.18)',
  },

  // Section label
  sectionLabel: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 12,
    color: COLORS.navy,
    letterSpacing: 1.2,
    marginBottom: 12,
    textAlign: 'center',
  },

  // Steps
  stepsContainer: {
    width: '100%',
    gap: 8,
    marginBottom: 10,
  },
  stepRow: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fdefc8',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumText: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 13,
    color: '#b8720d',
  },
  stepTextWrap: {
    flex: 1,
  },
  stepTitle: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 13.5,
    color: COLORS.navy,
  },
  stepDesc: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 12,
    color: '#777',
    lineHeight: 18,
    marginTop: 2,
  },

  // Website button — shrinks to fit text
  websiteBtn: {
    alignSelf: 'center',
    backgroundColor: COLORS.gold,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  websiteBtnText: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 14,
    color: COLORS.navy,
  },
});