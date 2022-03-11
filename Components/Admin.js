import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

export default function Admin({ user }) {

    // Return the SafeAreaView
    return (
        <View>
            <Text>Ciao {user}</Text>
        </View>
    );
}
