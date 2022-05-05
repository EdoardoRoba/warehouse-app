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

export default function AppuntamentoCalendar(props) {

    const [appuntamento, setAppuntamento] = React.useState({});
    const [isLoading, setIsLoading] = React.useState(false);
    const [token, setToken] = React.useState("");
    const [user, setUser] = React.useState("");

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
        getToken()
        if (Promise && !Promise.allSettled) {
            Promise.allSettled = PromiseHelperAllSettled;
        }
    }, []);

    React.useEffect(async () => {
        // setIsLoading(true)
        setAppuntamento(props.route.params.appuntamento)
        // console.log(props.route.params.appuntamento)
        // });
    }, [props]);

    React.useEffect(() => {
        // if (token) {
        //     getCustomers();
        // }
    }, [token]);

    const getToken = async () => {
        setToken(await AsyncStorage.getItem("token"))
        setUser(await AsyncStorage.getItem("user"))
    }

    return (
        <View style={styles.container}>
            <Title style={{ marginTop: 80, fontWeight: "bold" }}>{appuntamento.name}</Title>
            {
                !appuntamento.start ? null : <Paragraph style={{ marginTop: 50, fontSize: 15 }}><Text style={{ fontWeight: "bold" }}>Inizio:</Text> {appuntamento.start.replace("T", " ").replace("Z", " ")}</Paragraph>
            }
            {
                !appuntamento.end ? null : <Paragraph style={{ fontSize: 15 }}><Text style={{ fontWeight: "bold" }}>Fine:</Text> {appuntamento.end.replace("T", " ").replace("Z", " ")}</Paragraph>
            }
        </View >
    );
}
