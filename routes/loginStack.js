import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer } from "react-navigation";
import Login from '../components/Login'
import QRScanner from '../components/QRScanner'
import Client from '../components/Client'
import Home from "../components/Home";
import Route from "../components/Route";
import Icon from 'react-native-vector-icons/FontAwesome';

const screens = {
    Login: {
        screen: Login,
        navigationOptions: {
            title: "Login"
        }
    },
    Route: {
        screen: Route,
        navigationOptions: {
            title: "Idroaltech"
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