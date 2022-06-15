import { axiosInstance, beUrl } from "../config.js"
import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert, Linking, SafeAreaView, StatusBar, ScrollView, Image, Modal, Pressable, TouchableOpacity } from 'react-native';
import { Title, TextInput, Card, Paragraph, Button } from 'react-native-paper';
import SignatureScreen from "react-native-signature-canvas";
import ExpoPixi from 'expo-pixi'
import { getDownloadURL, ref, uploadBytesResumable, getStorage, deleteObject, uploadString } from "firebase/storage";
import { storage } from "../firebase";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        height: 500
        // alignItems: 'center',
        // justifyContent: 'center',
    },
    input: {
        height: 40,
        width: "80%",
        marginTop: 10
    },
    scrollView: {
        marginTop: 40,
        height: 500,
    },
    tinyLogo: {
        width: 20,
        height: 20,
    },
    row: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        alignItems: "center",
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

export default function Signature(props) {

    const [stopNext, setStopNext] = React.useState(false);
    const [formTemplate, setFormTemplate] = React.useState();
    const [customerSelected, setCustomerSelected] = React.useState();
    const [token, setToken] = React.useState();
    const [user, setUser] = React.useState();
    const [tempValues, setTempValues] = React.useState();
    const [signatureCliente, setSignatureCliente] = React.useState(null);
    const [signatureTecnico, setSignatureTecnico] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isLoadingPdf, setIsLoadingPdf] = React.useState(false);
    const [clienteUploaded, setClienteUploaded] = React.useState(false);
    const [tecnicoUploaded, setTecnicoUploaded] = React.useState(false);
    const [refSignatureCliente, setRefSignatureCliente] = React.useState(false);
    const [refSignatureTecnico, setRefSignatureTecnico] = React.useState(false);

    const { navigate } = props.navigation;

    const refCliente = React.useRef();
    const refTecnico = React.useRef();
    const style = `.m-signature-pad--footer {display: none; margin: 0px}`;

    console.log("hello1")

    React.useEffect(() => {
        setFormTemplate(props.route.params.formTemplate)
        setCustomerSelected(props.route.params.customerSelected)
        setToken(props.route.params.token)
        setUser(props.route.params.user)

        props.navigation.setOptions({
            headerRight: () => renderDoneButtonSign()
        });
    }, []);

    React.useEffect(() => {
        if (clienteUploaded && tecnicoUploaded) {
            // navigate('LoadingPdf', { customerSelected: customerSelected, formTemplate: formTemplate, token: token, user: user });
            // setClienteUploaded(false)
            // setTecnicoUploaded(false)
            uploadPdf()
        }
    }, [clienteUploaded, tecnicoUploaded]);

    React.useEffect(async () => {
        if (signatureCliente && signatureTecnico) {
            await uploadClienteSignature()
            await uploadTecnicoSignature()
        }
    }, [signatureCliente, signatureTecnico]);

    const renderDoneButtonSign = () => {
        if (isLoadingPdf) {
            return null
        } else {
            return <TouchableOpacity title={'Invia'} onPress={goToSign}>
                <Text onPress={goToSign}>Invia</Text>
            </TouchableOpacity>
        }
    }

    const goToSign = async () => {
        setIsLoading(true)
        console.log("here")
        let ok1 = await refCliente.current.readSignature()
        let ok2 = await refTecnico.current.readSignature()
        setIsLoading(false)
    }

    const uploadClienteSignature = () => {
        setIsLoading(true)
        console.log("hello1")
        return new Promise(async (resolve, reject) => {
            // console.log(signatureCliente)
            console.log("hello")
            const imgCliente = await fetch(signatureCliente);
            console.log("ciao")
            const blobCliente = await imgCliente.blob();
            const storageRefCliente = ref(storage, '/files/' + customerSelected.nome_cognome + '/signature')
            const uploadTaskCliente = uploadBytesResumable(storageRefCliente, blobCliente)
            uploadTaskCliente.on("state_changed", (snapshot) => {
                // console.log("Uploading...")
                // console.log("ph:", ph)
            }, (error) => {
                console.log("error: ", error)
                setIsLoading(false)
                blobCliente.close();
                reject(error);
            },
                () => {
                    //when the file is uploaded we want to download it. uploadTask.snapshot.ref is the reference to the pdf
                    getDownloadURL(uploadTaskCliente.snapshot.ref).then((fileUrl) => {
                        console.log("fileUrl: ", fileUrl)
                        setRefSignatureCliente(fileUrl)
                        setClienteUploaded(true)
                        setIsLoading(false)
                        resolve("firma cliente caricata!");
                    })
                }
            )
        })
    }

    const uploadTecnicoSignature = () => {
        setIsLoading(true)
        console.log("hello2")
        return new Promise(async (resolve, reject) => {
            let ok = await refTecnico.current.readSignature()
            const imgTecnico = await fetch(signatureTecnico);
            const blobTecnico = await imgTecnico.blob();
            const storageRefTecnico = ref(storage, '/files/signature_' + user)
            const uploadTaskTecnico = uploadBytesResumable(storageRefTecnico, blobTecnico)
            uploadTaskTecnico.on("state_changed", (snapshot) => {
                // console.log("Uploading...")
                // console.log("ph:", ph)
            }, (error) => {
                console.log("error: ", error)
                setIsLoading(false)
                blobTecnico.close();
                reject(error);
            },
                () => {
                    //when the file is uploaded we want to download it. uploadTask.snapshot.ref is the reference to the pdf
                    getDownloadURL(uploadTaskTecnico.snapshot.ref).then((fileUrl) => {
                        console.log("fileUrl: ", fileUrl)
                        setRefSignatureTecnico(fileUrl)
                        setTecnicoUploaded(true)
                        setIsLoading(false)
                        resolve("firma tecnico caricata!");
                    })
                }
            )
        })
    }

    const uploadPdf = () => {
        setIsLoadingPdf(true)
        axiosInstance.get(beUrl + 'pdf?type=' + formTemplate.name, { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => {
                console.log("pdf-html preso!")
                var dateObj = new Date();
                var month = dateObj.getUTCMonth() + 1; //months from 1-12
                var day = dateObj.getUTCDate();
                var year = dateObj.getUTCFullYear();
                let today = day + "/" + month + "/" + year;
                let html = res.data.template
                html = html.replace("{nome_cognome}", customerSelected.nome_cognome)
                    .replace("{indirizzo}", customerSelected.indirizzo + " - " + customerSelected.comune + " - " + customerSelected.provincia)
                    .replace("{date}", today).replace("{date}", today)
                    .replace("{tecnico}", user)
                    .replace("{firma_tecnico}", refSignatureTecnico)
                    .replace("{cliente}", customerSelected.nome_cognome)
                    .replace("{firma_cliente}", refSignatureCliente)
                for (let page of formTemplate.form) {
                    for (let field of page.fields) {
                        if (field.type !== "checkbox") {
                            html = html.replace("{" + field.name + "}", field.value)
                        }
                    }
                }
                let body = {}
                body.template = html
                body.filename = formTemplate.name
                body.customer = customerSelected.nome_cognome
                // console.log(html)
                axiosInstance.post(beUrl + 'pdf?filename=' + formTemplate.name + "&customer=" + customerSelected.nome_cognome, body, { headers: { "Authorization": `Bearer ${token}` } })
                    .then(ress => {
                        // console.log(ress.data)
                        var customer = {}
                        let typology = ""
                        if (formTemplate.name.includes("installazione")) {
                            typology = "pdf_computo"
                        } else if (formTemplate.name.includes("sopralluogo")) {
                            typology = "pdf_sopralluogo"
                        } else if (formTemplate.name.includes("assistenza")) {
                            typology = "assistenza"
                        }
                        customer[typology] = customerSelected[typology]
                        customer[typology].push(ress.data.refUrl)
                        axiosInstance.put(beUrl + "customer/" + customerSelected._id, customer, { headers: { "Authorization": `Bearer ${token}` } }).then(response => {
                            // axiosInstance.put(beUrl + "customer/" + customerSelected._id, customer, { headers: { "Authorization": `Bearer ${token}` } }).then(resp => {
                            console.log("cliente aggiornato!")
                            checkUserExternal()
                            setIsLoadingPdf(false)
                            //     setCustomerSelected(resp.data)
                            // }).catch((error) => {
                            //     // console.log("error: ", error)
                            //     setIsLoading(false)
                            // });
                        }).catch((error) => {
                            // console.log("error: ", error)
                            setIsLoading(false)
                        });
                    })
            }).catch(error => {
                console.log(error)
                setIsLoading(false)
                // console.log("Customer not found")
            })
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

    const getCustomers = (usr) => {
        setIsLoading(true)
        if (usr === undefined) {
            axiosInstance.get(beUrl + 'customer', { headers: { "Authorization": `Bearer ${token}` } })
                .then(res => {
                    setIsLoading(false)
                    navigate('PDFCompiler', { customers: res.data });
                    // console.log("Tools: ", res.data)
                }).catch(error => {
                    setIsLoading(false)
                    // console.log("Customer not found")
                    setShowError(true)
                })
        } else {
            axiosInstance.get(beUrl + 'customer', { headers: { "Authorization": `Bearer ${token}` }, params: { user: usr } })
                .then(res => {
                    setIsLoading(false)
                    navigate('PDFCompiler', { customers: res.data });
                }).catch(error => {
                    setIsLoading(false)
                    // console.log("Customer not found")
                    setShowError(true)
                })
        }
    }

    const handleSignatureCliente = signa => {
        console.log("captured!");
        // console.log(signa);
        setSignatureCliente(signa);
    };

    // Called after ref.current.clearSignature()
    const handleClearCliente = () => {
        setSignatureCliente(null);
        refCliente.current.clearSignature()
        // console.log("clear success!");
    };

    const handleConfirmCliente = () => {
        console.log("end");
        refCliente.current.readSignature();
    };

    const handleSignatureTecnico = signa => {
        console.log("captured!");
        // console.log(signa);
        setSignatureTecnico(signa);
    };

    // Called after ref.current.clearSignature()
    const handleClearTecnico = () => {
        setSignatureTecnico(null);
        refTecnico.current.clearSignature()
        // console.log("clear success!");
    };

    const handleConfirmTecnico = () => {
        console.log("end");
        refTecnico.current.readSignature();
    };

    return (
        <View style={{ height: 600, flexDirection: "column" }}>
            {
                !isLoading ? null : <View style={styles.overlayLoadingContainer}>
                    <ActivityIndicator size="large" color="green" animating={true} />
                </View>
            }
            {
                isLoadingPdf ? <View style={styles.overlayLoadingContainer}>
                    <ActivityIndicator size="large" color="green" animating={true} />
                    <Title>Caricamento in corso...</Title>
                    <Title>attendere</Title>
                </View> : <>
                    <Text>Cliente</Text>
                    <SignatureScreen
                        ref={refCliente}
                        onOK={handleSignatureCliente}
                        // androidHardwareAccelerationDisabled={true}
                        // onClear={handleClear}
                        descriptionText="Firma cliente"
                        webStyle={style}
                        style={{
                            "position": "absolute",
                            "left": 0,
                            "top": 0,
                            "width": 400,
                            "height": 150,
                        }}
                    />
                    <Text>Tecnico</Text>
                    <SignatureScreen
                        ref={refTecnico}
                        onOK={handleSignatureTecnico}
                        // androidHardwareAccelerationDisabled={true}
                        // onClear={handleClear}
                        descriptionText="Firma tecnico"
                        webStyle={style}
                        style={{
                            "position": "absolute",
                            "left": 0,
                            "top": 0,
                            "width": 400,
                            "height": 150,
                        }}
                    />
                </>
            }

        </View >
    );
}
