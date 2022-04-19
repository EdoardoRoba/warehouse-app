import React from 'react';
import { View, Image } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ImageBrowserScreenCalendar from './ImageBrowserScreenCalendar';
import ClientCalendar from './ClientCalendar';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

export default function HomeCalendar({ user }) {

    // Return the SafeAreaView
    return (
        <Stack.Navigator initialRouteName='ClientCalendar'>
            <Stack.Screen name='ClientCalendar' component={ClientCalendar} options={{ headerShown: false }} initialParams={{ user: user }} />
            <Stack.Screen
                name='ImageBrowserScreenCalendar'
                component={ImageBrowserScreenCalendar}
                options={{
                    title: 'Seleziona immagine',
                }}
            />
        </Stack.Navigator>
    );
}
