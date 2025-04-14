import { Modal, StyleSheet, Text, View, Button, Animated, Keyboard, TouchableWithoutFeedback } from 'react-native';
import TimerPickerInput from '@/components/TimePickerInput';
import { useRef, useState } from 'react';
import { Input } from 'react-native-elements';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'


const convertToSec = ({
  hours,
  minutes,
  seconds,
}: {
  hours?: number;
  minutes?: number;
  seconds?: number;
}) => {
  const totalSeconds = (hours || 0) * 3600 + (minutes || 0) * 60 + (seconds || 0);

  return totalSeconds;
};

const convertToLisibleTime = (sec: number) => {
  const minutes = Math.floor(sec / 60).toString().padStart(2, '0')
  const seconds = (sec % 60).toString().padStart(2, '0')

  return `${minutes}:${seconds}`
}


export default function HomeScreen() {
  const [inputs, setInputs] = useState([
    { repetition: "1", minutes: 0, seconds: 0 }, // { temps d'une répétition : minutes, seconds ; nombre de répétition : repetition }
    { serie: "1", minutes: 0, seconds: 0 }, // { temps de pause : minutes, seconds ; nombre de série : serie }
  ]);
  const [count, setCount] = useState([0, 0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [playTimer, setPlayTimer] = useState(false);
  const [state, setState] = useState(0); // 0 = préparation, 1 = séance, 2 = repos

  let repInSec = convertToSec({ minutes: inputs[0].minutes, seconds: inputs[0].seconds });
  let test = repInSec;
  let pauseInSec = convertToSec({ minutes: inputs[1].minutes, seconds: inputs[1].seconds });

  const backgroundColor = useRef(new Animated.Value(0)).current; // Valeur animée

  // const startAnimation = (duration: number) => {
  //   Animated.timing(backgroundColor, {
  //     toValue: 1, // Passe de 0 (noir) à 1 (blanc)
  //     duration: duration * 1000, // Durée de l'animation en millisecondes
  //     useNativeDriver: false, // Nécessaire pour les animations de style non liées à la transformation
  //   }).start();
  // };

  const manageAnimation = (duration: number) => {
    // console.log('playTimer', playTimer);
    if (playTimer) {
      backgroundColor.stopAnimation((currentValue) => {
        Animated.timing(backgroundColor, {
          toValue: 1,
          duration: (1 - currentValue) * duration * 1000, // Reprendre à partir de la position actuelle
          useNativeDriver: false,
        }).start();
      });
    }
    else {
      backgroundColor.stopAnimation((currentValue) => {
        console.log('Animation paused at:', currentValue);
      });
    }
  }


  // Interpolation des couleurs
  const interpolatedColor = backgroundColor.interpolate({
    inputRange: [0, 0.5, 1], // Plage de la valeur animée
    outputRange: ['#A30000', '#F7B801', '#03a108'], // Couleurs de départ et d'arrivée
  });

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

      <View style={styles.container}>
        {/* <Image
        source={require('../../assets/images/react-logo.png')}
        style={[styles.reactLogo, { zIndex: -1 }]}
        resizeMode="contain"
      /> */}
        <Text>Bienvenu dans Pompélup</Text>
        <View style={styles.inputContainer}>

          <TimerPickerInput title="Temps d'une répétition" onDurationChange={(duration: { minutes: number; seconds: number }) => {
            inputs[0].minutes = duration.minutes;
            inputs[0].seconds = duration.seconds;
          }}
            onPress={() => { Keyboard.dismiss() }}
          />

          <View style={{ gap: 5, alignItems: 'center' }}>
            <Text>Nombre de répétition</Text>
            <Input placeholder="Nombre de répétition" keyboardType='numeric' value={inputs[0].repetition} onChangeText={(text) => {
              const updatedInputs = [...inputs];
              updatedInputs[0].repetition = text;
              setInputs(updatedInputs);
            }} containerStyle={styles.textInput} />
          </View>

          <TimerPickerInput title="Temps des pauses" onDurationChange={(duration: { minutes: number; seconds: number }) => {
            inputs[1].minutes = duration.minutes;
            inputs[1].seconds = duration.seconds;
          }}
            onPress={() => { Keyboard.dismiss() }}
          />

          <View style={{ gap: 5, alignItems: 'center' }}>
            <Text>Nombre de série</Text>
            <Input placeholder="Nombre de série" keyboardType='numeric' value={inputs[1].serie} onChangeText={(text) => {
              const updatedInputs = [...inputs];
              updatedInputs[1].serie = text;
              setInputs(updatedInputs);
            }} containerStyle={styles.textInput}
              onBlur={() => { console.log('blur') }}
            />
          </View>
        </View>

        <Button title="Lancer la séance" onPress={() => {
          repInSec = convertToSec({ minutes: inputs[0].minutes, seconds: inputs[0].seconds });
          test = repInSec;
          pauseInSec = convertToSec({ minutes: inputs[1].minutes, seconds: inputs[1].seconds });
          if (
            repInSec === 0
            || pauseInSec === 0
            || inputs[0].repetition === "" || inputs[1].serie === ""
            || inputs[0].repetition === "0" || inputs[1].serie === "0"
          ) {
            alert("Veuillez remplir tous les champs");
            return;
          }
          setModalVisible(true);
          setCount([0, 0]);
          setState(0);
          setPlayTimer(true);
          backgroundColor.setValue(0)
        }}></Button>

        <Modal
          animationType="slide"
          // transparent={true}
          visible={modalVisible}>
          <Animated.View style={[styles.container, { backgroundColor: state !== 1 ? "#fff" : interpolatedColor }]}>
            <Button title="Close" onPress={() => setModalVisible(false)}></Button>
            {/* <Button title="Démarrer l'animation" onPress={startAnimation} /> */}
            <Text>{`Série ${count[1] + 1} sur ${inputs[1].serie}`}</Text>
          <Text>{state === 0 ? `Prépararez vous à commencer la séance` : (state === 2 ? `Repos` : `Répétition ${count[0] + 1} sur ${inputs[0].repetition}`)}</Text>
            <CountdownCircleTimer
              isPlaying={playTimer}
              duration={repInSec}
              colors={['#FFFFFF', '#FFFFFF']}
              colorsTime={[0, repInSec]}
              initialRemainingTime={5}
              isGrowing={true}
              rotation='counterclockwise'
              onComplete={() => {
                backgroundColor.setValue(0)
                if (state === 0) {
                  setState(1);
                  manageAnimation(repInSec);

                  return { shouldRepeat: true, delay: 0 }
                }

                if (count[0] === parseInt(inputs[0].repetition as string) - 1 && count[1] === parseInt(inputs[1].serie as string) - 1) {
                  alert('Séance terminée');
                  return { shouldRepeat: false, delay: 0 }
                }

                if (count[0] + 1 >= parseInt(inputs[0].repetition as string)) {
                  setCount([0, count[1] + 1]);
                  setState(2);
                  return { shouldRepeat: true, delay: 0 }
                }

                if (state === 2) {
                  setState(1);
                  manageAnimation(repInSec);
                  // repInSec = test;
                }
                else {
                setCount([count[0] + 1, count[1]]);
                manageAnimation(repInSec);
                // console.log('Timer completed');
                console.log('count', count);
                }

                return { shouldRepeat: true, delay: 0 }
              }}
              // children={({ remainingTime }) => {
              //   const minutes = Math.floor(remainingTime / 60)
              //   const seconds = remainingTime % 60

              //   return `${minutes}:${seconds}`
              // }}
              // onUpdate={(remainingTime) => {
              //   console.log('remainingTime', remainingTime);
              // }}
            >
              {({ remainingTime }) => <Text>{convertToLisibleTime(remainingTime)}</Text>}
            </CountdownCircleTimer>
            {
              state !== 0 &&
              <Button onPress={() => {
                setPlayTimer(s => !s);
                console.log('playTimertesssssst', playTimer);
                manageAnimation(repInSec);
              }} title={state === 1 ? "Pause" : "Reprendre"}></Button>
            }
          </Animated.View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  inputContainer: {
    alignItems: 'center',
    gap: 20,
  },
  textInput: {
    width: 300,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
});