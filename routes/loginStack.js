import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer } from "react-navigation";
import Login from '../Components/Login'
import QRScanner from '../Components/QRScanner'

const screens = {
    Login: {
        screen: Login,
        navigationOptions: {
            title: "Login"
        }
    },
    QRScanner: {
        screen: QRScanner,
        navigationOptions: {
            title: "Scannerizza il codice QR"
        }
    },
}

const HomeStack = createStackNavigator(screens, {
    defaultNavigationOptions: {
        headerTintColor: "white",
        headerStyle: {
            backgroundColor: "#0282ba",
            height: 100
        }
    }
});

export default createAppContainer(HomeStack)