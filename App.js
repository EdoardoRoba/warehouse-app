import { axiosInstance } from "./config.js"
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button, Alert, TextInput } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Avatar, Card, Title, Paragraph } from 'react-native-paper';
import NumericInput from 'react-native-numeric-input';
import FlashMessage, { showMessage, hideMessage } from "react-native-flash-message";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './Components/Login'
import Navigator from './routes/loginStack'

const Stack = createNativeStackNavigator();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    // justifyContent: 'center',
  },
  maintext: {
    fontSize: 16,
    margin: 20,
  },
  barcodebox: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    width: 300,
    overflow: 'hidden',
    borderRadius: 30,
    backgroundColor: 'tomato'
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});

export default function App() {

  const [hasPermission, setHasPermission] = React.useState(null);
  const [scanned, setScanned] = React.useState(false);
  const [url, setUrl] = React.useState('Nessun risultato')
  const [notFound, setNotFound] = React.useState(false);
  const [showError, setShowError] = React.useState(false);
  const [confermaUpdate, setConfermaUpdate] = React.useState(false);
  const [toolFound, setToolFound] = React.useState({});
  const [diff, setDiff] = React.useState(0);

  const askForCameraPermission = () => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })()
  }

  // Request Camera Permission
  React.useEffect(() => {
    askForCameraPermission();
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setNotFound(false)
    }, 5000);
    return () => clearTimeout(timer);
  }, [notFound]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowError(false)
    }, 5000);
    return () => clearTimeout(timer);
  }, [showError]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setConfermaUpdate(false)
    }, 5000);
    return () => clearTimeout(timer);
  }, [confermaUpdate]);

  React.useEffect(() => {
    if (scanned && url.includes("https://my-warehouse-app-heroku.herokuapp.com/api/")) {
      axiosInstance.get(url)
        .then(response => {
          // console.log("ciao", response.data)
          setToolFound(response.data)
          setNotFound(false)
        }).catch(error => {
          console.log("Tool not found")
          setNotFound(true)
        });
    }
    if (url !== "Nessun risultato" && !url.includes("https://my-warehouse-app-heroku.herokuapp.com/api/")) {
      console.log("Tool not found")
      setNotFound(true)
    }
  }, [scanned])

  // What happens when we scan the bar code
  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setUrl(data)
    // console.log('Type: ' + type + '\nData: ' + data)
  };

  const updateBook = () => {
    var newField = {}
    newField = { quantity: toolFound.quantity + diff }
    axiosInstance.put(url, newField).then(ersp => {
      axiosInstance.put(url, newField).then(response => {
        // console.log("Fatto!", response.data)
        setConfermaUpdate(true)
        setToolFound(response.data)
        showMessage({
          message: "Prodotto aggiornato correttamente!",
          type: "info",
          backgroundColor: "green",
          color: "white"
        });
      }).catch((err) => {
        console.log("err: ", err)
        setShowError(true)
      });
    }).catch((error) => {
      console.log("error: ", error)
      setShowError(true)
    });
  }

  // Check permissions and return the screens
  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Requesting for camera permission</Text>
      </SafeAreaView>)
  }
  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ margin: 10 }}>No access to camera</Text>
        <Button title={'Accedi alla fotocamera'} onPress={() => askForCameraPermission()} />
      </SafeAreaView>)
  }

  // Return the SafeAreaView
  return (
    // <SafeAreaView style={styles.container}>
    <Navigator />
    /* <FlashMessage position="top" />
    <SafeAreaView style={styles.barcodebox}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={{ height: 400, width: 400 }} />
    </SafeAreaView>

    {scanned && <Button title={'Scannerizza nuovamente?'} onPress={() => setScanned(false)} color='tomato' />}
    {
      (notFound) ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: "80%" }}><Text style={{ color: "red" }}>prodotto non trovato! Controlla che il prodotto sia scritto correttamente.</Text></View> : <View style={{ width: "80%" }}>
        {toolFound.label === undefined ? null :
          <SafeAreaView style={{ marginTop: 30, width: "100%" }}>
            <Card>
              <Card.Title title={toolFound.label.toUpperCase()} />
              <Card.Content>
                <Title style={{ fontSize: 15 }}>quantità attuale</Title>
                <Paragraph style={{ fontSize: 12 }}>{toolFound.quantity}</Paragraph>
              </Card.Content>
            </Card>
            <View style={{ flexDirection: "row", alignItems: 'center', marginTop: 10, marginLeft: 30, marginRight: 30, width: '100%' }}>
              <Text style={{ flex: 1 }}>togli</Text>
              <NumericInput style={{ flex: 2 }} onChange={value => setDiff(value)} />
              <Text style={{ flex: 3, marginLeft: 5 }}>aggiungi</Text>
            </View>
            <Button title={'Aggiorna'} onPress={() => updateBook()} color='tomato' />
          </SafeAreaView>
        }
      </View>
    }
    {
      !showError ? null : <Alert style={{ width: '50%', marginLeft: 'auto', marginRight: 'auto', marginTop: '1rem' }} severity="error">Errore. Controlla la connessione o i dati inseriti.</Alert>
    } */
    // </SafeAreaView>
  );
}
