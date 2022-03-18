import { axiosInstance, beUrl } from "../config.js"
import React, { useState, useEffect } from 'react';
import { Button, Image, View, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageBrowser } from 'expo-image-picker-multiple';

export default function ImagePickerExample() {
    const [image, setImage] = useState(null);

    React.useEffect(() => {
        setImage(null);
    }, []);

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log(result);

        if (!result.cancelled) {
            setImage(result.uri);
            console.log("uri:")
            console.log(result.uri)
        }
    };

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {/* <Button title="Pick an image from camera roll" onPress={pickImage} /> */}
            <ImageBrowser
                max={10}
                onChange={(num, onSubmit) => {
                    console.log("ciao1")
                }}
                callback={(callback) => {
                    pickImage()
                    callback.then(() => {
                        pickImage()
                        console.log("ciaoooooooooooooooooooooo")
                    })
                }}
                onDone={(num, onSubmit) => {
                    console.log("finito")
                }}
            />
            {/* {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />} */}
        </View>
    );
}