import React from 'react';
import { View, Image } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import PDFCompiler from './PDFCompiler';
import FillInForm from './FillInForm';
import Review from './Review';
import Signature from './Signature';

const Stack = createNativeStackNavigator();

export default function HomeCalendar({ user }) {

    // Return the SafeAreaView
    return (
        <Stack.Navigator initialRouteName='PDFCompiler'>
            <Stack.Screen name='PDFCompiler' component={PDFCompiler} options={{ headerShown: false }} initialParams={{ user: user }} />
            <Stack.Screen
                name='FillInForm'
                component={FillInForm}
                options={{
                    title: null
                }}
            />
            <Stack.Screen
                name='Review'
                component={Review}
                options={{
                    title: "Conferma"
                }}
            />
            <Stack.Screen
                name='Signature'
                component={Signature}
                options={{
                    title: "Firma"
                }}
            />
        </Stack.Navigator>
    );
}
