import { axiosInstance, beUrl } from "../config.js"
import React from 'react';
import { StyleSheet, View, TextInput as TxTInput, Text, ActivityIndicator, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback, Alert, Linking, SafeAreaView, StatusBar, ScrollView, Image, Modal, Pressable, TouchableOpacity } from 'react-native';
import { Title, TextInput, Button } from 'react-native-paper';
import { getDownloadURL, ref, uploadBytesResumable, getStorage, deleteObject, uploadString } from "firebase/storage";
import { storage } from "../firebase";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { vw, vh, vmin, vmax } from 'react-native-expo-viewport-units';
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';
import Checkbox from 'expo-checkbox';

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
    inputMultiline: {
        height: 150,
        width: "80%",
        marginTop: 10,
        borderWidth: 1,
        borderColor: "black"
    },
    outsideModal: {
        backgroundColor: "transparent",
        flex: 1,
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
        height: vh(30),
        width: vw(90),
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        justifyContent: "center",
    },
});

export default function FillInForm(props) {

    const [stopNext, setStopNext] = React.useState(false);
    const [formTemplate, setFormTemplate] = React.useState(props.route.params.formTemplate);
    const [customerSelected, setCustomerSelected] = React.useState(props.route.params.customerSelected);
    const [token, setToken] = React.useState(props.route.params.token);
    const [user, setUser] = React.useState(props.route.params.user);
    const [tempValues, setTempValues] = React.useState();
    const [checkboxes, setCheckboxes] = React.useState({});
    const [showAltro, setShowAltro] = React.useState(false);
    const [typeAltro, setTypeAltro] = React.useState("");
    const [labelFieldAltro, setLabelFieldAltro] = React.useState("");
    const [allAltro, setAllAltro] = React.useState({});

    const { navigate } = props.navigation;

    React.useEffect(() => {
        if (formTemplate) {
            let tempV = {}
            let chs = {}
            formTemplate.form.forEach((page, idxSection) => {
                page.fields.forEach(field => {
                    let tv = {}
                    tv.value = field.value
                    tv.required = field.required
                    tv.section = idxSection
                    tv.type = field.type
                    tempV[field.name] = tv
                    if (field.type === "checkbox") {
                        let ch = {}
                        ch.options = field.options
                        chs[field.name] = ch
                    }
                })
            });
            setCheckboxes(chs)
            setTempValues(tempV)
        }
    }, [formTemplate]);

    const onNextStep = (idxSection) => {
        const asArray = Object.entries(tempValues)
        let missingValues = asArray.filter(([name, f]) => {
            return (f.value === "" && f.required && f.section.toString() === idxSection.toString())
        })

        // let missingValues = []
        if (missingValues.length > 0) {
            setStopNext(true)
            console.log("error!")
        } else {
            setStopNext(false)
            console.log("next")
        }
    };

    const onSubmit = (idxSection) => {
        const asArray = Object.entries(tempValues)
        let missingValues = asArray.filter(([name, f]) => {
            return (f.value === "" && f.required && f.section.toString() === idxSection.toString())
        })
        if (missingValues.length > 0) {
            setStopNext(true)
            console.log("error!")
        } else {
            setStopNext(false)
            let model = Object.assign({}, formTemplate)
            model.form.forEach(page => {
                page.fields.forEach(field => {
                    field.value = tempValues[field.name].value
                })
            })
            setFormTemplate(model)
            navigate('Review', { customerSelected: customerSelected, formTemplate: model, token: token, user: user, allAltro: allAltro });
            console.log("submit!")
        }
    };

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setStopNext(false)
        }, 5000);
        return () => clearTimeout(timer);
    }, [stopNext]);

    const onChangeField = (value, idxSection, idxField, name) => {
        let tempTempValues = Object.assign({}, tempValues)
        tempTempValues[name].value = value
        setTempValues(tempTempValues)
    }

    const updateAltro = () => {
        let tempTempValues = Object.assign({}, tempValues)
        tempTempValues[labelFieldAltro].value = allAltro[labelFieldAltro]
        setTempValues(tempTempValues)
        // console.log(tempTempValues)
        // console.log(allAltro)
        // tempAltroValues[typeAltro] = value
        // setAllAltro(tempAltroValues)
        setLabelFieldAltro("")
        setShowAltro(false)
    }

    const onChangeAltro = (value) => {
        let tempTempValues = Object.assign({}, allAltro)
        tempTempValues[labelFieldAltro] = value
        setAllAltro(tempTempValues)
    }

    const onChangeCheckbox = (value, idxSection, idxField, name, optionSelected) => {
        let tempTempValues = Object.assign({}, checkboxes)
        // tempTempValues[name].checked = value
        tempTempValues[name].options.map(opt => {
            if (opt.id === optionSelected) {
                opt.checked = value
            } else {
                opt.checked = false
            }
            return opt
        })
        if (optionSelected.includes("altro")) {
            setShowAltro(true)
            let tA = Object.assign({}, allAltro)
            tA[name] = ""
            setAllAltro(tA)
            setTypeAltro(optionSelected)
            setLabelFieldAltro(name)
        } else {
            setShowAltro(false)
            let ttV = checkboxes[name].options.filter(opt => opt.checked)[0].id
            let ttvs = Object.assign({}, tempValues)
            ttvs[name].value = ttV
            setTempValues(ttvs)
            setTypeAltro("")
        }
        setCheckboxes(tempTempValues)
    }

    return (

        <View style={{ height: 550 }}>

            {
                !formTemplate || !tempValues ? null :
                    <ProgressSteps>

                        {
                            formTemplate.form.map((page, idxSection) => {

                                return <ProgressStep onNext={() => onNextStep(idxSection)} onPrevious={() => setStopNext(false)} onSubmit={() => {
                                    if (idxSection === formTemplate.form.length - 1) {
                                        onSubmit(idxSection)
                                    }
                                }} errors={stopNext}>

                                    {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
                                    <View onPress={Keyboard.dismiss} style={{ alignItems: 'center' }}>

                                        <Text style={{ marginBottom: 10 }} >{page.title}</Text>
                                        {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
                                        {
                                            page.fields.map((field, idxField) => {
                                                let req = field.required ? " *" : ""
                                                if (field.type === "checkbox" && checkboxes) {
                                                    return <View style={{
                                                        flex: 1,
                                                        marginTop: 5,
                                                    }} onPress={Keyboard.dismiss}>
                                                        <Text style={styles.label}>{field.label}</Text>
                                                        <View style={{
                                                            flexDirection: "row",
                                                            marginTop: 5,
                                                        }}>
                                                            {
                                                                field.options.map((opt) => {
                                                                    return <View style={{
                                                                        flexDirection: "row",
                                                                        marginTop: 5,
                                                                    }}>
                                                                        <Checkbox
                                                                            value={checkboxes[field.name].options.filter(o => opt.id === o.id)[0].checked}
                                                                            onValueChange={(e) => onChangeCheckbox(e, idxSection, idxField, field.name, opt.id)}
                                                                        />
                                                                        <Text style={{ color: "black" }}>{opt.title}</Text>
                                                                    </View>
                                                                })
                                                            }
                                                        </View>
                                                    </View>
                                                } else if (field.type === "multiline") {
                                                    return <TxTInput
                                                        multiline
                                                        onPress={Keyboard.dismiss}
                                                        style={styles.inputMultiline}
                                                        onChangeText={(e) => onChangeField(e, idxSection, idxField, field.name)}
                                                        value={tempValues[field.name].value}
                                                        placeholder={field.label + req}
                                                        keyboardType={field.type}
                                                    />
                                                } else {
                                                    return <TextInput
                                                        onPress={Keyboard.dismiss}
                                                        style={styles.input}
                                                        onChangeText={(e) => onChangeField(e, idxSection, idxField, field.name)}
                                                        value={tempValues[field.name].value}
                                                        placeholder={field.label + req}
                                                        keyboardType={field.type}
                                                    />
                                                }
                                            })
                                        }
                                        {/* </TouchableWithoutFeedback> */}
                                        {
                                            (!stopNext) ? null : <Text style={{ width: '90%', marginLeft: 'auto', marginRight: 'auto', marginTop: 30, textAlign: "center", color: "red" }} severity="error">Valorizzare i campi obbligatori.</Text>
                                        }
                                    </View>
                                    {/* </TouchableWithoutFeedback> */}
                                </ProgressStep>
                            })
                        }

                    </ProgressSteps>
            }
            <Modal
                visible={showAltro}
                onRequestClose={() => {
                    setLabelFieldAltro("")
                    setShowAltro(false)
                }}
                animationType="slide"
                transparent={true}
            >
                <Pressable style={styles.outsideModal}
                    onPress={(event) => {
                        if (event.target == event.currentTarget) {
                            setLabelFieldAltro("")
                            setShowAltro(false);
                        }
                    }} >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <TextInput
                                style={styles.input}
                                onChangeText={(e) => onChangeAltro(e)}
                                value={allAltro[labelFieldAltro]}
                                placeholder={typeAltro.replace("_", " ").replace("_", " ").replace("_", " ")}
                                keyboardType={"default"}
                            />
                            <Button disabled={allAltro[labelFieldAltro] === ""} onPress={() => {
                                updateAltro()
                            }}>
                                Conferma
                            </Button>
                        </View>
                    </View>
                </Pressable>
            </Modal>
        </View >
    );
}
