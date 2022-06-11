import { axiosInstance, beUrl } from "../config.js"
import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert, Linking, SafeAreaView, StatusBar, ScrollView, Image, Modal, Pressable, TouchableOpacity } from 'react-native';
import { Title, TextInput, Card, Paragraph } from 'react-native-paper';

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
});

export default function Review(props) {

    const [stopNext, setStopNext] = React.useState(false);
    const [formTemplate, setFormTemplate] = React.useState(props.route.params.formTemplate);
    const [customerSelected, setCustomerSelected] = React.useState(props.route.params.customerSelected);
    const [token, setToken] = React.useState(props.route.params.token);
    const [user, setUser] = React.useState(props.route.params.user);
    const [tempValues, setTempValues] = React.useState();

    const { navigate } = props.navigation;

    props.navigation.setOptions({
        headerRight: () => <TouchableOpacity title={'Firma'} onPress={goTo}>
            <Text onPress={goTo}>Firma</Text>
        </TouchableOpacity>
    });

    const renderDoneButton = () => {
        return <TouchableOpacity title={'Firma'} onPress={goTo}>
            <Text onPress={goTo}>Firma</Text>
        </TouchableOpacity>
    }

    const goTo = () => {
        navigate('Signature', { customerSelected: customerSelected, formTemplate: formTemplate, token: token, user: user });
    }

    return (
        <View style={{ height: 600 }}>
            <View style={styles.container}>
                <SafeAreaView style={{ maxWidth: "100%", maxHeight: "90%", alignItems: "center" }}>
                    <ScrollView showsVerticalScrollIndicator={false} persistentScrollbar={true} style={styles.scrollView}>
                        <Pressable style={{ width: "100%", height: "100%", alignItems: "center" }}>
                            {
                                !formTemplate ? null : <>
                                    {
                                        formTemplate.form.map((page, idxSection) => {
                                            return <View style={{ width: "100%", marginBottom: 30 }}>
                                                {/* <Title style={{ fontSize: 18 }}>{page.title}</Title> */}
                                                <Title>{page.title}</Title>
                                                {
                                                    page.fields.map(field => {
                                                        // return <View style={{ marginBottom: 5 }}>
                                                        //     <Title style={{ fontSize: 12, fontWeight: "bold" }}>{field.label}</Title>
                                                        //     <Text>{field.value}</Text>
                                                        // </View>
                                                        return <>
                                                            <Title style={{ fontSize: 15, textDecorationLine: 'underline' }}>{field.label}:</Title>
                                                            <Paragraph>{field.value}</Paragraph>
                                                        </>
                                                    })
                                                }
                                            </View>
                                        })
                                    }
                                </>
                            }
                        </Pressable>
                    </ScrollView>
                </SafeAreaView>
            </View >
        </View >
    );
}
