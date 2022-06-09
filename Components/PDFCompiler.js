import { axiosInstance, beUrl } from "../config.js"
import React from 'react';
import { StyleSheet, ActivityIndicator, Text, View, Image } from 'react-native';
import { Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown'
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import SignatureScreen from "react-native-signature-canvas";
import ExpoPixi from 'expo-pixi'

const styles = StyleSheet.create({
    preview: {
        width: 335,
        height: 214,
        backgroundColor: "#F8F8F8",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 15,
    },
    previewText: {
        color: "#FFF",
        fontSize: 14,
        height: 40,
        lineHeight: 40,
        paddingLeft: 10,
        paddingRight: 10,
        backgroundColor: "#69B2FF",
        width: 120,
        textAlign: "center",
        marginTop: 10,
    },
    row: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        alignItems: "center",
    },
    tinyLogo: {
        width: 90,
        height: 90,
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

export default function PDFCompiler(props) {

    const [emailTemplate, setEmailTemplate] = React.useState("");
    const [customerSelected, setCustomerSelected] = React.useState("");
    const [token, setToken] = React.useState("");
    const [user, setUser] = React.useState("");
    const [type, setType] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [signature, setSignature] = React.useState(null);
    const [dataset, setDataset] = React.useState(null)
    const [existingPdfs, setExistingPdfs] = React.useState(null)
    const [showError, setShowError] = React.useState(false);

    const { navigate } = props.navigation;

    const ref = React.useRef();

    const style = `.m-signature-pad--footer {display: none; margin: 0px}`;

    React.useEffect(() => {
        setIsLoading(true)
        setUser(props.route.params.user)
        getToken()
    }, []);

    React.useEffect(() => {
        if (props.route.params !== undefined && props.route.params.customers !== undefined) {
            setCustomerSelected("")
            setEmailTemplate("")
            getToken()
        }
    }, [props]);

    React.useEffect(() => {
        if (token) {
            getExistingPdfs();
            checkUserExternal()
        }
    }, [token]);

    const getToken = async () => {
        setToken(await AsyncStorage.getItem("token"))
        // setUser(await AsyncStorage.getItem("user"))
    }

    const handleSignature = signa => {
        console.log("captured!");
        // console.log(signa);
        setSignature(signa);
    };

    // Called after ref.current.clearSignature()
    const handleClear = () => {
        setSignature(null);
        ref.current.clearSignature()
        // console.log("clear success!");
    };

    const handleConfirm = () => {
        console.log("end");
        ref.current.readSignature();
    };

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

    const getExistingPdfs = () => {
        axiosInstance.get(beUrl + 'pdf/form', { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => {
                let ds = res.data.map((pdf) => ({
                    id: pdf.name,
                    title: pdf.label
                }))
                setExistingPdfs(ds)
                // console.log("Tools: ", res.data)
                setIsLoading(false)
            }).catch(error => {
                setIsLoading(false)
                // console.log("Customer not found")
                setShowError(true)
            })
    }

    const getCustomers = (usr) => {
        setIsLoading(true)
        if (usr === undefined) {
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
                    setIsLoading(false)
                }).catch(error => {
                    setIsLoading(false)
                    // console.log("Customer not found")
                    setShowError(true)
                })
        } else {
            axiosInstance.get(beUrl + 'customer', { headers: { "Authorization": `Bearer ${token}` }, params: { user: usr } })
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
                    setIsLoading(false)
                }).catch(error => {
                    setIsLoading(false)
                    // console.log("Customer not found")
                    setShowError(true)
                })
        }
    }

    const getFormTemplate = (t) => {
        setIsLoading(true)
        setType(t)
        axiosInstance.get(beUrl + 'pdf/form?type=' + t, { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => {
                // console.log(res.data[0])
                setEmailTemplate(res.data[0])
                setIsLoading(false)
                if (customerSelected !== "") {
                    navigate('FillInForm', { customerSelected: customerSelected, formTemplate: res.data[0], token: token, user: user });
                }
            }).catch(error => {
                setIsLoading(false)
                setShowError(true)
            });
    }

    const sendPDF = () => {
        let body = {
            template: emailTemplate,
        };
        axiosInstance.post(beUrl + 'pdf', body, { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => {
                console.log("ok!")
                // setEmailTemplate(res.data.template)
                // setIsLoading(false)
            }).catch(error => {
                setIsLoading(false)
            });
    }

    return (
        <View>
            {
                !isLoading ? null : <View style={styles.overlayLoadingContainer}>
                    <ActivityIndicator size="large" color="green" animating={true} />
                </View>
            }
            <View
                style={{
                    marginTop: 20,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    width: "80%",
                    marginRight: "auto",
                    marginLeft: "auto",
                }}>
                <Text>Seleziona il cliente</Text>
                <AutocompleteDropdown
                    clearOnFocus={false}
                    closeOnBlur={true}
                    closeOnSubmit={false}
                    // initialValue={{ id: '2' }} // or just '2'
                    onSelectItem={(event) => {
                        // console.log(event)
                        if (event !== null) {
                            setCustomerSelected(event.customerSelected)
                            if (emailTemplate !== "") {
                                navigate('FillInForm', { customerSelected: event.customerSelected, formTemplate: emailTemplate, token: token });
                            }
                        }
                    }}
                    textInputProps={{
                        style: {
                            width: 300,
                            color: "black",
                            zIndex: 1000,
                            // elevation: 5
                        },
                        zIndex: 1000,
                        // elevation: 5
                    }}
                    rightButtonsContainerStyle={{
                        borderRadius: 25,
                        alignSelfs: "center",
                        color: "black",
                        zIndex: 1000,
                        // elevation: 5
                    }}
                    inputContainerStyle={{
                        backgroundColor: "white",
                        borderWidth: 1,
                        borderStyle: "solid",
                        // borderRadius: 10,
                        borderColor: "black",
                        zIndex: 1000,
                        // elevation: 5
                    }}
                    suggestionsListContainerStyle={{
                        zIndex: 1000,
                        // elevation: 5
                    }}
                    containerStyle={{ flexGrow: 1, flexShrink: 1 }}
                    dataSet={dataset}
                />

            </View>
            {
                customerSelected === "" ? null : <View
                    style={{
                        marginTop: 150,
                        flexDirection: 'column',
                        justifyContent: 'center',
                        width: "80%",
                        marginRight: "auto",
                        marginLeft: "auto",
                    }}>
                    <Text>Seleziona tipo di pdf da compilare</Text>
                    <AutocompleteDropdown
                        clearOnFocus={false}
                        closeOnBlur={true}
                        closeOnSubmit={false}
                        // initialValue={{ id: '2' }} // or just '2'
                        onSelectItem={(event) => {
                            // console.log(event)
                            if (event !== null) {
                                getFormTemplate(event.id)
                            }
                        }}
                        textInputProps={{
                            style: {
                                width: 300,
                                color: "black",
                                zIndex: 1000,
                                // elevation: 5
                            },
                            zIndex: 1000,
                            // elevation: 5
                        }}
                        rightButtonsContainerStyle={{
                            borderRadius: 25,
                            alignSelfs: "center",
                            color: "black",
                            zIndex: 1000,
                            // elevation: 5
                        }}
                        inputContainerStyle={{
                            backgroundColor: "white",
                            borderWidth: 1,
                            borderStyle: "solid",
                            // borderRadius: 10,
                            borderColor: "black",
                            zIndex: 1000,
                            // elevation: 5
                        }}
                        suggestionsListContainerStyle={{
                            zIndex: 1000,
                            // elevation: 5
                        }}
                        containerStyle={{ flexGrow: 1, flexShrink: 1 }}
                        dataSet={existingPdfs}
                    />
                </View>
            }

            {/* <Button style={{ marginTop: 50 }} onPress={() => {
                sendPDF()
            }}>Esporta PDF!</Button>
            <View style={{ marginTop: 100 }}>
                <SignatureScreen
                    ref={ref}
                    onOK={handleSignature}
                    // onClear={handleClear}
                    webStyle={style}
                    style={{
                        "position": "absolute",
                        "left": 0,
                        "top": 0,
                        "width": 400,
                        "height": 200,
                    }}
                />
                <View style={styles.row}>
                    <Button onPress={handleClear}>Clear</Button>
                    <Button onPress={handleConfirm}>Confirm</Button>
                </View>
                {
                    signature ? <Image
                        style={styles.tinyLogo}
                        source={{ uri: signature }}
                    /> : null
                }
            </View> */}
        </View>
    );
}
