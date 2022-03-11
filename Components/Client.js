import { axiosInstance, beUrl } from "../config.js"
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert, ScrollView, Image } from 'react-native';
import { Menu, Button, Provider, Dialog, Portal } from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ImageView from "react-native-image-viewing";

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

export default function Client() {

    const [customers, setCustomers] = React.useState([]);
    const [fotosToShow, setFotosToShow] = React.useState([]);
    const [customerSelected, setCustomerSelected] = React.useState({});
    const [isLoading, setIsLoading] = React.useState(false);
    const [showError, setShowError] = React.useState(false);
    const [visible, setVisible] = React.useState(false);
    const [openSopralluogo, setOpenSopralluogo] = React.useState(false);
    const [openInstallazione, setOpenInstallazione] = React.useState(false);
    const [openAssistenza, setOpenAssistenza] = React.useState(false);
    const [isVisible, setIsVisible] = React.useState(true);

    React.useEffect(() => {
        getCustomers();
    }, []);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setShowError(false)
        }, 5000);
        return () => clearTimeout(timer);
    }, [showError]);

    const getCustomers = () => {
        setIsLoading(true)
        axiosInstance.get(beUrl + 'customer')
            .then(res => {
                // console.log("Tools: ", res.data)
                setCustomers(res.data)
                setIsLoading(false)
            }).catch(error => {
                setIsLoading(false)
                console.log("Tool not found")
                setShowError(true)
            });
    }

    const openMenu = () => {
        setVisible(true)
        setCustomerSelected({})
    }

    const closeMenu = () => {
        setVisible(false)
    }

    const openCustomer = (c) => {
        setVisible(false)
        setCustomerSelected(c)
    }

    const createImagesToShow = (fotos) => {
        let ftss = []
        let fts = {}
        for (let f of fotos) {
            fts = {}
            fts.uri = f
            ftss.push(fts)
        }
        setFotosToShow(ftss)
    }

    return (
        <View style={styles.container}>
            {/* <Text style={{ marginTop: 10 }}>Welcome in client section!</Text> */}
            {
                customers === null ? null : <Provider>
                    <View
                        style={{
                            paddingTop: 50,
                            flexDirection: 'row',
                            justifyContent: 'center',
                        }}>
                        <Menu
                            visible={visible}
                            onDismiss={closeMenu}
                            anchor={<Button onPress={openMenu}>Seleziona cliente</Button>}>

                            {customers.map(c => {
                                return <Menu.Item onPress={() => { openCustomer(c) }} style={{ overflowY: 'auto' }} key={c.nome_cognome} title={c.nome_cognome} />
                            })}
                        </Menu>
                    </View>
                </Provider>
            }
            {
                customerSelected.nome_cognome === undefined ? null : <View>
                    <Button onPress={() => {
                        setOpenSopralluogo(true)
                        createImagesToShow(customerSelected.foto_sopralluogo)
                    }}>Apri foto sopralluogo</Button>
                    <Button onPress={() => {
                        setOpenInstallazione(true)
                        createImagesToShow(customerSelected.foto_fine_installazione)
                    }}>Apri foto di fine installazione</Button>
                    <Button onPress={() => {
                        setOpenAssistenza(true)
                        createImagesToShow(customerSelected.foto_assistenza)
                    }}>Apri foto di assistenza</Button>
                </View>
            }
            {
                !isLoading ? null : <View style={styles.overlayLoadingContainer}>
                    <ActivityIndicator size="large" color="green" animating={true} />
                </View>
            }
            {
                (!showError) ? null : <Alert style={{ width: '50%', marginLeft: 'auto', marginRight: 'auto', marginTop: '1rem' }} severity="error">Errore di connessione.</Alert>
            }

            {
                (customerSelected === undefined || customerSelected.foto_sopralluogo === undefined) ? null : <Provider>
                    <Portal>
                        <Dialog visible={openSopralluogo} onDismiss={() => { setOpenSopralluogo(false) }} style={{ height: "100%" }}>
                            <Dialog.ScrollArea>
                                <ScrollView>
                                    {
                                        customerSelected.foto_sopralluogo.length === 0 ? <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 100 }}><Text>Non sono presenti foto.</Text></View> : <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 10 }}>
                                            {/* {
                                                customerSelected.foto_sopralluogo.map(s => {
                                                    return <View>
                                                        <Image
                                                            source={{ uri: s }}
                                                            style={{ height: 250, width: 300, marginTop: 3 }}
                                                        />
                                                    </View>
                                                })
                                            } */}
                                            <ImageView
                                                images={fotosToShow}
                                                imageIndex={0}
                                                visible={openSopralluogo}
                                                onRequestClose={() => setOpenSopralluogo(false)}
                                            />
                                        </View>
                                    }
                                </ScrollView >
                            </Dialog.ScrollArea>
                        </Dialog>
                    </Portal>
                </Provider>
            }

            {
                (customerSelected === undefined || customerSelected.foto_fine_installazione === undefined) ? null : <Provider>
                    <Portal>
                        <Dialog visible={openInstallazione} onDismiss={() => { setOpenInstallazione(false) }} style={{ height: "100%" }}>
                            <Dialog.ScrollArea>
                                <ScrollView>
                                    {
                                        customerSelected.foto_fine_installazione.length === 0 ? <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 100 }}><Text>Non sono presenti foto.</Text></View> : <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 10 }}>
                                            {/* {
                                                customerSelected.foto_fine_installazione.map(i => {
                                                    return <View>
                                                        <Image
                                                            source={{ uri: i }}
                                                            style={{ height: 250, width: 300, marginTop: 3 }}
                                                        />
                                                    </View>
                                                })
                                            } */}
                                            <ImageView
                                                images={fotosToShow}
                                                imageIndex={0}
                                                visible={openInstallazione}
                                                onRequestClose={() => setOpenInstallazione(false)}
                                            />
                                        </View>
                                    }
                                </ScrollView>
                            </Dialog.ScrollArea>
                        </Dialog>
                    </Portal>
                </Provider>
            }
            {
                (customerSelected === undefined || customerSelected.foto_assistenza === undefined) ? null : <Provider>
                    <Portal>
                        <Dialog visible={openAssistenza} onDismiss={() => { setOpenAssistenza(false) }} style={{ height: "100%", justifyContent: 'center', alignItems: 'center' }}>
                            <Dialog.ScrollArea>
                                <ScrollView>
                                    {
                                        customerSelected.foto_assistenza.length === 0 ? <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 100 }}><Text style={{ justifyContent: 'center', alignItems: 'center' }}>Non sono presenti foto.</Text></View> : <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 10 }}>
                                            {/* {
                                                customerSelected.foto_assistenza.map(a => {
                                                    return <View>
                                                        <Image
                                                            source={{ uri: a }}
                                                            style={{ height: 250, width: 300, marginTop: 3 }}
                                                        />
                                                    </View>
                                                })
                                            } */}
                                            <ImageView
                                                images={fotosToShow}
                                                imageIndex={0}
                                                visible={openAssistenza}
                                                onRequestClose={() => setOpenAssistenza(false)}
                                            />
                                        </View>
                                    }
                                </ScrollView>
                            </Dialog.ScrollArea>
                        </Dialog>
                    </Portal>
                </Provider>
            }
        </View>
    );
}
