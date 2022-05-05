import React from 'react';
import { View, Image } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MyCalendar from './MyCalendar';
import ClientCalendar from './ClientCalendar';
import ImageBrowserScreenCalendar from './ImageBrowserScreenCalendar';
import AppuntamentoCalendar from './AppuntamentoCalendar';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

const Stack = createNativeStackNavigator();

export default function HomeCalendar({ user }) {

    // Return the SafeAreaView
    return (
        <Stack.Navigator initialRouteName='Calendar'>
            <Stack.Screen name='Calendar' component={MyCalendar} options={{ headerShown: false }} initialParams={{ user: user }} />
            <Stack.Screen
                name='AppuntamentoCalendar'
                component={AppuntamentoCalendar}
                options={{
                    title: 'Visualizza appuntamento'
                }}
            />
            <Stack.Screen
                name='ClientCalendar'
                component={ClientCalendar}
                options={{
                    title: 'Visualizza cliente'
                }}
            />
            <Stack.Screen
                name='ImageBrowserScreenCalendar'
                component={ImageBrowserScreenCalendar}
                options={{
                    title: 'Seleziona immagine'
                }}
            />
        </Stack.Navigator>
    );
}
