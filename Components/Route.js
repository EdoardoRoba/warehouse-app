import React from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { Text } from 'react-native-paper';
import Tabs from "./Tabs.js";

export default function Route({ navigation }) {

    // Return the SafeAreaView
    return (
        <NavigationContainer>
            {/* <Text>{navigation.get("user")}</Text> */}
            <Tabs user={navigation.getParam("user")} />
        </NavigationContainer>
    );
}
