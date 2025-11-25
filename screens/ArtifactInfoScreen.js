import React, { Suspense, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { OrbitControls } from '@react-three/drei';
import { Figtree_400Regular, Figtree_600SemiBold, useFonts } from '@expo-google-fonts/figtree';
import BackButton from '../components/BackButton';
import { Asset } from 'expo-asset';
import { useGLTF } from '@react-three/drei';
import { COLORS } from '../components/theme';
import { ModelData } from '../contexts/ModelData';


const modelAssets = {
    1: "https://github.com/EmpathyBytes/scavenger-hunt-app/blob/35c43090f97b2a2fa1d3f9706a54b1facd5fd70f/assets/left_converse.glb",
    2: "https://github.com/EmpathyBytes/scavenger-hunt-app/blob/e5b3a1295301d10ec29dd6d0ce7e2946d6cb8d18/assets/ashtray.glb",
    3: "https://github.com/EmpathyBytes/scavenger-hunt-app/blob/e5b3a1295301d10ec29dd6d0ce7e2946d6cb8d18/assets/football2.glb",
    4: "https://github.com/EmpathyBytes/scavenger-hunt-app/blob/e5b3a1295301d10ec29dd6d0ce7e2946d6cb8d18/assets/band_uniform.glb",
    5: "https://github.com/EmpathyBytes/scavenger-hunt-app/blob/e5b3a1295301d10ec29dd6d0ce7e2946d6cb8d18/assets/Bookend2.glb",
    6: "https://github.com/EmpathyBytes/scavenger-hunt-app/blob/e5b3a1295301d10ec29dd6d0ce7e2946d6cb8d18/assets/BuzzPlaque.glb",
    7: "https://github.com/EmpathyBytes/scavenger-hunt-app/blob/e5b3a1295301d10ec29dd6d0ce7e2946d6cb8d18/assets/modelairplane.glb",
};

const funFacts = {
    1: "Converse 'Chuck Taylors' sneakers associated with Susan Davis, the first woman to be an official Buzz. Today Buzz wears Adidas reflecting the Yellow Jackets' partnership with the company.",
    2: "In 1935, Georgia Tech adopted a smoking policy that restricted smoking to the dormitories, dining hall, and faculty offices. Sixty years later, after health concerns regarding smoking were raised by the Surgeon General, Georgia Tech was required to designate buildings and facilities as non-smoking areas, with the exception of some private offices. In March of 2014 the entire University System of Georgia became tobacco free, prohibiting the use of all forms of tobacco products on Georgia Tech's campus.",
    3: "Georgia Tech's football history is rich with tradition and rivalry, including the famous Clean, Old-Fashioned Hate with UGA.",
    4: "The Georgia Tech marching band was founded in 1908 with an original roster of only 14 students. It was chartered in 1911, making it one of the oldest student organizations at the school.",
    5: "These bookends may have been a product of Georgia Tech's Department of Ceramic Engineering in commemoration of the 1936 football victory.",
    6: "The Buzz Plaque is a symbol of Georgia Tech spirit and tradition, often found at key campus locations.",
    7: "The model airplane tradition began in the late 1940s, flown during halftime of football games.",
};

const windowHeight = Dimensions.get('window').height;

export default function ArtifactInfoScreen({ route, setScreenIndex }) {
    //const [OrbitControls, events] = useControls();
    const { id } = route.params;

    const [fontsLoaded] = useFonts({
        Figtree_400Regular,
        Figtree_600SemiBold,
    });
    if (!fontsLoaded) return null;

    // Find the model info from ModelData
    const modelInfo = ModelData.find((m) => m.id === id);
    const modelAsset = modelAssets[id];
    const funFact = funFacts[id] || '';

    function Model({ asset }) {
      const [uri, setUri] = useState(null);

      useEffect(() => {
        (async () => {
          const expoAsset = Asset.fromModule(asset);
          await expoAsset.downloadAsync();
          setUri(expoAsset.localUri || expoAsset.uri);
        })();
      }, [asset]);

      // Only call useGLTF if uri is available
      if (!uri) return null;
      const { scene } = useGLTF(uri);
      return <primitive object={scene} />;
    }

    return (
        <View style={styles.container}>
            <BackButton style={{marginBottom: 20, size:48}} backgroundColor={COLORS.beige} onPress={() => {setScreenIndex(2)}} />
            <View style={styles.topHalf}>
                <Canvas camera={{ fov: 70, position: [0, 5, 0] }}>
                    <ambientLight />
                    <OrbitControls />
                    <directionalLight intensity={2} position={[0, 0, 50]} />
                    <Suspense fallback={null}>
                        {modelAsset && <Model asset={modelAsset} />}
                    </Suspense>
                </Canvas>
            </View>
            <View style={styles.bottomHalf}>
                <Text style={styles.infoLabel}>{modelInfo ? modelInfo.modelName : 'Artifact'}</Text>
                <Text style={styles.infoText}>{funFact}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.beige,
        width: '100%',
    },
    topHalf: {
        flex: 1,
        minHeight: windowHeight * 0.4,
        maxHeight: windowHeight * 0.5,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    bottomHalf: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    infoLabel: {
        fontFamily: 'Figtree_600SemiBold',
        fontSize: 30,
        marginBottom: 10,
        textAlign: 'center',
    },
    infoText: {
        fontFamily: 'Figtree_400Regular',
        fontSize: 20,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
});
