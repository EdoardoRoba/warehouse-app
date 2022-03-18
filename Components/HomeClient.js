import React from 'react';
import { View, Image } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Client from './Client';
import ImageBrowserScreen from './ImageBrowserScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

export default function HomeClient({ user }) {

    // Return the SafeAreaView
    return (
        <Stack.Navigator initialRouteName='Client'>
            <Stack.Screen name='Client' component={Client} options={{ headerShown: false }} />
            <Stack.Screen
                name='ImageBrowser'
                component={ImageBrowserScreen}
                options={{
                    title: 'Selected 0 files',
                }}
            />
        </Stack.Navigator>
    );
}
