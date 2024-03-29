import { axiosInstance, beUrl } from "../config.js"
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View, Button, Alert, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Tooltip } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";

const Stack = createNativeStackNavigator();

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        // justifyContent: 'center',
    },
    maintext: {
        fontSize: 16,
        margin: 20,
    },
    barcodebox: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 300,
        width: 300,
        overflow: 'hidden',
        borderRadius: 30,
        backgroundColor: 'tomato'
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        width: 200
    },
    overlayLoadingContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        backgroundColor: 'transparent'
    },
});

export default function Home(props) {

    const [user, setUser] = React.useState(props.user);
    const [username, setUsername] = React.useState();

    const { navigation } = props

    React.useEffect(async () => {
        setUsername(await AsyncStorage.getItem("user"))
    }, []);

    const deleteAccount = () => {
        axiosInstance.delete(beUrl + 'profile?user=' + username)
            .then(response => {
                navigation.navigate("Login")
            }).catch(error => {
                console.log(error)
            });
    }

    return (
        <View style={styles.container}>
            {
                user === "EXTERNAL" ? <Text style={{ marginTop: 30, fontSize: 30, fontWeight: "bold" }}>Ciao!</Text> : <Text style={{ marginTop: 30, fontSize: 30, fontWeight: "bold" }}>Benvenuto {user}!</Text>
            }
            {
                user === "EXTERNAL" ? null : <Text style={{ marginTop: 40, fontSize: 15, marginBottom: 50 }}>Seleziona la sezione che vuoi visitare</Text>
            }
            {
                user !== "admin" && user !== "EXTERNAL" ? null : <View style={{ marginTop: 50 }}><Tooltip containerStyle={{ height: 50, width: 200 }} popover={<TouchableOpacity
                    // style={{ backgroundColor: '#DDDDDD', padding: 5 }}
                    onPress={() => deleteAccount()}><Text style={{ color: "red" }}>Elimina account</Text></TouchableOpacity>}>
                    <Icon name={"gear"} size={25} />
                </Tooltip>
                </View>
            }
            {
                Platform.OS !== 'ios' || user === "EXTERNAL" ? null : <View style={{ marginTop: 50 }}><Tooltip containerStyle={{ height: 200, width: 200 }} popover={<Text>Sarà richiesto l'accesso alla telecamera. La fotocamera dà la possibilità all'utente di scannerizzare il codice qr di un certo prodotto (vedi sezione "QRScanner"). Una volta visualizzato, l'utente può togliere la quantità richiesta</Text>}>
                    <Icon name={"info-circle"} size={25} />
                </Tooltip>
                </View>
            }
        </View>
    );
}
