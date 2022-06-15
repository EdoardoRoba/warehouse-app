import { axiosInstance, beUrl } from "../config.js"
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View, Button, Alert, ActivityIndicator, Linking, Text, TouchableOpacity } from 'react-native';
import { Button as ButtonPaper, Menu, Provider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput } from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/FontAwesome';

const Stack = createNativeStackNavigator();

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
});

export default function Login({ navigation }) {

    const [company, setCompany] = React.useState("");
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [iconName, setIconName] = React.useState("eye-off");
    const [showPassword, setShowPassword] = React.useState(false);
    const [showError, setShowError] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [visible, setVisible] = React.useState(false);

    React.useEffect(() => {

    }, []);

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setShowError(false)
        }, 5000);
        return () => clearTimeout(timer);
    }, [showError]);

    const login = () => {
        setIsLoading(true)
        const usr = username
        axiosInstance.post(beUrl + 'profile', { username: username, password: password, device: "mobile" })
            .then(response => {
                // setLoggedIn(true)
                setIsLoading(false)
                setUsername("")
                setPassword("")
                AsyncStorage.setItem("token", response.data.token)
                AsyncStorage.setItem("user", username)
                if (response.data.profile !== "external") {
                    navigation.navigate("Route", { user: usr })
                } else {
                    navigation.navigate("Route", { user: "EXTERNAL", username: usr })
                }
            }).catch(error => {
                setIsLoading(false)
                setShowError(true)
                console.log(error)
            });
    }

    const register = () => {
        setIsLoading(true)
        // const usr = username
        axiosInstance.post(beUrl + 'register', { username: username, password: password })
            .then(response => {
                // setLoggedIn(true)
                setIsLoading(false)
                setUsername("")
                setPassword("")
                AsyncStorage.setItem("token", response.data.token)
                AsyncStorage.setItem("user", username)
                navigation.navigate("Route", { user: "EXTERNAL", username: username })
            }).catch(error => {
                setIsLoading(false)
                setShowError(true)
                console.log(error)
            });
    }

    const toggleIcon = () => {
        if (iconName === "eye") {
            setIconName("eye-off")
            setShowPassword(false)
        } else {
            setIconName("eye")
            setShowPassword(true)
        }
    }

    return (
        <View style={styles.container}>
            {
                company !== "" ? null : <View>
                    <Provider><View
                        style={{
                            paddingTop: 50,
                            flexDirection: 'row',
                            justifyContent: 'center',
                        }}>
                        <Menu
                            visible={visible}
                            onDismiss={() => setVisible(false)}
                            anchor={<ButtonPaper onPress={() => {
                                setVisible(true)
                            }}>Seleziona azienda</ButtonPaper>}>
                            <Menu.Item
                                onPress={() => setCompany("idroaltech")} title="Idroaltech s.r.l." />
                        </Menu>
                    </View></Provider>
                    <View style={{ marginBottom: 300 }}>
                        <Text>Vuoi registrare la tua azienda?</Text>
                        <ButtonPaper onPress={() => Linking.openURL('mailto:roba.edoardo@gmail.com?subject=Request for new company account&body=Hi!\n\nI would like to have an account on this amazing app!')}>Contattaci</ButtonPaper>
                    </View>
                </View>
            }
            {
                company === "" ? null : <View style={{ width: "100%", alignItems: 'center' }}>
                    <TouchableOpacity style={{ flexGrow: 1 }} onPress={() => setCompany("")}>
                        <Icon name={"arrow-left"} size={25} style={{ marginTop: 10 }} />
                    </TouchableOpacity>
                    <View style={{ marginTop: 60, width: "80%" }}>
                        <TextInput
                            label="username"
                            value={username}
                            onChangeText={text => setUsername(text)}
                        />
                        <TextInput
                            label="password"
                            secureTextEntry={!showPassword}
                            value={password}
                            style={{ marginTop: 10 }}
                            onChangeText={text => setPassword(text)}
                            right={<TextInput.Icon name={iconName} onPress={toggleIcon} />}
                        />
                    </View>
                    <View style={{ marginTop: 60, width: "100%" }}>
                        <Button title={'Accedi'} onPress={() => login()} />
                    </View>
                    {
                        Platform.OS !== 'ios' ? null :
                            <View style={{ marginTop: 10, width: "100%" }}>
                                <Button title={'Registrati'} onPress={() => register()} />
                            </View>
                    }
                    {
                        !isLoading ? null : <View style={styles.overlayLoadingContainer}>
                            <ActivityIndicator size="large" color="green" animating={true} />
                        </View>
                    }
                </View>
            }
            {
                (!showError) ? null : <Text style={{ width: '50%', marginLeft: 'auto', marginRight: 'auto', marginTop: 10 }} severity="error">Errore. Utente o password non corretti.</Text>
            }
        </View>
    );
}
