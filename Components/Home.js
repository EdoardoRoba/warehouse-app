import { axiosInstance, beUrl } from "../config.js"
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View, Button, Alert, ActivityIndicator, Text } from 'react-native';
import { TextInput } from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Tooltip } from 'react-native-elements';

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

export default function Home({ user }) {

    // const goToQrscanner = () => {
    //     navigation.navigate("QRScanner", { user: user })
    // }

    // const goToClients = () => {
    //     navigation.navigate("Client", { user: user })
    // }

    return (

        // // <Navigator />
        // <View style={styles.container}>
        //     <Text style={{ marginTop: 30, fontSize: 30, fontWeight: "bold" }}>Benvenuto {navigation.getParam("user")}!</Text>
        //     <Text style={{ marginTop: 40, fontSize: 15 }}>Seleziona la sezione che vuoi visitare:</Text>

        //     <View style={{ marginTop: 80, width: "100%" }}>
        //         <Button title={'QR scanner'} onPress={() => goToQrscanner()} />
        //     </View>

        //     <View style={{ marginTop: 10, width: "100%" }}>
        //         <Button title={'Clienti'} onPress={() => goToClients()} />
        //     </View>
        // </View>
        <View style={styles.container}>
            <Text style={{ marginTop: 30, fontSize: 30, fontWeight: "bold" }}>Benvenuto {user}!</Text>
            <Text style={{ marginTop: 40, fontSize: 15, marginBottom: 50 }}>Seleziona la sezione che vuoi visitare</Text>
            {
                Platform.OS !== 'ios' ? null : <Tooltip containerStyle={{ height: 200, width: 200 }} popover={<Text>Sarà richiesto l'accesso alla telecamera. La fotocamera dà la possibilità all'utente di scannerizzare il codice qr di un certo prodotto (vedi sezione "QRScanner"). Una volta visualizzato, l'utente può togliere la quantità richiesta</Text>}>
                    <Icon name={"info-circle"} size={25} />
                </Tooltip>
            }
            {/* <View style={{ marginTop: 80, width: "100%" }}>
                <Button title={'QR scanner'} onPress={() => goToQrscanner()} />
            </View>

            <View style={{ marginTop: 10, width: "100%" }}>
                <Button title={'Clienti'} onPress={() => goToClients()} />
            </View> */}
        </View>
    );
}
