import React from 'react';
import { View, Image } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { Tab } from 'react-native-elements/dist/tab/Tab';
import Admin from './Admin';
import QRScanner from './QRScanner';
import Home from './Home';
import Client from './Client';
import { Feather } from '@expo/vector-icons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Tab = createBottomTabNavigator();

export default function Tabs({ user }) {

    // Return the SafeAreaView
    return (
        <Tab.Navigator
            tabBarShowLabel={true}
            screenOptions={
                ({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName;

                        if (route.name === 'Home') {
                            iconName = "home"
                        } else if (route.name === 'Admin') {
                            iconName = "gear"
                        } else if (route.name === 'QRScanner') {
                            iconName = "qrcode"
                        } else if (route.name === 'Client') {
                            iconName = "users"
                        }

                        // You can return any component that you like here!
                        return <Icon name={iconName} size={size} color={color} />;
                    },
                    headerShown: false,
                    tabBarBadgeStyle: "white",
                    tabBarInactiveTintColor: "white",
                    tabBarActiveTintColor: "white",
                    tabBarStyle: {
                        position: 'absolute',
                        eleveation: 0,
                        backgroundColor: "#0282ba",
                        height: 80,
                        headerShown: false,
                        color: "#fff"
                    },
                    color: "white",
                    activeTintColor: "white"
                })

            }
        >
            <Tab.Screen name="Home" children={() => <Home user={user} />} />
            {
                user !== "admin" ? null : <Tab.Screen name="Admin" children={() => <Admin user={user} />} />
            }
            <Tab.Screen name="QRScanner" children={() => <QRScanner user={user} />} />
            <Tab.Screen name="Client" children={() => <Client user={user} />} />
        </Tab.Navigator >
    );
}
