import React, { useState } from 'react';
import { Text, View, Button, TextInput, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';


const LENGTH = 6; // Length of the Room ID

export default function Home() {
    const navigation = useNavigation();
    const [roomID, setRoomId] = useState('');

    // Generating random room id for the initiating peer
    const generateID = () => {
        var result = '';
        var characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < LENGTH; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    const handleSubmit = () => {
        if (roomID !== '') {
        	// Enter the room
            navigation.navigate('Canvas', { roomID: roomID });
        }
    }

    const handleCreateSubmit = () => {
    	// Make a new room ID
    	const room = generateID();
    	console.log(room); // Share this room id to another user in order to join in the same room
    	setRoomId(room);
        navigation.navigate('Canvas', { roomID: room });
    }

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <Text style={{ alignSelf: 'center', fontSize: 24, margin: 8, fontWeight: 'bold' }}>ACooBS</Text>
                <TextInput
                    placeholder="Canvas ID"
                    selectionColor="#DDD"
                    onChangeText={(text) => setRoomId(text)}
                    style={styles.textInput}
                />
            </View>
            <View style={styles.buttonContainer}>
                <Button
                    onPress={handleSubmit}
                    title="Join Canvas"
                    color = 'green'
                />
            </View>
            <View style={styles.buttonContainer}>
                <Button
                    onPress={handleCreateSubmit}
                    title="Create Canvas"
                    color = 'green'
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    textInput: {
        height: 55,
        paddingLeft: 15,
        paddingRight: 15,
        fontSize: 18,
        backgroundColor: 'white',
        borderWidth: .5,
    },
    inputContainer: {
        paddingLeft: 10,
        paddingRight: 10,
        margin: 10,
    },
    buttonContainer: {
        margin: 5,
        width: 350,
        borderColor: 'green',
        borderWidth: 5,
        elevation: 0,
        borderRadius: 15,
        alignSelf: 'center',
    },
    textStyle: {
        alignSelf: 'center',
        color: 'white',
        marginTop: 5,
    },
});
