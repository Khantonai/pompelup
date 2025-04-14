import { TimerPicker, TimerPickerModal } from 'react-native-timer-picker';
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from 'expo-av';
import * as Haptics from "expo-haptics";
import { useState } from 'react';
import { Pressable } from 'react-native';
import { Text, StyleSheet, View } from 'react-native';




interface TimerPickerInputProps {
    title: string;
    onPress: () => void;
    onDurationChange: (duration: { minutes: number; seconds: number }) => void;
}

export default function TimerPickerInput({title, onDurationChange, onPress}: TimerPickerInputProps) {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [duration, setDuration] = useState({
        minutes: 0,
        seconds: 0,
    });

    return (
        <View style={styles.container}>
            <Text>{ title }</Text>
            <Pressable onPress={() => {
                setIsModalVisible(true);
                onPress();
                }} style={styles.input}>
                <Text>{`${duration.minutes}min ${duration.seconds}sec`}</Text>
            </Pressable>
            <TimerPickerModal
                visible={isModalVisible}
                setIsVisible={setIsModalVisible}
                onConfirm={(pickedDuration) => {
                    // alert(convertToSec(pickedDuration));
                    setDuration(pickedDuration);
                    setIsModalVisible(false);
                    onDurationChange(pickedDuration);
                }}
                modalTitle="séance"
                onCancel={() => setIsModalVisible(false)}
                closeOnOverlayPress
                padWithNItems={3}
                hideHours
                minuteLabel="min"
                secondLabel="sec"
                Audio={Audio}
                LinearGradient={LinearGradient}
                Haptics={Haptics}
                styles={{
                    // theme: "light",
                    pickerItem: {
                        fontSize: 34,
                    },
                    pickerLabel: {
                        fontSize: 26,
                        right: -20,
                    },
                    pickerLabelContainer: {
                        width: 60,
                    },
                    pickerItemContainer: {
                        width: 150,
                    },
                }}
                disableInfiniteScroll={true}
                repeatMinuteNumbersNTimes={1}
                repeatSecondNumbersNTimes={1}
            />
        </View>
    )
}


const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        gap: 5,
    },
    input: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 20,
        width: 300,
        alignItems: "center",
    },
});
