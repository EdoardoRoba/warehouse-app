import React from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome';

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    icon: {
        paddingLeft: 10
    },
    iconContainer: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        width: 120
    }
});

export default function Logout() {

    // Return the SafeAreaView
    return (
        <View style={styles.iconContainer}>
            <Icon name={"sign-out"} size={30} color={"white"} />
        </View>
    );
}
