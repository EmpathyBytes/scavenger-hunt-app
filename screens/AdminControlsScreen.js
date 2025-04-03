import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { createSession } from "./adminHelpers";
import { useAuth } from "../contexts/AuthContext";
import { useServices } from "../contexts/ServiceContext";

const AdminControlsScreen = ({ navigation }) => {

  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Controls</Text>
      <TouchableOpacity 
      style={styles.button}
      onPress={() => navigation.navigate("CreateSessionScreen")}>
        
        <Text style={styles.buttonText}>Create Session</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("MySessionsScreen")}
      >
        <Text style={styles.buttonText}>My Sessions</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AdminControlsScreen;

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
});
