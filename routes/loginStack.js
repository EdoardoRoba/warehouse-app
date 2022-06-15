import { createStackNavigator } from "react-navigation-stack";
import { createAppContainer } from "react-navigation";
import { TouchableOpacity } from "react-native";
import Login from '../components/Login'
import Route from "../components/Route";
import Logout from "../components/Logout";
import Home from "../components/Home";

const screens = {
    Login: {
        screen: Login,
        navigationOptions: {
            title: "Login"
        }
    },
    Route: {
        screen: Route,
        navigationOptions: ({ navigation }) => ({
            title: "Idroaltech",
            headerRight: (
                <TouchableOpacity
                    // style={{ backgroundColor: '#DDDDDD', padding: 5 }}
                    onPress={() => navigation.navigate("Login")}>
                    <Logout />
                </TouchableOpacity>
            ),
            headerLeft: null
        })
    },
    Home: {
        screen: Home,
        navigationOptions: ({ navigation }) => ({
            title: null
        })
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