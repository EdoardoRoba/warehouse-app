import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'blue',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textual: {
    color: 'white',
  },
});

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <Text onPress={() => console.log("Ciao Edo!")} style={styles.textual}>Ciao Edo!</Text>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}
