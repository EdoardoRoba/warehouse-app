import { axiosInstance, beUrl } from "../config.js"
import React from 'react';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown'
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';

export default function PDFCompiler(props) {

    const [emailTemplate, setEmailTemplate] = React.useState("");
    const [token, setToken] = React.useState("");
    const [user, setUser] = React.useState("");
    const [type, setType] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [selectedPrinter, setSelectedPrinter] = React.useState();

    const dataset = [
        {
            id: "sopralluogo_termico",
            title: "sopralluogo termico"
        }
    ]

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
                console.log(res.data)
                // setEmailTemplate(res.data.template)
                // setIsLoading(false)
            }).catch(error => {
                setIsLoading(false)
            });
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
        </View>
    );
}
