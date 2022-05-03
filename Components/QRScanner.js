import { axiosInstance, beUrl } from "../config.js"
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, Alert, ActivityIndicator } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Avatar, Card, Title, Paragraph } from 'react-native-paper';
import NumericInput from 'react-native-numeric-input';
import FlashMessage, { showMessage } from "react-native-flash-message";
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        zIndex: 1
        // justifyContent: 'center',
    },
    maintext: {
        fontSize: 16,
        margin: 20,
    },
    barcodebox: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 280,
        width: 280,
        overflow: 'hidden',
        borderRadius: 30,
        backgroundColor: 'tomato',
        marginBottom: 20
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
    const [tools, setTools] = React.useState([]);
    const [diff, setDiff] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isChosen, setIsChosen] = React.useState(false);
    const [token, setToken] = React.useState("");
    const [dataset, setDataset] = React.useState(null)

    const maxValue = (user === "admin" || user === "mirisola") ? null : 0

    const askForCameraPermission = () => {
        (async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        })()
    }

    // Request Camera Permission
    React.useEffect(() => {
        askForCameraPermission();
        getToken()
    }, []);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setNotFound(false)
        }, 5000);
        return () => clearTimeout(timer);
    }, [notFound]);

    React.useEffect(() => {
        if (token) {
            getTools();
        }
    }, [token]);

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

    const getToken = async () => {
        setToken(await AsyncStorage.getItem("token"))
    }

    React.useEffect(() => {
        if (scanned && url.includes(beUrl)) {
            setIsLoading(true)
            axiosInstance.get(url, { headers: { "Authorization": `Bearer ${token}` } })
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
        setIsChosen(false)
        setUrl(data)
        setScanned(true);
        // console.log('Type: ' + type + '\nData: ' + data)
    };

    const getTools = () => {
        setIsLoading(true)
        axiosInstance.get(beUrl + 'tool', { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => {
                // console.log("Tools: ", res.data)
                let tss = res.data
                tss.sort((a, b) => (a.label.toUpperCase() > b.label.toUpperCase()) ? 1 : -1)
                let ts = tss.map((tool) => ({
                    id: tool.label,
                    title: tool.label,
                    toolSelected: tool
                }))
                setDataset(ts)
                setTools(ts)
                setIsLoading(false)
            }).catch(error => {
                console.log(error)
                if (error.response.status === 401) {
                    userIsAuthenticated()
                }
            })
    };

    const updateBook = () => {
        var newField = {}
        newField = { quantity: toolFound.quantity + diff, lastUser: user.toLowerCase() }
        setIsLoading(true)
        axiosInstance.put(url, newField, { headers: { "Authorization": `Bearer ${token}` } }).then(ersp => {
            axiosInstance.put(url, newField, { headers: { "Authorization": `Bearer ${token}` } }).then(response => {
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
                axiosInstance.post(beUrl + 'history/' + toolFound.label.replaceAll("/", "%47"), upds, { headers: { "Authorization": `Bearer ${token}` } })
                    .then(response => {
                        console.log("History added!")
                        const timer = setTimeout(() => {
                            setToolFound(null)
                        }, 300);
                        getTools()
                        setIsLoading(false)
                        return () => clearTimeout(timer);
                    }).catch(error => {
                        const timer = setTimeout(() => {
                            setToolFound(null)
                        }, 300);
                        setShowError(true)
                        setIsLoading(false)
                        console.log(error)
                        return () => clearTimeout(timer);
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
            <FlashMessage position="top" style={{ zIndex: 1000 }} />
            <View style={{ marginTop: 10, alignItems: 'center', justifyContent: 'center', width: "100%", zIndex: 0 }}>
                <AutocompleteDropdown
                    clearOnFocus={false}
                    closeOnBlur={true}
                    closeOnSubmit={false}
                    // initialValue={{ id: '2' }} // or just '2'
                    onSelectItem={(event) => {
                        if (event !== null) {
                            setIsChosen(true)
                            setUrl(beUrl + "tool/" + event.toolSelected._id)
                            setToolFound(event.toolSelected)
                        }
                    }}
                    textInputProps={{
                        style: {
                            width: 300,
                            color: "black",
                        },
                    }}
                    rightButtonsContainerStyle={{
                        borderRadius: 25,
                        alignSelfs: "center",
                        color: "black",
                    }}
                    inputContainerStyle={{
                        backgroundColor: "white",
                        borderWidth: "2",
                        borderStyle: "solid",
                        borderColor: "black",
                    }}
                    suggestionsListContainerStyle={{
                    }}
                    containerStyle={{ flexGrow: 1, flexShrink: 1, marginTop: 10 }}
                    dataSet={dataset}
                />
            </View>
            <View style={{ marginTop: 10, alignItems: 'center', justifyContent: 'center', width: "100%", zIndex: -1 }}>
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
                    (notFound) ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: "80%" }}><Text style={{ color: "red" }}>prodotto non trovato! Controlla che il prodotto sia scritto correttamente.</Text></View> : <View style={{ width: "90%" }}>
                        {!toolFound || toolFound.label === undefined ? null :
                            <SafeAreaView style={{ width: "100%" }}>
                                <Card style={{ width: "100%" }}>
                                    <Card.Title titleStyle={{ fontSize: 14 }} title={toolFound.label.toUpperCase()} />
                                    {/* <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{toolFound.label.toUpperCase()}</Text> */}
                                    <Card.Content>
                                        <Title style={{ fontSize: 15 }}>quantità attuale</Title>
                                        <Paragraph style={{ fontSize: 12 }}>{toolFound.quantity}</Paragraph>
                                    </Card.Content>
                                </Card>
                                {
                                    isChosen ? null : <View>
                                        <View style={{ flexDirection: "row", alignItems: 'center', marginTop: 10, marginLeft: 30, marginRight: 30, width: '100%' }}>
                                            <Text style={{ flex: 1 }}>togli</Text>
                                            <NumericInput maxValue={maxValue} style={{ flex: 2 }} onChange={value => setDiff(value)} />
                                            <Text style={{ flex: 3, marginLeft: 5 }}>aggiungi</Text>
                                        </View>
                                        <Button title={'Aggiorna'} onPress={() => updateBook()} color='tomato' />
                                    </View>
                                }
                            </SafeAreaView>
                        }
                    </View>
                }
                {
                    !showError ? null : <Text style={{ width: '50%', marginLeft: 'auto', marginRight: 'auto' }} severity="error">Errore. Controlla la connessione o i dati inseriti.</Text>
                }
            </View>
        </SafeAreaView >
    );
}
