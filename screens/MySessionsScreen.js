import React, {useState} from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const MySessionsScreen = ({ route }) => {
  const { sessions = [] } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Sessions</Text>
      {sessions.length > 0 ? (
        sessions.map((session, index) => (
          <TouchableOpacity key={index} style={styles.button}>
            <Text style={styles.buttonText}>{session}</Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.noSessions}>No sessions available</Text>
      )}
    </View>
  );
};

export default MySessionsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFBEB",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#13274F",
  },
  button: {
    backgroundColor: "#13274F",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  noSessions: {
    fontSize: 16,
    color: "#666",
    marginTop: 20,
  },
});
