import React, { useState, useEffect, useContext } from 'react';
import { Text, View, FlatList } from 'react-native';
import { COLORS, SIZES } from '../../components/theme';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree';
import LocationButton from '../../components/LocationButton';
import { useAuth } from '../../contexts/AuthContext';
import { useServices } from '../../contexts/ServiceContext';
import { LocationsContext } from '../../contexts/LocationsContext';

const LocationsScreen = ({ setScreenIndex }) => {
  const [foundLocations, setFoundLocations] = useState([]);
  const { user } = useAuth();
  const { userService } = useServices();
  const { locations } = useContext(LocationsContext);
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_600SemiBold,
  });

  useEffect(() => {
    const fetchFoundLocations = async () => {
      if (user && user.uid && userService) {
        const userObj = await userService.getUser(user.uid);
        if (!userObj || !userObj.currentSession || !userObj.sessionsJoined[userObj.currentSession]) return;
        setFoundLocations(userObj.sessionsJoined[userObj.currentSession].locationsFound || []);
      }
    };
    fetchFoundLocations();
  }, [user, userService]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: '10%' }}>
      <FlatList
        data={locations}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const found = foundLocations.includes(item.id);
          if (found) {
            return (
              <View style={{
                width: 90,
                height: 90,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#e4ffd4',
                margin: 4
              }}>
                <Text style={{ fontSize: 16, color: 'green', textAlign: 'center' }}>{item.name || item.id} ⭐</Text>
              </View>
            );
          } else {
            return (
              <View style={{ margin: 4 }}>
                <LocationButton
                  image={require("../../assets/QuestionMark.png")}
                  onPress={() => setScreenIndex(4)}
                />
              </View>
            );
          }
        }}
        numColumns={3}
        columnWrapperStyle={{ gap: '15%', marginBottom: '5%' }}
      />
    </View>
  );
};

export default LocationsScreen;