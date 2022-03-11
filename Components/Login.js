import { axiosInstance, beUrl } from "../config.js"
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View, Button, Alert, ActivityIndicator, Text } from 'react-native';
import { TextInput } from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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

    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [iconName, setIconName] = React.useState("eye-off");
    const [showPassword, setShowPassword] = React.useState(false);
    const [showError, setShowError] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

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
        axiosInstance.post(beUrl + 'profile', { username: username, password: password })
            .then(response => {
                // setLoggedIn(true)
                setIsLoading(false)
                setUsername("")
                setPassword("")
                navigation.navigate("Route", { user: usr })
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
            <View style={{ marginTop: 80, width: "80%" }}>
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
            <View style={{ marginTop: 80, width: "100%" }}>
                <Button title={'Accedi'} onPress={() => login()} />
            </View>
            {/* height: "100%", width: "100%", */}
            {
                !isLoading ? null : <View style={styles.overlayLoadingContainer}>
                    <ActivityIndicator size="large" color="green" animating={true} />
                </View>
            }
            {
                (!showError) ? null : <Text style={{ width: '50%', marginLeft: 'auto', marginRight: 'auto', marginTop: 10 }} severity="error">Errore. Utente o password non corretti.</Text>
            }
        </View>
    );
}
