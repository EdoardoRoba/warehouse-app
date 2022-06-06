import { axiosInstance, beUrl } from "../config.js"
import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown'
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import SignatureScreen from "react-native-signature-canvas";
import ExpoPixi from 'expo-pixi'

export default function PDFCompiler({ text, onOK }) {

    const [emailTemplate, setEmailTemplate] = React.useState("");
    const [token, setToken] = React.useState("");
    const [user, setUser] = React.useState("");
    const [type, setType] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [selectedPrinter, setSelectedPrinter] = React.useState();
    const [signature, setSignature] = React.useState(null);

    const ref = React.useRef();

    const dataset = [
        {
            id: "sopralluogo_termico",
            title: "sopralluogo termico"
        }
    ]

    const style = `.m-signature-pad--footer {display: none; margin: 0px}`;

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
    });

    // const { navigate } = props.navigation;

    React.useEffect(() => {
        getToken()
    }, []);

    // React.useEffect(() => {
    //     if (token) {
    //         getEmailTemplate();
    //     }
    // }, [token]);

    const getToken = async () => {
        setToken(await AsyncStorage.getItem("token"))
        setUser(await AsyncStorage.getItem("user"))
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

    const getEmailTemplate = (t) => {
        setIsLoading(true)
        setType(t)
        axiosInstance.get(beUrl + 'pdf?type=' + t, { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => {
                // console.log(res.data.template)
                setEmailTemplate(res.data.template)
                setIsLoading(false)
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

    const saveCanvas = async () => {
        const signature_result = await
            ref.takeSnapshotAsync({
                format: 'jpeg', // 'png' also supported
                quality: 0.5, // quality 0 for very poor 1 for very good
                result: 'file' // 
            })
        console.log(signature_result)
    }

    const clearCanvas = async () => {
        ref.clear()
    }

    return (
        <View>
            <View
                style={{
                    marginTop: 20,
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
                            getEmailTemplate(event.id)
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
            <Button style={{ marginTop: 50 }} onPress={() => {
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
            </View>
        </View>
    );
}
