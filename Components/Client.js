import { axiosInstance, beUrl } from "../config.js"
import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert, Linking, SafeAreaView, ScrollView, Image, Modal, StatusBar, Pressable, TouchableOpacity } from 'react-native';
import { Menu, Card, Button, Title, Paragraph, Provider, Dialog, Portal, List } from 'react-native-paper';
// import ImageView from "react-native-image-viewing";
import { getDownloadURL, ref, uploadBytesResumable, getStorage, deleteObject, uploadString } from "firebase/storage";
import { storage } from "../firebase";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown'
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

export default function Client(props) {

    const [customers, setCustomers] = React.useState([]);
    const [fotosToShow, setFotosToShow] = React.useState([]);
    const [customerSelected, setCustomerSelected] = React.useState({});
    const [isLoading, setIsLoading] = React.useState(false);
    const [showError, setShowError] = React.useState(false);
    const [showCopyboard, setShowCopyboard] = React.useState(false);
    const [visible, setVisible] = React.useState(false);
    const [openSopralluogo, setOpenSopralluogo] = React.useState(false);
    const [openInstallazione, setOpenInstallazione] = React.useState(false);
    const [openAssistenza, setOpenAssistenza] = React.useState(false);
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
    const [singleImage, setSingleImage] = React.useState("");
    const [allImages, setAllImages] = React.useState([]);
    const [openPhotos, setOpenPhotos] = React.useState(false);
    const [modalImages, setModalImages] = React.useState(false);
    const [dataset, setDataset] = React.useState(null)

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
        if (props.route.params !== undefined && props.route.params.photos !== undefined) {
            var customer = {}
            customer[typology] = customerSelected[typology]
            let phs = props.route.params.photos
            // while (phs.length) {
            // console.log(phs.splice(0, 4));
            let finished = []
            for (let s of phs) {
                // console.log(s)
                finished.push(uploadImageAsync(s))
                // await uploadImageAsync(s)
            }
            finished = await Promise.allSettled(finished)
            showMessage({
                message: "Foto caricate correttamente!",
                type: "info",
                backgroundColor: "green",
                color: "white"
            });
            // console.log(finished)
            // }
            // let arrayPhotos = props.route.params.photos
            // while (arrayPhotos.length) {
            //    // console.log("ciao")
            //    // console.log(arrayPhotos.splice(0, 4));
            //     uploadImageAsync(arrayPhotos.splice(0, 4))
            // }
            props.route.params = {}
        }
        if (props.route.params !== undefined && props.route.params.customerSelected !== undefined) {
            setCustomerSelected(props.route.params.customerSelected)
        }
        // });
    }, [props]);

    React.useEffect(() => {
        if (token && user) {
            checkUserExternal();
        }
    }, [token, user]);

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

    const checkUserExternal = () => {
        setIsLoading(true)
        if (user !== "admin") {
            axiosInstance.get(beUrl + 'employeeIsExternal', { headers: { "Authorization": `Bearer ${token}` }, params: { user: user } }) // { headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` } }
                .then(res => {
                    if (res.data) {
                        getCustomers(user)
                    } else {
                        getCustomers()
                    }
                }).catch(error => {
                    // console.log("error")
                    // console.log(error)
                    if (error.response.status === 401) {
                        userIsAuthenticated()
                    }
                    setIsLoading(false)
                    setShowError(true)
                });
        } else {
            getCustomers()
        }
    }

    async function uploadImageAsync(ph) {
        return new Promise(async (resolve, reject) => {
            const blob = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = function () {
                    resolve(xhr.response);
                };
                xhr.onerror = function (e) {
                    // console.log(e);
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
                // console.log("error: ", error)
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
                                // console.log("error: ", error)
                                setIsLoading(false)
                                setShowError(true)
                                reject(error);
                            });
                        }).catch((error) => {
                            // console.log("error: ", error)
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

    const getCustomers = (user) => {
        setIsLoading(true)
        // axiosInstance.get(beUrl + 'employeeIsExternal', { headers: { "Authorization": `Bearer ${token}` } }).then(()=>{
        //     axiosInstance.get(beUrl + 'customer', { headers: { "Authorization": `Bearer ${token}` } })
        //         .then(res => {
        //             let custs = res.data
        //             custs.sort((a, b) => (a.nome_cognome.toUpperCase() > b.nome_cognome.toUpperCase()) ? 1 : -1)
        //             let ds = res.data.map((cust) => ({
        //                 id: cust.nome_cognome,
        //                 title: cust.nome_cognome,
        //                 customerSelected: cust
        //             }))
        //             setDataset(ds)
        //             // console.log("Tools: ", res.data)
        //             setCustomers(custs)
        //             setIsLoading(false)
        //         }).catch(error => {
        //             setIsLoading(false)
        //            // console.log("Customer not found")
        //             setShowError(true)
        //         });
        // }).catch(()=>{
        //     setIsLoading(false)
        //    // console.log("Error")
        //     setShowError(true)
        // })
        if (user === undefined) {
            axiosInstance.get(beUrl + 'customer', { headers: { "Authorization": `Bearer ${token}` } })
                .then(res => {
                    let custs = res.data
                    custs.sort((a, b) => (a.nome_cognome.toUpperCase() > b.nome_cognome.toUpperCase()) ? 1 : -1)
                    let ds = res.data.map((cust) => ({
                        id: cust.nome_cognome,
                        title: cust.nome_cognome,
                        customerSelected: cust
                    }))
                    setDataset(ds)
                    // console.log("Tools: ", res.data)
                    setCustomers(custs)
                    setIsLoading(false)
                }).catch(error => {
                    setIsLoading(false)
                    // console.log("Customer not found")
                    setShowError(true)
                })
        } else {
            axiosInstance.get(beUrl + 'customer', { headers: { "Authorization": `Bearer ${token}` }, params: { user: user } })
                .then(res => {
                    let custs = res.data
                    custs.sort((a, b) => (a.nome_cognome.toUpperCase() > b.nome_cognome.toUpperCase()) ? 1 : -1)
                    let ds = res.data.map((cust) => ({
                        id: cust.nome_cognome,
                        title: cust.nome_cognome,
                        customerSelected: cust
                    }))
                    setDataset(ds)
                    // console.log("Tools: ", res.data)
                    setCustomers(custs)
                    setIsLoading(false)
                }).catch(error => {
                    setIsLoading(false)
                    // console.log("Customer not found")
                    setShowError(true)
                })
        }
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
        // console.log(ftss)
        setFotosToShow(ftss)
    }

    const pickImage = (typo) => {
        setTypology(typo)
        navigate('ImageBrowser')
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
                customers === null ? null : <Provider>
                    <FlashMessage position="top" style={{ zIndex: 1000 }} />
                    <View
                        style={{
                            marginTop: 20,
                            flexDirection: 'column',
                            justifyContent: 'center',
                        }}>
                        <Text>Seleziona cliente</Text>
                        <AutocompleteDropdown
                            clearOnFocus={false}
                            closeOnBlur={true}
                            closeOnSubmit={false}
                            // initialValue={{ id: '2' }} // or just '2'
                            onSelectItem={(event) => {
                                if (event !== null) {
                                    openCustomer(event.customerSelected)
                                }
                            }}
                            textInputProps={{
                                style: {
                                    width: 300,
                                    color: "black",
                                    zIndex: 999,
                                },
                                zIndex: 999
                            }}
                            rightButtonsContainerStyle={{
                                borderRadius: 25,
                                alignSelfs: "center",
                                color: "black",
                                zIndex: 999
                            }}
                            inputContainerStyle={{
                                backgroundColor: "white",
                                borderWidth: 1,
                                borderStyle: "solid",
                                // borderRadius: 10,
                                borderColor: "black",
                                zIndex: 999
                            }}
                            suggestionsListContainerStyle={{
                                zIndex: 999
                            }}
                            containerStyle={{ flexGrow: 1, flexShrink: 1 }}
                            dataSet={dataset}
                        />
                    </View>
                </Provider>
            }
            {
                customerSelected.nome_cognome === undefined ? null : <View style={{ width: "90%", height: "50%", alignItems: 'center', zIndex: -1 }}>
                    <Title style={{ fontWeight: "bold" }}>{customerSelected.nome_cognome}</Title>
                    <Paragraph style={{ marginTop: 15, fontSize: 20 }}>{customerSelected.company}</Paragraph>
                    <Paragraph style={{ marginTop: 15, fontSize: 20, textDecorationLine: "underline" }} onPress={() => { Linking.openURL(`tel:${customerSelected.telefono}`) }}>{customerSelected.telefono}</Paragraph>
                    <Paragraph onPress={() => {
                        Clipboard.setString(customerSelected.indirizzo + "," + customerSelected.comune + "," + customerSelected.provincia)
                        setShowCopyboard(true)
                    }}
                        style={{ marginTop: 15, textDecorationLine: "underline" }}>{customerSelected.indirizzo} - {customerSelected.comune} - {customerSelected.provincia} - {customerSelected.cap}</Paragraph>
                    <Paragraph style={{ marginTop: 15, fontSize: 15 }}>{customerSelected.bonus} - {customerSelected.termico_elettrico}</Paragraph>
                    <View style={{ marginTop: 40, marginLeft: 'auto', marginRight: 'auto' }}>
                        <View style={{ flexDirection: "row", }}>
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
                    <View style={{ marginTop: 40, marginLeft: 'auto', marginRight: 'auto' }}>
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
                        !customerSelected.isAssisted ? null : <View style={{ marginTop: 40, marginLeft: 'auto', marginRight: 'auto' }}>
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
                        user !== "admin" ? null : <View style={{ marginTop: 40, marginLeft: 'auto', marginRight: 'auto' }}>
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
                            {
                                customerSelected.foto_sopralluogo.length === 0 ? <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 30 }}><Text>Non sono presenti foto.</Text></View> : // <GridImageView transparent={1} enableImageZoom={true} data={customerSelected.foto_sopralluogo} visible={openSopralluogo} />
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
                            {
                                customerSelected.foto_fine_installazione.length === 0 ? <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 30 }}><Text>Non sono presenti foto.</Text></View> : //<GridImageView transparent={1} enableImageZoom={true} data={customerSelected.foto_fine_installazione} visible={openInstallazione} onPress={() => console.log("ciao")} renderModalImage={(is) => imagesToShow(is, customerSelected.foto_fine_installazione.indexOf(is))} />
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
                            {
                                customerSelected.foto_assistenza.length === 0 ? <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 30 }}><Text>Non sono presenti foto.</Text></View> : // <GridImageView transparent={1} enableImageZoom={true} data={customerSelected.foto_assistenza} visible={openAssistenza} />
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
                            <View style={{ maxWidth: "100%", alignItems: "center", marginRight: 'auto', marginLeft: 'auto' }}>
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
                                    <View style={{ marginTop: 20, flexDirection: "row" }}>
                                        <Text style={{ color: 'blue', marginBottom: 5, fontSize: 20 }}>Data:</Text><Text style={{ marginLeft: 5, fontSize: 20 }}>{customerSelected.data_sopralluogo}</Text>
                                    </View>
                                    <View style={{ marginTop: 5, flexDirection: "row" }}>
                                        <Text style={{ color: 'blue', marginBottom: 5, fontSize: 20 }}>Tecnico:</Text><Text style={{ marginLeft: 5, fontSize: 20 }}>{customerSelected.tecnico_sopralluogo}</Text>
                                    </View>
                                    <View style={{ marginTop: 5, flexDirection: "row" }}>
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
                                    <ScrollView showsVerticalScrollIndicator={true} persistentScrollbar={true} style={styles.scrollView}>
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
                                    <ScrollView showsVerticalScrollIndicator={true} persistentScrollbar={true} style={styles.scrollView}>
                                        <Pressable>
                                            <View style={{ flexDirection: "columns", }}>
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
                                                        customerSelected.assistenza.length === 0 ? <Text style={{ color: "blue", marginTop: 20 }}>(no pdf)</Text> :
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
                                    <ScrollView showsVerticalScrollIndicator={true} persistentScrollbar={true} style={styles.scrollView}>
                                        <Pressable>
                                            <View>
                                                <View style={{ marginTop: 15, flexDirection: "row", marginRight: "auto" }}>
                                                    <Text style={{ color: 'blue', marginBottom: 5, fontSize: 20 }}>Pagamenti (testo):</Text><Text style={{ marginLeft: 5, fontSize: 20 }}>{customerSelected.pagamenti_testo}</Text>
                                                </View>
                                            </View>
                                            {
                                                customerSelected.pagamenti_pdf === undefined ? null : <View style={{ marginTop: 20 }}>
                                                    <Text style={{ color: 'blue', marginBottom: 5, fontSize: 20 }}>Pagamenti (pdf):</Text>
                                                    {
                                                        customerSelected.pagamenti_pdf.length === 0 ? <Text style={{ marginTop: 5 }}>(no pdf)</Text> :
                                                            <View>
                                                                {
                                                                    customerSelected.assistenza.map((pi, idx) => {
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
                                                customerSelected.trasferta === undefined ? null : <View style={{ marginTop: 10 }}>
                                                    <Text style={{ color: 'blue', marginBottom: 5, fontSize: 20 }}>Trasferta:</Text>
                                                    {
                                                        customerSelected.trasferta.length === 0 ? <Text style={{ marginTop: 5 }}>(no pdf)</Text> :
                                                            <View>
                                                                {
                                                                    customerSelected.assistenza.map((pi, idx) => {
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
                                                                    customerSelected.assistenza.map((pi, idx) => {
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
                                                                    customerSelected.assistenza.map((pi, idx) => {
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
                                                                    customerSelected.assistenza.map((pi, idx) => {
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
                                                                    customerSelected.assistenza.map((pi, idx) => {
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
                                                customerSelected.di_co === undefined ? null : <View style={{ marginTop: 10 }}>
                                                    <Text style={{ color: 'blue', marginBottom: 5, fontSize: 20 }}>di.co:</Text>
                                                    {
                                                        customerSelected.fgas.length === 0 ? <Text style={{ marginTop: 5 }}>(no pdf)</Text> :
                                                            <View>
                                                                {
                                                                    customerSelected.assistenza.map((pi, idx) => {
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
        </View >
    );
}
