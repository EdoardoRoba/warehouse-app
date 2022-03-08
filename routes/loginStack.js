import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer } from "react-navigation";
import Login from '../Components/Login'
import QRScanner from '../Components/QRScanner'
import Client from '../Components/Client'
import Home from "../Components/Home";

const screens = {
    Login: {
        screen: Login,
        navigationOptions: {
            title: "Login"
        }
    },
    Home: {
        screen: Home,
        navigationOptions: {
            title: "Home"
        }
    },
    QRScanner: {
        screen: QRScanner,
        navigationOptions: {
            title: "QRScanner"
        }
    },
    Client: {
        screen: Client,
        navigationOptions: {
            title: "Clienti"
        }
    }
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