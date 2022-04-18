import React from 'react';
import { View, Image } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MyCalendar from './MyCalendar';
import Client from './Client';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

export default function HomeCalendar({ user }) {

    // Return the SafeAreaView
    return (
        <Stack.Navigator initialRouteName='Calendar'>
            <Stack.Screen name='Calendar' component={MyCalendar} options={{ headerShown: false }} initialParams={{ user: user }} />
            <Stack.Screen
                name='Client'
                component={Client}
                options={{
                    title: 'Visualizza cliente',
                }}
            />
        </Stack.Navigator>
    );
}
