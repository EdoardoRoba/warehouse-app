import { axiosInstance, beUrl } from "../config.js"
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, Alert, ActivityIndicator } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Avatar, Card, Title, Paragraph } from 'react-native-paper';
import NumericInput from 'react-native-numeric-input';
import FlashMessage, { showMessage } from "react-native-flash-message";
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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
        backgroundColor: 'tomato',
        marginTop: 20
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
    },
});

export default function QRScanner({ user }) {

    const [hasPermission, setHasPermission] = React.useState(null);
    const [scanned, setScanned] = React.useState(false);
    const [url, setUrl] = React.useState('Nessun risultato')
    const [notFound, setNotFound] = React.useState(false);
    const [showError, setShowError] = React.useState(false);
    const [confermaUpdate, setConfermaUpdate] = React.useState(false);
    const [toolFound, setToolFound] = React.useState({});
    const [diff, setDiff] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(false);

    const askForCameraPermission = () => {
        (async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        })()
    }

    // Request Camera Permission
    React.useEffect(() => {
        askForCameraPermission();
    }, []);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setNotFound(false)
        }, 5000);
        return () => clearTimeout(timer);
    }, [notFound]);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setShowError(false)
        }, 5000);
        return () => clearTimeout(timer);
    }, [showError]);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setConfermaUpdate(false)
        }, 5000);
        return () => clearTimeout(timer);
    }, [confermaUpdate]);

    React.useEffect(() => {
        if (scanned && url.includes(beUrl)) {
            setIsLoading(true)
            axiosInstance.get(url)
                .then(response => {
                    // console.log("ciao", response.data)
                    setIsLoading(false)
                    setToolFound(response.data)
                    setNotFound(false)
                }).catch(error => {
                    setIsLoading(false)
                    console.log("Tool not found")
                    setNotFound(true)
                });
        }
        if (url !== "Nessun risultato" && !url.includes(beUrl)) {
            console.log("Tool not found")
            setNotFound(true)
            setIsLoading(false)
        }
    }, [scanned])

    // What happens when we scan the bar code
    const handleBarCodeScanned = ({ type, data }) => {
        setScanned(true);
        setUrl(data)
        // console.log('Type: ' + type + '\nData: ' + data)
    };

    const updateBook = () => {
        var newField = {}
        newField = { quantity: toolFound.quantity + diff, lastUser: user.toLowerCase() }
        setIsLoading(true)
        axiosInstance.put(url, newField).then(ersp => {
            axiosInstance.put(url, newField).then(response => {
                // console.log("Fatto!", response.data)
                setConfermaUpdate(true)
                setToolFound(response.data)
                showMessage({
                    message: "Prodotto aggiornato correttamente!",
                    type: "info",
                    backgroundColor: "green",
                    color: "white"
                });
                var upds = { user: user, tool: toolFound.label, totalQuantity: toolFound.quantity + diff, update: diff }
                axiosInstance.post(beUrl + 'history/' + toolFound.label.replaceAll("/", "%47"), upds)
                    .then(response => {
                        console.log("History added!")
                        setIsLoading(false)
                    }).catch(error => {
                        setShowError(true)
                        setIsLoading(false)
                        console.log(error)
                    });
            }).catch((err) => {
                setIsLoading(false)
                console.log("err: ", err)
                setShowError(true)
            });
        }).catch((error) => {
            setIsLoading(false)
            console.log("error: ", error)
            setShowError(true)
        });
    }

    // Check permissions and return the screens
    if (hasPermission === null) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Requesting for camera permission</Text>
            </SafeAreaView>)
    }
    if (hasPermission === false) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={{ margin: 10 }}>No access to camera</Text>
                <Button title={'Accedi alla fotocamera'} onPress={() => askForCameraPermission()} />
            </SafeAreaView>)
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* <Text>Benvenuto {user}!</Text> */}
            <FlashMessage position="top" />
            <SafeAreaView style={styles.barcodebox}>
                <BarCodeScanner
                    onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                    style={{ height: 400, width: 400 }} />
            </SafeAreaView>

            {scanned && <Button title={'Scannerizza nuovamente?'} onPress={() => setScanned(false)} color='tomato' />}
            {
                !isLoading ? null : <View style={styles.overlayLoadingContainer}>
                    <ActivityIndicator size="large" color="green" animating={true} />
                </View>
            }
            {
                (notFound) ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: "80%" }}><Text style={{ color: "red" }}>prodotto non trovato! Controlla che il prodotto sia scritto correttamente.</Text></View> : <View style={{ width: "80%" }}>
                    {toolFound.label === undefined ? null :
                        <SafeAreaView style={{ marginTop: 30, width: "100%" }}>
                            <Card>
                                <Card.Title title={toolFound.label.toUpperCase()} />
                                <Card.Content>
                                    <Title style={{ fontSize: 15 }}>quantità attuale</Title>
                                    <Paragraph style={{ fontSize: 12 }}>{toolFound.quantity}</Paragraph>
                                </Card.Content>
                            </Card>
                            <View style={{ flexDirection: "row", alignItems: 'center', marginTop: 10, marginLeft: 30, marginRight: 30, width: '100%' }}>
                                <Text style={{ flex: 1 }}>togli</Text>
                                <NumericInput style={{ flex: 2 }} onChange={value => setDiff(value)} />
                                <Text style={{ flex: 3, marginLeft: 5 }}>aggiungi</Text>
                            </View>
                            <Button title={'Aggiorna'} onPress={() => updateBook()} color='tomato' />
                        </SafeAreaView>
                    }
                </View>
            }
            {
                !showError ? null : <Text style={{ width: '50%', marginLeft: 'auto', marginRight: 'auto', marginTop: 10 }} severity="error">Errore. Controlla la connessione o i dati inseriti.</Text>
            }
        </SafeAreaView >
    );
}
