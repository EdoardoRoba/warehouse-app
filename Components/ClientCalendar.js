import { axiosInstance, beUrl } from "../config.js"
import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert, Linking, ScrollView, Image, Modal, Pressable, TouchableOpacity } from 'react-native';
import { Menu, Card, Button, Title, Paragraph, Provider, Dialog, Portal, List } from 'react-native-paper';
import ImageView from "react-native-image-viewing";
import { getDownloadURL, ref, uploadBytesResumable, getStorage, deleteObject, uploadString } from "firebase/storage";
import { storage } from "../firebase";
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    centeredView: {
        // flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: "50%"
    },
    modalView: {
        // margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        // padding: 100,
        // paddingBottom: 100,
        // paddingTop: 100,
        // paddingVertical: 200,
        // paddingHorizontal: 120,
        // justifyContent:"center",
        height: 400,
        width: 250,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    buttonOpen: {
        backgroundColor: "#0282ba",
    },
    buttonClose: {
        backgroundColor: "#0282ba",
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginTop: 15,
        marginBottom: 40,
        textAlign: "center"
    },
    outsideModal: {
        backgroundColor: "transparent",
        flex: 1,
    }
});

export default function ClientCalendar(props) {

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
    const [section, setSection] = React.useState("");
    const [token, setToken] = React.useState("");
    const [modalVisibleSopralluogo, setModalVisibleSopralluogo] = React.useState(false);
    const [modalVisibleInstallazione, setModalVisibleInstallazione] = React.useState(false);
    const [modalVisibleAssistenza, setModalVisibleAssistenza] = React.useState(false);

    const { navigate } = props.navigation;

    React.useEffect(() => {
        setImage(null);
        getToken()
    }, []);

    React.useEffect(() => {
        setIsLoading(true)
        console.log(props)
        if (props.route.params !== undefined && props.route.params.photos !== undefined) {
            var customer = {}
            customer[typology] = customerSelected[typology]
            for (let s of props.route.params.photos) {
                // console.log(s)
                uploadImageAsync(s)
            }
            props.route.params = {}
        }
        if (props.route.params !== undefined && props.route.params.customerSelected !== undefined) {
            setCustomerSelected(props.route.params.customerSelected)
        }
        // });
    }, [props]);

    React.useEffect(() => {
        if (token) {
            getCustomers();
        }
    }, [token]);

    const getToken = async () => {
        setToken(await AsyncStorage.getItem("token"))
    }

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
                    axiosInstance.put(beUrl + "customer/" + customerSelected._id, customer, { headers: { "Authorization": `Bearer ${token}` } }).then(response => {
                        axiosInstance.put(beUrl + "customer/" + customerSelected._id, customer, { headers: { "Authorization": `Bearer ${token}` } }).then(resp => {
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
        axiosInstance.get(beUrl + 'customer', { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => {
                let custs = res.data
                custs.sort((a, b) => (a.nome_cognome.toUpperCase() > b.nome_cognome.toUpperCase()) ? 1 : -1)
                // console.log("Tools: ", res.data)
                setCustomers(custs)
                setIsLoading(false)
            }).catch(error => {
                setIsLoading(false)
                console.log("Customer not found")
                setShowError(true)
            });
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

    const pickImage = (typo) => {
        setTypology(typo)
        navigate('ImageBrowserScreenCalendar')
    };

    return (
        <View style={styles.container}>
            {/* <Text style={{ marginTop: 10 }}>Welcome in client section!</Text> */}
            {
                customerSelected.nome_cognome === undefined ? null : <View style={{ width: "90%", height: "50%", marginTop: -40, alignItems: 'center' }}>
                    <Title style={{ marginTop: 55 }}>{customerSelected.nome_cognome}</Title>
                    <Paragraph style={{ marginTop: 15 }}>{customerSelected.company}</Paragraph>
                    <Paragraph>{customerSelected.indirizzo} - {customerSelected.comune} - {customerSelected.provincia} - {customerSelected.cap}</Paragraph>
                    <View style={{ marginTop: 40, marginLeft: 'auto', marginRight: 'auto' }}>
                        {/* <Title style={{ marginLeft: 'auto', marginRight: 'auto' }}>Sopralluogo</Title> */}
                        <View style={{ flexDirection: "row", }}>
                            <Pressable
                                style={[styles.button, styles.buttonOpen]}
                                onPress={() => {
                                    setSection("sopralluogo")
                                    setModalVisibleSopralluogo(true)
                                }}
                            >
                                <Text style={styles.textStyle}>Apri sopralluogo</Text>
                            </Pressable>
                            {/* <Text style={{ color: 'blue' }}
                                onPress={() => Linking.openURL('https://firebasestorage.googleapis.com/v0/b/magazzino-2a013.appspot.com/o/files%2Ftizio%20caio%2Fcheck_list_1647886217946?alt=media&token=3990cea6-7638-4cab-8630-0d1f912a7964')}>
                                Google
                            </Text> */}
                        </View>
                    </View>
                    <View style={{ marginTop: 40, marginLeft: 'auto', marginRight: 'auto' }}>
                        {/* <Title style={{ marginLeft: 'auto', marginRight: 'auto' }}>Fine installazione</Title> */}
                        <View style={{ flexDirection: "row", }}>
                            <Pressable
                                style={[styles.button, styles.buttonOpen]}
                                onPress={() => {
                                    setSection("installazione")
                                    setModalVisibleInstallazione(true)
                                }}
                            >
                                <Text style={styles.textStyle}>Apri installazione</Text>
                            </Pressable>
                            {/* <Button onPress={() => {
                                setOpenInstallazione(true)
                                createImagesToShow(customerSelected.foto_fine_installazione)
                            }}>Apri foto</Button>
                            <Button onPress={() => {
                                setOpenInstallazione(true)
                                createImagesToShow(customerSelected.foto_fine_installazione)
                            }}>Carica foto</Button> */}
                        </View>
                    </View>
                    <View style={{ marginTop: 40, marginLeft: 'auto', marginRight: 'auto' }}>
                        {/* <Title style={{ marginLeft: 'auto', marginRight: 'auto' }}>Assistenza</Title> */}
                        <View style={{ flexDirection: "row", }}>
                            <Pressable
                                style={[styles.button, styles.buttonOpen]}
                                onPress={() => {
                                    setSection("assistenza")
                                    setModalVisibleAssistenza(true)
                                }}
                            >
                                <Text style={styles.textStyle}>Apri assistenza</Text>
                            </Pressable>
                            {/* <Button onPress={() => {
                                setOpenAssistenza(true)
                                createImagesToShow(customerSelected.foto_assistenza)
                            }}>Apri foto</Button>
                            <Button onPress={() => {
                                setOpenAssistenza(true)
                                createImagesToShow(customerSelected.foto_assistenza)
                            }}>Carica foto</Button> */}
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
            <Modal
                visible={modalVisibleSopralluogo}
                onRequestClose={() => setModalVisibleSopralluogo(false)}
                animationType="slide"
                transparent={true}>
                <Pressable style={styles.outsideModal}
                    onPress={(event) => {
                        if (event.target == event.currentTarget) {
                            setModalVisibleSopralluogo(false);
                        }
                    }} >
                    {/* <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalText}>Hello World!</Text>
                            <Pressable
                                style={[styles.button, styles.buttonClose]}
                                onPress={() => setModalVisibleSopralluogo(!modalVisibleSopralluogo)}
                            >
                                <Text style={styles.textStyle}>Hide Modal</Text>
                            </Pressable>
                        </View>
                    </View> */}
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Title style={styles.modalText}>Sopralluogo</Title>
                            <View style={{ flexDirection: "row", }}>
                                <Button onPress={() => {
                                    setOpenSopralluogo(true)
                                    createImagesToShow(customerSelected.foto_sopralluogo)
                                    setModalVisibleSopralluogo(false)
                                }}>Apri foto</Button>
                                <Button onPress={() => {
                                    pickImage("foto_sopralluogo")
                                    setModalVisibleSopralluogo(false)
                                }}>Carica foto</Button>
                            </View>
                            <View style={{ marginTop: 20 }}>
                                <Text style={{ color: 'blue', marginBottom: 5 }}>Data sopralluogo: {customerSelected.data_sopralluogo}</Text>
                            </View>
                            <View style={{ marginTop: 5 }}>
                                <Text style={{ color: 'blue', marginBottom: 5 }}>Tecnico: {customerSelected.tecnico_sopralluogo}</Text>
                            </View>
                            <View style={{ marginTop: 5 }}>
                                <Text style={{ color: 'blue', marginBottom: 5 }}>Note: {customerSelected.note_sopralluogo}</Text>
                            </View>
                            {
                                customerSelected.pdf_sopralluogo === undefined ? null : <View>
                                    {
                                        customerSelected.pdf_sopralluogo.length === 0 ? <Text style={{ color: "blue", marginTop: 20 }}>(no pdf)</Text> : <View style={{ marginTop: 20 }}>
                                            {
                                                customerSelected.pdf_sopralluogo.map((pf, idx) => {
                                                    return <Text style={{ color: 'blue', marginBottom: 5 }}
                                                        onPress={() => Linking.openURL(pf)}>
                                                        {"pdf " + (idx + 1)}
                                                    </Text>
                                                })
                                            }
                                        </View>
                                    }
                                </View>
                            }
                        </View>
                    </View>
                </Pressable>
            </Modal>

            <Modal
                visible={modalVisibleInstallazione}
                onRequestClose={() => setModalVisibleInstallazione(false)}
                animationType="slide"
                transparent={true}>
                <Pressable style={styles.outsideModal}
                    onPress={(event) => {
                        if (event.target == event.currentTarget) {
                            setModalVisibleInstallazione(false);
                        }
                    }} >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Title style={styles.modalText}>Installazione</Title>
                            <View style={{ flexDirection: "row", }}>
                                <Button onPress={() => {
                                    setOpenInstallazione(true)
                                    createImagesToShow(customerSelected.foto_fine_installazione)
                                    setModalVisibleInstallazione(false)
                                }}>Apri foto</Button>
                                <Button onPress={() => {
                                    pickImage("foto_fine_installazione")
                                    setModalVisibleInstallazione(false)
                                }}>Carica foto</Button>
                            </View>
                            <View style={{ marginTop: 20 }}>
                                <Text style={{ color: 'blue', marginBottom: 5 }}>Data installazione: {customerSelected.data_installazione}</Text>
                            </View>
                            <View style={{ marginTop: 5 }}>
                                <Text style={{ color: 'blue', marginBottom: 5 }}>Tecnico: {customerSelected.tecnico_installazione}</Text>
                            </View>
                            <View style={{ marginTop: 5 }}>
                                <Text style={{ color: 'blue', marginBottom: 5 }}>Computo (testo): {customerSelected.computo}</Text>
                            </View>
                            <View style={{ marginTop: 5 }}>
                                <Text style={{ color: 'blue', marginBottom: 5 }}>Note: {customerSelected.note_installazione}</Text>
                            </View>
                            {
                                customerSelected.pdf_computo === undefined ? null : <View>
                                    {
                                        customerSelected.pdf_computo.length === 0 ? <Text style={{ color: "blue", marginTop: 20 }}>(no pdf)</Text> :
                                            <View style={{ marginTop: 20 }}>
                                                {
                                                    customerSelected.pdf_computo.map((pc, idx) => {
                                                        return <Text style={{ color: 'blue', marginBottom: 5 }}
                                                            onPress={() => Linking.openURL(pc)}>
                                                            {"pdf " + (idx + 1)}
                                                        </Text>
                                                    })
                                                }
                                            </View>
                                    }
                                </View>
                            }
                        </View>
                    </View>
                </Pressable>
            </Modal>

            <Modal
                visible={modalVisibleAssistenza}
                onRequestClose={() => setModalVisibleAssistenza(false)}
                animationType="slide"
                transparent={true}>
                <Pressable style={styles.outsideModal}
                    onPress={(event) => {
                        if (event.target == event.currentTarget) {
                            setModalVisibleAssistenza(false);
                        }
                    }} >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Title style={styles.modalText}>Assistenza</Title>
                            <View style={{ flexDirection: "row", }}>
                                <Button onPress={() => {
                                    setOpenAssistenza(true)
                                    createImagesToShow(customerSelected.foto_assistenza)
                                    setModalVisibleAssistenza(false)
                                }}>Apri foto</Button>
                                <Button onPress={() => {
                                    pickImage("foto_assistenza")
                                    setModalVisibleAssistenza(false)
                                }}>Carica foto</Button>
                            </View>
                            <View style={{ marginTop: 20 }}>
                                <Text style={{ color: 'blue', marginBottom: 5 }}>Data assistenza: {customerSelected.data_assistenza}</Text>
                            </View>
                            <View style={{ marginTop: 5 }}>
                                <Text style={{ color: 'blue', marginBottom: 5 }}>Tecnico: {customerSelected.tecnico_assistenza}</Text>
                            </View>
                            <View style={{ marginTop: 5 }}>
                                <Text style={{ color: 'blue', marginBottom: 5 }}>Note: {customerSelected.note_assistenza}</Text>
                            </View>
                            {
                                customerSelected.assistenza === undefined ? null : <View>
                                    {
                                        customerSelected.assistenza.length === 0 ? <Text style={{ color: "blue", marginTop: 20 }}>(no pdf)</Text> :
                                            <View style={{ marginTop: 20 }}>
                                                {
                                                    customerSelected.assistenza.map((pi, idx) => {
                                                        return <Text style={{ color: 'blue', marginBottom: 5 }}
                                                            onPress={() => Linking.openURL(pi)}>
                                                            {"pdf " + (idx + 1)}
                                                        </Text>
                                                    })
                                                }
                                            </View>
                                    }
                                </View>
                            }
                        </View>
                    </View>
                </Pressable>
            </Modal>
        </View >
    );
}
