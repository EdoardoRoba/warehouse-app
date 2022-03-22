import { axiosInstance, beUrl } from "../config.js"
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert, ScrollView, Image } from 'react-native';
import { Menu, Card, Button, Title, Paragraph, Provider, Dialog, Portal, List } from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ImageView from "react-native-image-viewing";
import * as ImagePicker from 'expo-image-picker';
import { ImageBrowser } from 'expo-image-picker-multiple';
import { getDownloadURL, ref, uploadBytesResumable, getStorage, deleteObject, uploadString } from "firebase/storage";
import { storage } from "../firebase";

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

export default function Client(props) {

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
    const [image, setImage] = React.useState(null);
    const [typology, setTypology] = React.useState("");

    const { navigate } = props.navigation;

    React.useEffect(() => {
        getCustomers();
        setImage(null);
    }, []);

    React.useEffect(() => {
        setIsLoading(true)
        // console.log("init", props)
        // const unsubscribe = props.navigation.addListener('state', () => {
        // console.log("init", props.route.params)
        if (props.route.params !== undefined && props.route.params.photos !== undefined) {
            // console.log("propssss", props.route.params.photos)
            var customer = {}
            customer[typology] = customerSelected[typology]
            for (let s of props.route.params.photos) {
                console.log(s)
                uploadImageAsync(s)
                // customer[typology].push(s.base64)
            }
            props.route.params = {}
        }
        // });
    }, [props]);

    async function uploadImageAsync(ph) {
        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                resolve(xhr.response);
            };
            xhr.onerror = function (e) {
                console.log(e);
                reject(new TypeError("Error"));
            };
            xhr.responseType = "blob";
            xhr.open("GET", ph.uri, true);
            xhr.send(null);
        });
        const now = Date.now()
        var customer = {}
        customer[typology] = customerSelected[typology]
        const storageRef = ref(storage, '/files/' + customerSelected.nome_cognome + '/' + typology.replace("foto_", "") + '/' + now + "_" + ph.name.toLowerCase())
        const uploadTask = uploadBytesResumable(storageRef, blob)
        uploadTask.on("state_changed", (snapshot) => {
            console.log("Uploading...")
        }, (error) => console.log("error: ", error),
            () => {
                //when the file is uploaded we want to download it. uploadTask.snapshot.ref is the reference to the pdf
                getDownloadURL(uploadTask.snapshot.ref).then((fileUrl) => {
                    console.log("fileUrl: ", fileUrl)
                    customer[typology].push(fileUrl)
                    axiosInstance.put(beUrl + "customer/" + customerSelected._id, customer).then(response => {
                        axiosInstance.put(beUrl + "customer/" + customerSelected._id, customer).then(resp => {
                            setCustomerSelected(resp.data)
                            setIsLoading(false)
                            getCustomers()
                        }).catch((error) => {
                            console.log("error: ", error)
                            setIsLoading(false)
                            setShowError(true)
                        });
                    }).catch((error) => {
                        console.log("error: ", error)
                        setIsLoading(false)
                        setShowError(true)
                    });
                })
            }
        )
    }

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
                let custs = res.data
                custs.sort((a, b) => (a.nome_cognome.toUpperCase() > b.nome_cognome.toUpperCase()) ? 1 : -1)
                // console.log("Tools: ", res.data)
                setCustomers(custs)
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

    const pickImage = (typology) => {
        // No permissions request is necessary for launching the image library
        // ImagePicker.launchImageLibraryAsync({
        //     mediaTypes: ImagePicker.MediaTypeOptions.All,
        //     allowsEditing: true,
        //     aspect: [4, 3],
        //     quality: 1,
        // }).then((result) => {

        //     console.log(result);

        //     if (!result.cancelled) {
        //         setImage(result.uri);
        //         console.log("uri1111111:")
        //         console.log(result.uri)
        //     }

        // });
        setTypology(typology)
        navigate('ImageBrowser')
    };

    return (
        <View style={styles.container}>
            {/* <Text style={{ marginTop: 10 }}>Welcome in client section!</Text> */}
            {
                customers === null ? null : <Provider>
                    <View
                        style={{
                            marginTop: 20,
                            flexDirection: 'row',
                            justifyContent: 'center',
                        }}>
                        <Button onPress={openMenu}>Seleziona cliente</Button>
                        {/* <ScrollView style={{ maxHeight: 300 }}>
                            <Menu
                                visible={visible}
                                onDismiss={closeMenu}
                                anchor={<Button onPress={openMenu}>Seleziona cliente</Button>}
                                contentStyle={{ maxHeight: 300 }}
                            >
                                {customers.map(c => {
                                    return <Menu.Item onPress={() => { openCustomer(c) }} key={c.nome_cognome} title={c.nome_cognome} />
                                })}
                            </Menu>
                        </ScrollView> */}
                        <Portal>
                            <Dialog visible={visible} onDismiss={() => { closeMenu() }} style={{ height: 500, justifyContent: 'center', alignItems: 'center' }}>
                                <Dialog.ScrollArea>
                                    <ScrollView>
                                        {customers.map(c => {
                                            return <Menu.Item onPress={() => { openCustomer(c) }} key={c.nome_cognome} title={c.nome_cognome} />
                                        })}
                                    </ScrollView>
                                </Dialog.ScrollArea>
                            </Dialog>
                        </Portal>
                    </View>
                </Provider>
            }
            {
                customerSelected.nome_cognome === undefined ? null : <View style={{ width: "90%", height: "50%", marginTop: -40, alignItems: 'center' }}>
                    <Title>{customerSelected.nome_cognome}</Title>
                    <Paragraph>{customerSelected.indirizzo}</Paragraph>
                    <View style={{ marginTop: 40, marginLeft: 'auto', marginRight: 'auto' }}>
                        <Title style={{ marginLeft: 'auto', marginRight: 'auto' }}>Sopralluogo</Title>
                        <View style={{ flexDirection: "row", }}>
                            <Button onPress={() => {
                                setOpenSopralluogo(true)
                                createImagesToShow(customerSelected.foto_sopralluogo)
                            }}>Apri</Button>
                            <Button onPress={() => {
                                pickImage("foto_sopralluogo")
                            }}>Carica</Button>
                        </View>
                    </View>
                    <View style={{ marginTop: 40, marginLeft: 'auto', marginRight: 'auto' }}>
                        <Title style={{ marginLeft: 'auto', marginRight: 'auto' }}>Fine installazione</Title>
                        <View style={{ flexDirection: "row", }}>
                            <Button onPress={() => {
                                setOpenInstallazione(true)
                                createImagesToShow(customerSelected.foto_fine_installazione)
                            }}>Apri</Button>
                            <Button onPress={() => {
                                setOpenInstallazione(true)
                                createImagesToShow(customerSelected.foto_fine_installazione)
                            }}>Carica</Button>
                        </View>
                    </View>
                    <View style={{ marginTop: 40, marginLeft: 'auto', marginRight: 'auto' }}>
                        <Title style={{ marginLeft: 'auto', marginRight: 'auto' }}>Assistenza</Title>
                        <View style={{ flexDirection: "row", }}>
                            <Button onPress={() => {
                                setOpenAssistenza(true)
                                createImagesToShow(customerSelected.foto_assistenza)
                            }}>Apri</Button>
                            <Button onPress={() => {
                                setOpenAssistenza(true)
                                createImagesToShow(customerSelected.foto_assistenza)
                            }}>Carica</Button>
                        </View>
                    </View>
                </View>
            }
            {
                !isLoading ? null : <View style={styles.overlayLoadingContainer}>
                    <ActivityIndicator size="large" color="green" animating={true} />
                </View>
            }
            {
                (!showError) ? null : <Text style={{ width: '50%', marginLeft: 'auto', marginRight: 'auto', marginTop: 30 }} severity="error">Errore di connessione.</Text>
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
