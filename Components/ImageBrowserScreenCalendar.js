import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { ImageBrowser } from 'expo-image-picker-multiple';

export default function ImageBrowserScreenCalendar(props) {

    const compress = Platform.OS === 'android' ? 0.8 : 0.8
    const resize = Platform.OS === 'android' ? 1 : 0.5

    const getHeaderLoader = () => (
        <ActivityIndicator size='small' color={'#0580FF'} />
    );

    const imagesCallback = (callback) => {
        const { navigation } = props;
        props.navigation.setOptions({
            headerRight: () => getHeaderLoader()
        });

        callback.then(async (photos) => {
            const cPhotos = [];
            for (let photo of photos) {
                const pPhoto = await processImageAsync(photo.uri, photo);
                cPhotos.push({
                    uri: pPhoto.uri,
                    name: photo.filename,
                    type: 'image/jpg',
                    // base64: pPhoto.base64
                })
            }
            // CARICA LE FOTO DIRETTAMENTE DI QUA!
            navigation.navigate('ClientCalendar', { photos: cPhotos });
        })
            .catch((e) => console.log(e));
    };

    const processImageAsync = async (uri, ph) => {
        const file = await ImageManipulator.manipulateAsync(
            uri,
            [{ resize: { width: ph.width * resize, height: ph.height * resize } }],
            { compress: compress, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );
        return file;
    };

    const renderDoneButton = (count, onSubmit) => {
        if (!count) return null;
        return <TouchableOpacity title={'Carica'} onPress={onSubmit}>
            <Text onPress={onSubmit}>CARICA</Text>
        </TouchableOpacity>
    }

    const updateHandler = (count, onSubmit) => {
        props.navigation.setOptions({
            title: `Selected ${count} files`,
            headerRight: () => renderDoneButton(count, onSubmit)
        });
    };

    const renderSelectedComponent = (number) => (
        <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{number}</Text>
        </View>
    );

    const emptyStayComponent = <Text style={styles.emptyStay}>Empty =(</Text>;

    return (
        <View style={[styles.flex, styles.container]}>
            <Text>Scegli foto</Text>
            <ImageBrowser
                max={15}
                onChange={updateHandler}
                callback={imagesCallback}
                renderSelectedComponent={renderSelectedComponent}
                emptyStayComponent={emptyStayComponent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1
    },
    container: {
        position: 'relative'
    },
    emptyStay: {
        textAlign: 'center',
    },
    countBadge: {
        paddingHorizontal: 8.6,
        paddingVertical: 5,
        borderRadius: 50,
        position: 'absolute',
        right: 3,
        bottom: 3,
        justifyContent: 'center',
        backgroundColor: '#0580FF'
    },
    countBadgeText: {
        fontWeight: 'bold',
        alignSelf: 'center',
        padding: 'auto',
        color: '#ffffff'
    }
});