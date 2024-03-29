import { axiosInstance, beUrl } from "../config.js"
import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert, Linking, SafeAreaView, StatusBar, ScrollView, Image, Modal, Pressable, TouchableOpacity } from 'react-native';
import { Menu, Card, Button, Title, Paragraph, Provider, Dialog, Portal, List } from 'react-native-paper';
// import ImageView from "react-native-image-viewing";
import { getDownloadURL, ref, uploadBytesResumable, getStorage, deleteObject, uploadString } from "firebase/storage";
import { storage } from "../firebase";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from "expo-clipboard";
import Icon from 'react-native-vector-icons/FontAwesome';
import GridImageView from 'react-native-grid-image-viewer';
import ImageViewer from 'react-native-image-zoom-viewer';
import { FlatGrid } from 'react-native-super-grid';
import { vw, vh, vmin, vmax } from 'react-native-expo-viewport-units';
import FlashMessage, { showMessage } from "react-native-flash-message";

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
        marginTop: "20%"
    },
    modalView: {
        // margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        height: vh(85),
        width: vw(90),
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
        textAlign: "center",
        fontSize: 20
    },
    modalText: {
        // marginTop: 15,
        marginBottom: 20,
        textAlign: "center"
    },
    outsideModal: {
        backgroundColor: "transparent",
        flex: 1,
    },
    modalHeader: {
        flexDirection: "row",
        textAlign: "right",
        marginTop: 10
    },
    /* The header takes up all the vertical space not used by the close button. */
    modalHeaderContent: {
        flexGrow: 1,
        textAlign: "right"
    },
    modalHeaderCloseText: {
        textAlign: "right",
        paddingLeft: 5,
        paddingRight: 10,
        right: 0
    },
    scrollView: {
        // marginHorizontal: 20,
        // width: "100%",
    },
    text: {
        fontSize: 42,
    },
    safeAreaView: {
        flex: 1,
        paddingTop: StatusBar.currentHeight,
    },
    box: {
        width: 50,
        height: 50,
    },
    row: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    selected: {
        backgroundColor: "coral",
        borderWidth: 0,
    },
    buttonLabel: {
        fontSize: 12,
        fontWeight: "500",
        color: "coral",
    },
    selectedLabel: {
        color: "white",
    },
    label: {
        textAlign: "center",
        marginBottom: 10,
        fontSize: 24,
    },
    tinyLogo: {
        width: 90,
        height: 90,
    },
});

export default function ClientCalendar(props) {

    const [customers, setCustomers] = React.useState([]);
    const [fotosToShow, setFotosToShow] = React.useState([]);
    const [customerSelected, setCustomerSelected] = React.useState({});
    const [event, setEvent] = React.useState({});
    const [isLoading, setIsLoading] = React.useState(false);
    const [showError, setShowError] = React.useState(false);
    const [showCopyboard, setShowCopyboard] = React.useState(false);
    const [visible, setVisible] = React.useState(false);
    const [openNoteInfo, setOpenNoteInfo] = React.useState(false);
    const [openSopralluogo, setOpenSopralluogo] = React.useState(false);
    const [openInstallazione, setOpenInstallazione] = React.useState(false);
    const [openAssistenza, setOpenAssistenza] = React.useState(false);
    const [openArgo, setOpenArgo] = React.useState(false);
    const [openBuildAutomation, setOpenBuildAutomation] = React.useState(false);
    const [isVisible, setIsVisible] = React.useState(true);
    const [image, setImage] = React.useState(null);
    const [typology, setTypology] = React.useState("");
    const [section, setSection] = React.useState("");
    const [token, setToken] = React.useState("");
    const [user, setUser] = React.useState("");
    const [modalVisibleSopralluogo, setModalVisibleSopralluogo] = React.useState(false);
    const [modalVisibleInstallazione, setModalVisibleInstallazione] = React.useState(false);
    const [modalVisibleAssistenza, setModalVisibleAssistenza] = React.useState(false);
    const [modalVisibleDocumenti, setModalVisibleDocumenti] = React.useState(false);
    const [modalVisibleArgo, setModalVisibleArgo] = React.useState(false);
    const [modalVisibleBuildAutomation, setModalVisibleBuildAutomation] = React.useState(false);
    const [singleImage, setSingleImage] = React.useState("");
    const [allImages, setAllImages] = React.useState([]);
    const [openPhotos, setOpenPhotos] = React.useState(false);
    const [modalImages, setModalImages] = React.useState(false);

    const { navigate } = props.navigation;

    const PromiseHelperAllSettled = (promises) => {
        return Promise.all(promises.map(function (promise) {
            return promise.then(function (value) {
                return { state: 'fulfilled', value: value };
            }).catch(function (reason) {
                return { state: 'rejected', reason: reason };
            });
        }));
    };

    React.useEffect(() => {
        setImage(null);
        getToken()
        if (Promise && !Promise.allSettled) {
            Promise.allSettled = PromiseHelperAllSettled;
        }
    }, []);

    React.useEffect(async () => {
        setIsLoading(true)
        if (props.route.params !== undefined && props.route.params.event !== undefined) {
            setEvent(props.route.params.event)
        }
        if (props.route.params !== undefined && props.route.params.photos !== undefined) {
            var customer = {}
            customer[typology] = customerSelected[typology]
            // for (let s of props.route.params.photos) {
            //     // console.log(s)
            //     uploadImageAsync(s)
            // }
            let phs = props.route.params.photos
            // while (phs.length) {
            let finished = []
            for (let s of phs) { //.splice(0, 2)
                // console.log(s)
                finished.push(uploadImageAsync(s))
                // uploadImageAsync(s)
            }
            finished = await Promise.allSettled(finished)
            showMessage({
                message: "Foto caricate correttamente!",
                type: "info",
                backgroundColor: "green",
                color: "white"
            });
            // }
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

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setShowCopyboard(false)
        }, 100);
        return () => clearTimeout(timer);
    }, [showCopyboard]);

    const getToken = async () => {
        setToken(await AsyncStorage.getItem("token"))
        setUser(await AsyncStorage.getItem("user"))
    }

    async function uploadImageAsync(ph) {
        return new Promise(async (resolve, reject) => {
            const blob = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    resolve(xhr.response);
                };
                xhr.onerror = function (e) {
                    //    console.log(e);
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
                // console.log("Uploading...")
                // console.log("ph:", ph)
            }, (error) => {
                //    console.log("error: ", error)
            },
                () => {
                    //when the file is uploaded we want to download it. uploadTask.snapshot.ref is the reference to the pdf
                    getDownloadURL(uploadTask.snapshot.ref).then((fileUrl) => {
                        // console.log("fileUrl: ", fileUrl)
                        customer[typology].push(fileUrl)
                        axiosInstance.put(beUrl + "customer/" + customerSelected._id, customer, { headers: { "Authorization": `Bearer ${token}` } }).then(response => {
                            axiosInstance.put(beUrl + "customer/" + customerSelected._id, customer, { headers: { "Authorization": `Bearer ${token}` } }).then(resp => {
                                setCustomerSelected(resp.data)
                                setIsLoading(false)
                                getCustomers()
                                resolve("aggiornato");
                            }).catch((error) => {
                                //    console.log("error: ", error)
                                setIsLoading(false)
                                setShowError(true)
                                reject(error);
                            });
                        }).catch((error) => {
                            //    console.log("error: ", error)
                            setIsLoading(false)
                            setShowError(true)
                            reject(error);
                        });
                    })
                }
            )
        })
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
                //    console.log("Customer not found")
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

    const transformImageToUrls = (imgs) => {
        return imgs.map((i) => {
            let im = {}
            im.url = i
            return im
        })
    }

    const imagesToShow = (images, img) => {
        // console.log(idx)
        setAllImages(images)
        setSingleImage(img)
        setOpenPhotos(true)
    }

    return (
        <View style={styles.container}>
            {/* <Text style={{ marginTop: 10 }}>Welcome in client section!</Text> */}
            {
                customerSelected.nome_cognome === undefined ? null : <View style={{ width: "90%", height: "50%", marginTop: -40, alignItems: 'center' }}>
                    <FlashMessage position="top" style={{ zIndex: 1000 }} />
                    <Title style={{ fontWeight: "bold", zIndex: -1 }}>{customerSelected.nome_cognome}</Title>
                    {
                        !event.start ? null : <Paragraph style={{ marginTop: 10, fontSize: 15 }}><Text style={{ fontWeight: "bold" }}>Inizio:</Text> {event.start.replace("T", " ").replace("Z", " ")}</Paragraph>
                    }
                    {
                        !event.end ? null : <Paragraph style={{ fontSize: 15 }}><Text style={{ fontWeight: "bold" }}>Fine:</Text> {event.end.replace("T", " ").replace("Z", " ")}</Paragraph>
                    }
                    <Pressable onPress={() => {
                        setOpenNoteInfo(true)
                    }}><Icon name={"sticky-note-o"} size={25} style={{ marginTop: 5, marginLeft: 5 }} /></Pressable>
                    <Paragraph style={{ marginTop: 15, fontSize: 20 }}>{customerSelected.company}</Paragraph>
                    <Paragraph style={{ marginTop: 15, fontSize: 20, textDecorationLine: "underline" }} onPress={() => { Linking.openURL(`tel:${customerSelected.telefono}`) }}>{customerSelected.telefono}</Paragraph>
                    <Paragraph onPress={() => {
                        Clipboard.setString(customerSelected.indirizzo + "," + customerSelected.comune + "," + customerSelected.provincia)
                        setShowCopyboard(true)
                    }}
                        style={{ marginTop: 15, textDecorationLine: "underline" }}>{customerSelected.indirizzo} - {customerSelected.comune} - {customerSelected.provincia} - {customerSelected.cap}</Paragraph>
                    <Paragraph style={{ marginTop: 15, fontSize: 15 }}>{customerSelected.bonus} - {customerSelected.termico_elettrico}</Paragraph>
                    {
                        Platform.OS === 'android' ?
                            <SafeAreaView style={{ maxWidth: 300, maxHeight: "90%", marginTop: 20, alignItems: "center" }}>
                                <ScrollView showsVerticalScrollIndicator={false} persistentScrollbar={true} style={styles.scrollView}>
                                    <Pressable style={{ width: 300, height: 200, alignItems: "center" }}>
                                        <View style={{ flexDirection: "column" }}>
                                            <View style={{ flexDirection: "row", zIndex: -1 }}>
                                                <Pressable
                                                    style={[styles.button, styles.buttonOpen]}
                                                    onPress={() => {
                                                        setSection("sopralluogo")
                                                        setModalVisibleSopralluogo(true)
                                                    }}
                                                >
                                                    <Text style={styles.textStyle}>Sopralluogo</Text>
                                                </Pressable>
                                                <Pressable
                                                    style={[styles.button, styles.buttonOpen]}
                                                    onPress={() => {
                                                        setSection("installazione")
                                                        setModalVisibleInstallazione(true)
                                                    }}
                                                >
                                                    <Text style={styles.textStyle}>Installazione</Text>
                                                </Pressable>
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: "column", marginTop: 20 }}>
                                            <View style={{ flexDirection: "row", zIndex: -1 }}>
                                                {
                                                    !customerSelected.isAssisted ? null : <Pressable
                                                        style={[styles.button, styles.buttonOpen]}
                                                        onPress={() => {
                                                            setSection("assistenza")
                                                            setModalVisibleAssistenza(true)
                                                        }}
                                                    >
                                                        <Text style={styles.textStyle}>Assistenza</Text>
                                                    </Pressable>
                                                }
                                                {
                                                    user !== "admin" ? null : <Pressable
                                                        style={[styles.button, styles.buttonOpen]}
                                                        onPress={() => {
                                                            setSection("documenti")
                                                            setModalVisibleDocumenti(true)
                                                        }}
                                                    >
                                                        <Text style={styles.textStyle}>Documenti</Text>
                                                    </Pressable>
                                                }
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: "column", marginTop: 20 }}>
                                            <View style={{ flexDirection: "row", zIndex: -1 }}>
                                                {
                                                    !customerSelected.isArgo ? null : <Pressable
                                                        style={[styles.button, styles.buttonOpen]}
                                                        onPress={() => {
                                                            setSection("argo")
                                                            setModalVisibleArgo(true)
                                                        }}
                                                    >
                                                        <Text style={styles.textStyle}>Argo</Text>
                                                    </Pressable>
                                                }
                                                {
                                                    !customerSelected.isBuildAutomation ? null : <Pressable
                                                        style={[styles.button, styles.buttonOpen]}
                                                        onPress={() => {
                                                            setSection("buildAutomation")
                                                            setModalVisibleBuildAutomation(true)
                                                        }}
                                                    >
                                                        <Text style={styles.textStyle}>Building Automation</Text>
                                                    </Pressable>
                                                }
                                            </View>
                                        </View>
                                    </Pressable>
                                </ScrollView>
                            </SafeAreaView>
                            :
                            <>
                                <View style={{ marginTop: 20, marginLeft: 'auto', marginRight: 'auto', zIndex: -1 }}>
                                    <View style={{ flexDirection: "row", zIndex: -1 }}>
                                        <Pressable
                                            style={[styles.button, styles.buttonOpen]}
                                            onPress={() => {
                                                setSection("sopralluogo")
                                                setModalVisibleSopralluogo(true)
                                            }}
                                        >
                                            <Text style={styles.textStyle}>Sopralluogo</Text>
                                        </Pressable>
                                    </View>
                                </View>
                                <View style={{ marginTop: 10, marginLeft: 'auto', marginRight: 'auto' }}>
                                    <View style={{ flexDirection: "row", }}>
                                        <Pressable
                                            style={[styles.button, styles.buttonOpen]}
                                            onPress={() => {
                                                setSection("installazione")
                                                setModalVisibleInstallazione(true)
                                            }}
                                        >
                                            <Text style={styles.textStyle}>Installazione</Text>
                                        </Pressable>
                                    </View>
                                </View>
                                {
                                    !customerSelected.isAssisted ? null : <View style={{ marginTop: 10, marginLeft: 'auto', marginRight: 'auto' }}>
                                        <View style={{ flexDirection: "row", }}>
                                            <Pressable
                                                style={[styles.button, styles.buttonOpen]}
                                                onPress={() => {
                                                    setSection("assistenza")
                                                    setModalVisibleAssistenza(true)
                                                }}
                                            >
                                                <Text style={styles.textStyle}>Assistenza</Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                }
                                {
                                    user !== "admin" ? null : <View style={{ marginTop: 10, marginLeft: 'auto', marginRight: 'auto' }}>
                                        <View style={{ flexDirection: "row", }}>
                                            <Pressable
                                                style={[styles.button, styles.buttonOpen]}
                                                onPress={() => {
                                                    setSection("documenti")
                                                    setModalVisibleDocumenti(true)
                                                }}
                                            >
                                                <Text style={styles.textStyle}>Documenti</Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                }
                                {
                                    !customerSelected.isArgo ? null : <View style={{ marginTop: 10, marginLeft: 'auto', marginRight: 'auto' }}>
                                        <View style={{ flexDirection: "row", }}>
                                            <Pressable
                                                style={[styles.button, styles.buttonOpen]}
                                                onPress={() => {
                                                    setSection("argo")
                                                    setModalVisibleArgo(true)
                                                }}
                                            >
                                                <Text style={styles.textStyle}>Argo</Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                }
                                {
                                    !customerSelected.isBuildAutomation ? null : <View style={{ marginTop: 10, marginLeft: 'auto', marginRight: 'auto' }}>
                                        <View style={{ flexDirection: "row", }}>
                                            <Pressable
                                                style={[styles.button, styles.buttonOpen]}
                                                onPress={() => {
                                                    setSection("buildAutomation")
                                                    setModalVisibleBuildAutomation(true)
                                                }}
                                            >
                                                <Text style={styles.textStyle}>Building Automation</Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                }
                            </>
                    }
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
                !showCopyboard ? null : Alert.alert("Copiato negli appunti!")
            }
            {
                (customerSelected === undefined || customerSelected.foto_sopralluogo === undefined) ? null : <Provider>
                    <Portal>
                        <Dialog visible={openSopralluogo} onDismiss={() => { setOpenSopralluogo(false) }} style={{ height: "100%" }}>
                            {/* <Dialog.ScrollArea>
                                <ScrollView>
                                    {
                                        customerSelected.foto_sopralluogo.length === 0 ? <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 100 }}><Text>Non sono presenti foto.</Text></View> : <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 10 }}> */}
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
                            {/* <ImageView
                                                images={fotosToShow}
                                                imageIndex={0}
                                                visible={openSopralluogo}
                                                onRequestClose={() => setOpenSopralluogo(false)}
                                            />
                                        </View>
                                    }
                                </ScrollView >
                            </Dialog.ScrollArea> */}
                            {
                                customerSelected.foto_sopralluogo.length === 0 ? <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 30 }}><Text>Non sono presenti foto.</Text></View> : // <GridImageView transparent={1} data={customerSelected.foto_sopralluogo} visible={openSopralluogo} />
                                    <FlatGrid
                                        itemDimension={80}
                                        data={customerSelected.foto_sopralluogo}
                                        renderItem={(i) => {
                                            return <Pressable
                                                onPress={() => imagesToShow(customerSelected.foto_sopralluogo, i.item)}
                                            >
                                                <Image
                                                    style={styles.tinyLogo}
                                                    source={{ uri: i.item }}
                                                />
                                            </Pressable>
                                        }}
                                    />
                            }
                        </Dialog>
                    </Portal>
                </Provider>
            }

            {
                (customerSelected === undefined || customerSelected.foto_fine_installazione === undefined) ? null : <Provider>
                    <Portal>
                        <Dialog visible={openInstallazione} onDismiss={() => { setOpenInstallazione(false) }} style={{ height: "100%" }}>
                            {/* <Dialog.ScrollArea>
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
                            </Dialog.ScrollArea> */}
                            {
                                customerSelected.foto_fine_installazione.length === 0 ? <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 30 }}><Text>Non sono presenti foto.</Text></View> : // <GridImageView transparent={1} data={customerSelected.foto_fine_installazione} visible={openInstallazione} />
                                    <FlatGrid
                                        itemDimension={80}
                                        data={customerSelected.foto_fine_installazione}
                                        renderItem={(i) => {
                                            return <Pressable
                                                onPress={() => imagesToShow(customerSelected.foto_fine_installazione, i.item)}
                                            >
                                                <Image
                                                    style={styles.tinyLogo}
                                                    source={{ uri: i.item }}
                                                />
                                            </Pressable>
                                        }}
                                    />
                            }
                        </Dialog>
                    </Portal>
                </Provider>
            }
            {
                !openPhotos ? null : <Modal visible={modalImages} transparent={true}>
                    <ImageViewer index={allImages.indexOf(singleImage)} enableSwipeDown={true} onSwipeDown={() => {
                        setSingleImage("")
                        setAllImages([])
                        setOpenPhotos(false)
                    }} imageUrls={transformImageToUrls(allImages)} />
                </Modal>
            }
            {
                (customerSelected === undefined || customerSelected.foto_assistenza === undefined) ? null : <Provider>
                    <Portal>
                        <Dialog visible={openAssistenza} onDismiss={() => { setOpenAssistenza(false) }} style={{ height: "100%" }}>
                            {/* <Dialog.ScrollArea>
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
                            </Dialog.ScrollArea> */}
                            {
                                customerSelected.foto_assistenza.length === 0 ? <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 30 }}><Text>Non sono presenti foto.</Text></View> : // <GridImageView transparent={1} data={customerSelected.foto_assistenza} visible={openAssistenza} />
                                    <FlatGrid
                                        itemDimension={80}
                                        data={customerSelected.foto_assistenza}
                                        renderItem={(i) => {
                                            return <Pressable
                                                onPress={() => imagesToShow(customerSelected.foto_assistenza, i.item)}
                                            >
                                                <Image
                                                    style={styles.tinyLogo}
                                                    source={{ uri: i.item }}
                                                />
                                            </Pressable>
                                        }}
                                    />
                            }
                        </Dialog>
                    </Portal>
                </Provider>
            }
            {
                (customerSelected === undefined || customerSelected.foto_argo === undefined) ? null : <Provider>
                    <Portal>
                        <Dialog visible={openArgo} onDismiss={() => { setOpenArgo(false) }} style={{ height: "100%" }}>
                            {
                                customerSelected.foto_argo.length === 0 ? <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 30 }}><Text>Non sono presenti foto.</Text></View> : // <GridImageView transparent={1} enableImageZoom={true} data={customerSelected.foto_argo} visible={openAssistenza} />
                                    <FlatGrid
                                        itemDimension={80}
                                        data={customerSelected.foto_argo}
                                        renderItem={(i) => {
                                            return <Pressable
                                                onPress={() => imagesToShow(customerSelected.foto_argo, i.item)}
                                            >
                                                <Image
                                                    style={styles.tinyLogo}
                                                    source={{ uri: i.item }}
                                                />
                                            </Pressable>
                                        }}
                                    />
                            }
                        </Dialog>
                    </Portal>
                </Provider>
            }
            {
                (customerSelected === undefined || customerSelected.foto_buildAutomation === undefined) ? null : <Provider>
                    <Portal>
                        <Dialog visible={openBuildAutomation} onDismiss={() => { setOpenBuildAutomation(false) }} style={{ height: "100%" }}>
                            {
                                customerSelected.foto_buildAutomation.length === 0 ? <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 30 }}><Text>Non sono presenti foto.</Text></View> : // <GridImageView transparent={1} enableImageZoom={true} data={customerSelected.foto_buildAutomation} visible={openAssistenza} />
                                    <FlatGrid
                                        itemDimension={80}
                                        data={customerSelected.foto_buildAutomation}
                                        renderItem={(i) => {
                                            return <Pressable
                                                onPress={() => imagesToShow(customerSelected.foto_buildAutomation, i.item)}
                                            >
                                                <Image
                                                    style={styles.tinyLogo}
                                                    source={{ uri: i.item }}
                                                />
                                            </Pressable>
                                        }}
                                    />
                            }
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
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity style={{ flexGrow: 1 }} onPress={() => setModalVisibleSopralluogo(false)}>
                                    <Icon name={"close"} size={25} style={styles.modalHeaderCloseText} />
                                </TouchableOpacity>
                            </View>
                            <Title style={styles.modalText}>Sopralluogo</Title>
                            <View style={{ maxWidth: "100%", alignItems: "center" }}>
                                {/* <SafeAreaView style={{ maxHeight: "90%" }}>
                                    <ScrollView style={styles.scrollView}> */}
                                <View style={{ flexDirection: "row", }}>
                                    <Pressable
                                        style={[styles.button, styles.buttonOpen]}
                                        onPress={() => {
                                            setModalImages(true)
                                            setOpenSopralluogo(true)
                                            createImagesToShow(customerSelected.foto_sopralluogo)
                                            setModalVisibleSopralluogo(false)
                                        }}
                                    >
                                        <Text style={styles.textStyle}>Apri foto</Text>
                                    </Pressable>
                                </View>
                                {
                                    customerSelected.pdf_sopralluogo === undefined ? null : <View style={{ marginTop: 30 }}>
                                        {
                                            customerSelected.pdf_sopralluogo.length === 0 ? <Text style={{ color: "blue", marginTop: 20 }}>(no pdf)</Text> : <View style={{ marginTop: 20 }}>
                                                {
                                                    customerSelected.pdf_sopralluogo.map((pf, idx) => {
                                                        return <Text style={{ color: 'blue', marginBottom: 5, textDecorationLine: "underline", fontSize: 18 }}
                                                            onPress={() => Linking.openURL(pf)}>
                                                            {"modulo pdf"}
                                                        </Text>
                                                    })
                                                }
                                            </View>
                                        }
                                    </View>
                                }
                                <View style={{ marginTop: 10 }}>
                                    <View style={{ marginTop: 20, flexDirection: "row", marginRight: "auto" }}>
                                        <Text style={{ color: 'blue', marginBottom: 5, fontSize: 20 }}>Data:</Text><Text style={{ marginLeft: 5, fontSize: 20 }}>{customerSelected.data_sopralluogo}</Text>
                                    </View>
                                    <View style={{ marginTop: 5, flexDirection: "row", marginRight: "auto" }}>
                                        <Text style={{ color: 'blue', marginBottom: 5, fontSize: 20 }}>Tecnico:</Text><Text style={{ marginLeft: 5, fontSize: 20 }}>{customerSelected.tecnico_sopralluogo}</Text>
                                    </View>
                                    <View style={{ marginTop: 5, flexDirection: "row", marginRight: "auto" }}>
                                        <Text style={{ color: 'blue', marginBottom: 5, fontSize: 20 }}>Note:</Text><Text style={{ marginLeft: 5, fontSize: 20 }}>{customerSelected.note_sopralluogo}</Text>
                                    </View>
                                </View>
                                {
                                    !customerSelected || !customerSelected.foto_sopralluogo || customerSelected.foto_sopralluogo.length === 0 ? null :
                                        <Text style={{ bottom: -130, color: "red" }}>Attenzione: sono già presenti delle immagini di sopralluogo.</Text>
                                }
                                <View style={{ bottom: -140 }}>
                                    <Pressable
                                        style={[styles.button, styles.buttonOpen]}
                                        onPress={() => {
                                            pickImage("foto_sopralluogo")
                                            setModalVisibleSopralluogo(false)
                                        }}
                                    >
                                        <Text style={styles.textStyle}>Carica foto</Text>
                                    </Pressable>
                                </View>
                                {/* </ScrollView>
                                </SafeAreaView> */}
                            </View>
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
                            <View style={styles.modalHeader}>
                                <TouchableOpacity style={{ flexGrow: 1 }} onPress={() => setModalVisibleInstallazione(false)}>
                                    <Icon name={"close"} size={25} style={styles.modalHeaderCloseText} />
                                </TouchableOpacity>
                            </View>
                            <Title style={styles.modalText}>Installazione</Title>
                            <View>
                                <SafeAreaView style={{ maxWidth: 300, maxHeight: "90%", alignItems: "center" }}>
                                    <ScrollView showsVerticalScrollIndicator={false} persistentScrollbar={true} style={styles.scrollView}>
                                        <Pressable style={{ width: 300, alignItems: "center" }}>
                                            <View style={{ maxWidth: 300 }}>
                                                <View style={{ marginTop: 10, flexDirection: "row", marginRight: "auto" }}>
                                                    <Text style={{ color: 'blue', marginBottom: 5, fontSize: 20, maxWidth: 300 }}>Data:</Text><Text style={{ marginLeft: 5, fontSize: 20 }}>{customerSelected.data_installazione}</Text>
                                                </View>
                                                <View style={{ marginTop: 5, flexDirection: "row", marginRight: "auto" }}>
                                                    <Text style={{ color: 'blue', marginBottom: 5, fontSize: 20, maxWidth: 300 }}>Tecnico:</Text><Text style={{ marginLeft: 5, fontSize: 20 }}>{customerSelected.tecnico_installazione}</Text>
                                                </View>
                                                <View style={{ marginTop: 5, flexDirection: "column", marginRight: "auto" }}>
                                                    <Text style={{ color: 'blue', marginBottom: 5, fontSize: 20, maxWidth: 300 }}>Computo (testo):</Text><Text style={{ fontSize: 20 }}>{customerSelected.computo}</Text>
                                                </View>
                                            </View>
                                            {
                                                customerSelected.pdf_computo === undefined ? null : <View style={{ marginTop: 10, marginBottom: 10 }}>
                                                    {
                                                        customerSelected.pdf_computo.length === 0 ? <Text style={{ color: "blue", marginTop: 20 }}>(no pdf)</Text> :
                                                            <View style={{ marginTop: 20 }}>
                                                                {
                                                                    customerSelected.pdf_computo.map((pc, idx) => {
                                                                        return <Text style={{ color: 'blue', marginBottom: 5, textDecorationLine: "underline", fontSize: 20 }}
                                                                            onPress={() => Linking.openURL(pc)}>
                                                                            {pc.split("%2F")[2].split("?alt")[0].replace("%20", " ").replace("%20", " ").replace("%20", " ").replace("%20", " ")}
                                                                        </Text>
                                                                    })
                                                                }
                                                            </View>
                                                    }
                                                </View>
                                            }
                                            <View style={{ marginTop: 10, flexDirection: "row", marginRight: "auto" }}>
                                                <Text style={{ color: 'blue', marginBottom: 5, fontSize: 20 }}>Note:</Text><Text style={{ marginLeft: 5, fontSize: 20 }}>{customerSelected.note_installazione}</Text>
                                            </View>
                                            <View style={{ flexDirection: "column", marginTop: 30 }}>
                                                <Pressable
                                                    style={[styles.button, styles.buttonOpen, { marginBottom: 5 }]}
                                                    onPress={() => {
                                                        setModalImages(true)
                                                        setOpenInstallazione(true)
                                                        createImagesToShow(customerSelected.foto_fine_installazione)
                                                        setModalVisibleInstallazione(false)
                                                    }}
                                                >
                                                    <Text style={styles.textStyle}>Apri foto</Text>
                                                </Pressable>
                                                <Pressable
                                                    style={[styles.button, styles.buttonOpen]}
                                                    onPress={() => {
                                                        pickImage("foto_fine_installazione")
                                                        setModalVisibleInstallazione(false)
                                                    }}
                                                >
                                                    <Text style={styles.textStyle}>Carica foto</Text>
                                                </Pressable>
                                            </View>
                                        </Pressable>
                                    </ScrollView>
                                </SafeAreaView>
                            </View>
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
                            <View style={styles.modalHeader}>
                                <TouchableOpacity style={{ flexGrow: 1 }} onPress={() => setModalVisibleAssistenza(false)}>
                                    <Icon name={"close"} size={25} style={styles.modalHeaderCloseText} />
                                </TouchableOpacity>
                            </View>
                            <Title style={styles.modalText}>Assistenza</Title>
                            <View>
                                <SafeAreaView style={{ maxWidth: 300, maxHeight: "90%", alignItems: "center" }}>
                                    <ScrollView showsVerticalScrollIndicator={false} persistentScrollbar={true} style={styles.scrollView}>
                                        <Pressable>
                                            <View style={{ flexDirection: "column" }}>
                                                <Pressable
                                                    style={[styles.button, styles.buttonOpen, { marginBottom: 5 }]}
                                                    onPress={() => {
                                                        setModalImages(true)
                                                        setOpenAssistenza(true)
                                                        createImagesToShow(customerSelected.foto_assistenza)
                                                        setModalVisibleAssistenza(false)
                                                    }}
                                                >
                                                    <Text style={styles.textStyle}>Apri foto</Text>
                                                </Pressable>
                                                <Pressable
                                                    style={[styles.button, styles.buttonOpen]}
                                                    onPress={() => {
                                                        pickImage("foto_assistenza")
                                                        setModalVisibleAssistenza(false)
                                                    }}
                                                >
                                                    <Text style={styles.textStyle}>Carica foto</Text>
                                                </Pressable>
                                            </View>
                                            <View style={{ marginTop: 10 }}>
                                                <View style={{ marginTop: 20, flexDirection: "row", marginRight: "auto" }}>
                                                    <Text style={{ color: 'blue', marginBottom: 5, fontSize: 20 }}>Data:</Text><Text style={{ marginLeft: 5, fontSize: 20 }}>{customerSelected.data_assistenza}</Text>
                                                </View>
                                                <View style={{ marginTop: 5, flexDirection: "row", marginRight: "auto" }}>
                                                    <Text style={{ color: 'blue', marginBottom: 5, fontSize: 20 }}>Tecnico:</Text><Text style={{ marginLeft: 5, fontSize: 20 }}>{customerSelected.tecnico_assistenza}</Text>
                                                </View>
                                                <View style={{ marginTop: 5, flexDirection: "row", marginRight: "auto" }}>
                                                    <Text style={{ color: 'blue', marginBottom: 5, fontSize: 20 }}>Note:</Text><Text style={{ marginLeft: 5, fontSize: 20 }}>{customerSelected.note_assistenza}</Text>
                                                </View>
                                            </View>
                                            {
                                                customerSelected.assistenza === undefined ? null : <View>
                                                    {
                                                        customerSelected.assistenza.length === 0 || customerSelected.assistenza[0] === "" ? <Text style={{ color: "blue", marginTop: 20 }}>(no pdf)</Text> :
                                                            <View style={{ marginTop: 20 }}>
                                                                {
                                                                    customerSelected.assistenza.map((pi, idx) => {
                                                                        return <Text style={{ color: 'blue', marginBottom: 5, textDecorationLine: "underline", fontSize: 20 }}
                                                                            onPress={() => Linking.openURL(pi)}>
                                                                            {pi.split("%2F")[2].split("?alt")[0].replace("%20", " ").replace("%20", " ").replace("%20", " ").replace("%20", " ")}
                                                                        </Text>
                                                                    })
                                                                }
                                                            </View>
                                                    }
                                                </View>
                                            }
                                        </Pressable>
                                    </ScrollView>
                                </SafeAreaView>
                            </View>
                        </View>
                    </View>
                </Pressable>
            </Modal>

            <Modal
                visible={modalVisibleDocumenti}
                onRequestClose={() => setModalVisibleDocumenti(false)}
                animationType="slide"
                transparent={true}>
                <Pressable style={styles.outsideModal}
                    onPress={(event) => {
                        if (event.target == event.currentTarget) {
                            setModalVisibleDocumenti(false);
                        }
                    }} >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity style={{ flexGrow: 1 }} onPress={() => setModalVisibleDocumenti(false)}>
                                    <Icon name={"close"} size={25} style={styles.modalHeaderCloseText} />
                                </TouchableOpacity>
                            </View>
                            <Title style={styles.modalText}>Documenti</Title>
                            <View>
                                <SafeAreaView style={{ maxWidth: 300, maxHeight: "90%", alignItems: "center" }}>
                                    <ScrollView showsVerticalScrollIndicator={false} persistentScrollbar={true} style={styles.scrollView}>
                                        <Pressable>
                                            <View>
                                                <View style={{ marginTop: 15, flexDirection: "row", marginRight: "auto" }}>
                                                    <Text style={{ color: 'blue', marginBottom: 5, fontSize: 20 }}>Pagamenti (testo):</Text><Text style={{ marginLeft: 5, fontSize: 20 }}>{customerSelected.pagamenti_testo}</Text>
                                                </View>
                                            </View>
                                            <View>
                                                <View style={{ marginTop: 15, flexDirection: "row", marginRight: "auto" }}>
                                                    <Text style={{ color: 'blue', marginBottom: 5, fontSize: 20 }}>Trasferta:</Text><Text style={{ marginLeft: 5, fontSize: 20 }}>{customerSelected.trasferta}</Text>
                                                </View>
                                            </View>
                                            {
                                                customerSelected.pagamenti_pdf === undefined ? null : <View style={{ marginTop: 20 }}>
                                                    <Text style={{ color: 'blue', marginBottom: 5, fontSize: 20 }}>Pagamenti (pdf):</Text>
                                                    {
                                                        customerSelected.pagamenti_pdf.length === 0 ? <Text style={{ marginTop: 5 }}>(no pdf)</Text> :
                                                            <View>
                                                                {
                                                                    customerSelected.pagamenti_pdf.map((pi, idx) => {
                                                                        return <Text style={{ marginBottom: 5, textDecorationLine: "underline", fontSize: 20 }}
                                                                            onPress={() => Linking.openURL(pi)}>
                                                                            {pi.split("%2F")[2].split("?alt")[0].replace("%20", " ").replace("%20", " ").replace("%20", " ").replace("%20", " ")}
                                                                        </Text>
                                                                    })
                                                                }
                                                            </View>
                                                    }
                                                </View>
                                            }
                                            {
                                                customerSelected.collaudo === undefined ? null : <View style={{ marginTop: 10 }}>
                                                    <Text style={{ color: 'blue', marginBottom: 5, fontSize: 20 }}>Collaudo:</Text>
                                                    {
                                                        customerSelected.collaudo.length === 0 ? <Text style={{ marginTop: 5 }}>(no pdf)</Text> :
                                                            <View>
                                                                {
                                                                    customerSelected.collaudo.map((pi, idx) => {
                                                                        return <Text style={{ marginBottom: 5, textDecorationLine: "underline", fontSize: 20 }}
                                                                            onPress={() => Linking.openURL(pi)}>
                                                                            {pi.split("%2F")[2].split("?alt")[0].replace("%20", " ").replace("%20", " ").replace("%20", " ").replace("%20", " ").replace("%20", " ")}
                                                                        </Text>
                                                                    })
                                                                }
                                                            </View>
                                                    }
                                                </View>
                                            }
                                            {
                                                customerSelected.check_list === undefined ? null : <View style={{ marginTop: 10 }}>
                                                    <Text style={{ color: 'blue', marginBottom: 5, fontSize: 20 }}>Check list:</Text>
                                                    {
                                                        customerSelected.check_list.length === 0 ? <Text style={{ marginTop: 5 }}>(no pdf)</Text> :
                                                            <View>
                                                                {
                                                                    customerSelected.check_list.map((pi, idx) => {
                                                                        return <Text style={{ marginBottom: 5, textDecorationLine: "underline", fontSize: 20 }}
                                                                            onPress={() => Linking.openURL(pi)}>
                                                                            {pi.split("%2F")[2].split("?alt")[0].replace("%20", " ").replace("%20", " ").replace("%20", " ").replace("%20", " ")}
                                                                        </Text>
                                                                    })
                                                                }
                                                            </View>
                                                    }
                                                </View>
                                            }
                                            {
                                                customerSelected.fgas === undefined ? null : <View style={{ marginTop: 10 }}>
                                                    <Text style={{ color: 'blue', marginBottom: 5, fontSize: 20 }}>Fgas:</Text>
                                                    {
                                                        customerSelected.fgas.length === 0 ? <Text style={{ marginTop: 5 }}>(no pdf)</Text> :
                                                            <View>
                                                                {
                                                                    customerSelected.fgas.map((pi, idx) => {
                                                                        return <Text style={{ marginBottom: 5, textDecorationLine: "underline", fontSize: 20 }}
                                                                            onPress={() => Linking.openURL(pi)}>
                                                                            {pi.split("%2F")[2].split("?alt")[0].replace("%20", " ").replace("%20", " ").replace("%20", " ").replace("%20", " ")}
                                                                        </Text>
                                                                    })
                                                                }
                                                            </View>
                                                    }
                                                </View>
                                            }
                                            {
                                                customerSelected.prova_fumi === undefined ? null : <View style={{ marginTop: 10 }}>
                                                    <Text style={{ color: 'blue', marginBottom: 5, fontSize: 20 }}>Prova fumi:</Text>
                                                    {
                                                        customerSelected.prova_fumi.length === 0 ? <Text style={{ marginTop: 5 }}>(no pdf)</Text> :
                                                            <View>
                                                                {
                                                                    customerSelected.prova_fumi.map((pi, idx) => {
                                                                        return <Text style={{ marginBottom: 5, textDecorationLine: "underline", fontSize: 20 }}
                                                                            onPress={() => Linking.openURL(pi)}>
                                                                            {pi.split("%2F")[2].split("?alt")[0].replace("%20", " ").replace("%20", " ").replace("%20", " ").replace("%20", " ")}
                                                                        </Text>
                                                                    })
                                                                }
                                                            </View>
                                                    }
                                                </View>
                                            }
                                            <View style={{ marginTop: 10 }}>
                                                <View style={{ marginTop: 5, flexDirection: "row", marginRight: "auto" }}>
                                                    <Text style={{ color: 'blue', marginBottom: 5, fontSize: 20 }}>Note:</Text><Text style={{ marginLeft: 5, fontSize: 20 }}>{customerSelected.note_pagamenti}</Text>
                                                </View>
                                            </View>
                                        </Pressable>
                                    </ScrollView>
                                </SafeAreaView>
                            </View>
                        </View>
                    </View>
                </Pressable>
            </Modal>

            <Modal
                visible={modalVisibleArgo}
                onRequestClose={() => setModalVisibleArgo(false)}
                animationType="slide"
                transparent={true}>
                <Pressable style={styles.outsideModal}
                    onPress={(event) => {
                        if (event.target == event.currentTarget) {
                            setModalVisibleArgo(false);
                        }
                    }} >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity style={{ flexGrow: 1 }} onPress={() => setModalVisibleArgo(false)}>
                                    <Icon name={"close"} size={25} style={styles.modalHeaderCloseText} />
                                </TouchableOpacity>
                            </View>
                            <Title style={styles.modalText}>Argo</Title>
                            <View>
                                <SafeAreaView style={{ maxWidth: 300, maxHeight: "90%", alignItems: "center" }}>
                                    <ScrollView showsVerticalScrollIndicator={false} persistentScrollbar={true} style={styles.scrollView}>
                                        <Pressable>
                                            <View style={{ flexDirection: "column" }}>
                                                <Pressable
                                                    style={[styles.button, styles.buttonOpen, { marginBottom: 5 }]}
                                                    onPress={() => {
                                                        setModalImages(true)
                                                        setOpenArgo(true)
                                                        createImagesToShow(customerSelected.foto_argo)
                                                        setModalVisibleArgo(false)
                                                    }}
                                                >
                                                    <Text style={styles.textStyle}>Apri foto</Text>
                                                </Pressable>
                                                <Pressable
                                                    style={[styles.button, styles.buttonOpen]}
                                                    onPress={() => {
                                                        pickImage("foto_argo")
                                                        setModalVisibleArgo(false)
                                                    }}
                                                >
                                                    <Text style={styles.textStyle}>Carica foto</Text>
                                                </Pressable>
                                            </View>
                                            <View style={{ marginTop: 10 }}>
                                                <View style={{ marginTop: 20, flexDirection: "row", marginRight: "auto" }}>
                                                    <Text style={{ color: 'blue', marginBottom: 5, fontSize: 20 }}>Data:</Text><Text style={{ marginLeft: 5, fontSize: 20 }}>{customerSelected.data_argo}</Text>
                                                </View>
                                                <View style={{ marginTop: 5, flexDirection: "row", marginRight: "auto" }}>
                                                    <Text style={{ color: 'blue', marginBottom: 5, fontSize: 20 }}>Tecnico:</Text><Text style={{ marginLeft: 5, fontSize: 20 }}>{customerSelected.tecnico_argo}</Text>
                                                </View>
                                                <View style={{ marginTop: 5, flexDirection: "row", marginRight: "auto" }}>
                                                    <Text style={{ color: 'blue', marginBottom: 5, fontSize: 20 }}>Note:</Text><Text style={{ marginLeft: 5, fontSize: 20 }}>{customerSelected.note_argo}</Text>
                                                </View>
                                            </View>
                                            {
                                                customerSelected.argo_pdf === undefined ? null : <View>
                                                    {
                                                        customerSelected.argo_pdf.length === 0 || customerSelected.argo_pdf[0] === "" ? <Text style={{ color: "blue", marginTop: 20 }}>(no pdf)</Text> :
                                                            <View style={{ marginTop: 20 }}>
                                                                {
                                                                    customerSelected.argo_pdf.map((pi, idx) => {
                                                                        return <Text style={{ color: 'blue', marginBottom: 5, textDecorationLine: "underline", fontSize: 20 }}
                                                                            onPress={() => Linking.openURL(pi)}>
                                                                            {pi.split("%2F")[2].split("?alt")[0].replace("%20", " ").replace("%20", " ").replace("%20", " ").replace("%20", " ")}
                                                                        </Text>
                                                                    })
                                                                }
                                                            </View>
                                                    }
                                                </View>
                                            }
                                        </Pressable>
                                    </ScrollView>
                                </SafeAreaView>
                            </View>
                        </View>
                    </View>
                </Pressable>
            </Modal>

            <Modal
                visible={modalVisibleBuildAutomation}
                onRequestClose={() => setModalVisibleBuildAutomation(false)}
                animationType="slide"
                transparent={true}>
                <Pressable style={styles.outsideModal}
                    onPress={(event) => {
                        if (event.target == event.currentTarget) {
                            setModalVisibleBuildAutomation(false);
                        }
                    }} >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity style={{ flexGrow: 1 }} onPress={() => setModalVisibleBuildAutomation(false)}>
                                    <Icon name={"close"} size={25} style={styles.modalHeaderCloseText} />
                                </TouchableOpacity>
                            </View>
                            <Title style={styles.modalText}>Building Automation</Title>
                            <View>
                                <SafeAreaView style={{ maxWidth: 300, maxHeight: "90%", alignItems: "center" }}>
                                    <ScrollView showsVerticalScrollIndicator={false} persistentScrollbar={true} style={styles.scrollView}>
                                        <Pressable>
                                            <View style={{ flexDirection: "column" }}>
                                                <Pressable
                                                    style={[styles.button, styles.buttonOpen, { marginBottom: 5 }]}
                                                    onPress={() => {
                                                        setModalImages(true)
                                                        setOpenBuildAutomation(true)
                                                        createImagesToShow(customerSelected.foto_buildAutomation)
                                                        setModalVisibleBuildAutomation(false)
                                                    }}
                                                >
                                                    <Text style={styles.textStyle}>Apri foto</Text>
                                                </Pressable>
                                                <Pressable
                                                    style={[styles.button, styles.buttonOpen]}
                                                    onPress={() => {
                                                        pickImage("foto_buildAutomation")
                                                        setModalVisibleBuildAutomation(false)
                                                    }}
                                                >
                                                    <Text style={styles.textStyle}>Carica foto</Text>
                                                </Pressable>
                                            </View>
                                            <View style={{ marginTop: 10 }}>
                                                <View style={{ marginTop: 20, flexDirection: "row", marginRight: "auto" }}>
                                                    <Text style={{ color: 'blue', marginBottom: 5, fontSize: 20 }}>Data:</Text><Text style={{ marginLeft: 5, fontSize: 20 }}>{customerSelected.data_buildAutomation}</Text>
                                                </View>
                                                <View style={{ marginTop: 5, flexDirection: "row", marginRight: "auto" }}>
                                                    <Text style={{ color: 'blue', marginBottom: 5, fontSize: 20 }}>Tecnico:</Text><Text style={{ marginLeft: 5, fontSize: 20 }}>{customerSelected.tecnico_buildAutomation}</Text>
                                                </View>
                                                <View style={{ marginTop: 5, flexDirection: "row", marginRight: "auto" }}>
                                                    <Text style={{ color: 'blue', marginBottom: 5, fontSize: 20 }}>Note:</Text><Text style={{ marginLeft: 5, fontSize: 20 }}>{customerSelected.note_buildAutomation}</Text>
                                                </View>
                                            </View>
                                            {
                                                customerSelected.buildAutomation_pdf === undefined ? null : <View>
                                                    {
                                                        customerSelected.buildAutomation_pdf.length === 0 || customerSelected.buildAutomation_pdf[0] === "" ? <Text style={{ color: "blue", marginTop: 20 }}>(no pdf)</Text> :
                                                            <View style={{ marginTop: 20 }}>
                                                                {
                                                                    customerSelected.buildAutomation_pdf.map((pi, idx) => {
                                                                        return <Text style={{ color: 'blue', marginBottom: 5, textDecorationLine: "underline", fontSize: 20 }}
                                                                            onPress={() => Linking.openURL(pi)}>
                                                                            {pi.split("%2F")[2].split("?alt")[0].replace("%20", " ").replace("%20", " ").replace("%20", " ").replace("%20", " ")}
                                                                        </Text>
                                                                    })
                                                                }
                                                            </View>
                                                    }
                                                </View>
                                            }
                                        </Pressable>
                                    </ScrollView>
                                </SafeAreaView>
                            </View>
                        </View>
                    </View>
                </Pressable>
            </Modal>

            <Modal
                visible={openNoteInfo}
                onRequestClose={() => setOpenNoteInfo(false)}
                animationType="slide"
                transparent={true}>
                <Pressable style={styles.outsideModal}
                    onPress={(event) => {
                        if (event.target == event.currentTarget) {
                            setOpenNoteInfo(false);
                        }
                    }} >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity style={{ flexGrow: 1 }} onPress={() => setOpenNoteInfo(false)}>
                                    <Icon name={"close"} size={25} style={styles.modalHeaderCloseText} />
                                </TouchableOpacity>
                            </View>
                            <Title style={styles.modalText}>Note info</Title>
                            <View>
                                <SafeAreaView style={{ maxWidth: 300, maxHeight: "90%", alignItems: "center" }}>
                                    <ScrollView showsVerticalScrollIndicator={false} persistentScrollbar={true} style={styles.scrollView}>
                                        <Pressable>
                                            <View style={{ flexDirection: "column" }}>
                                                <Text>{customerSelected.note_info && customerSelected.note_info.length > 0 ? customerSelected.note_info : "Non sono presenti note sulle info del cliente"}</Text>
                                            </View>
                                        </Pressable>
                                    </ScrollView>
                                </SafeAreaView>
                            </View>
                        </View>
                    </View>
                </Pressable>
            </Modal>
        </View >
    );
}
