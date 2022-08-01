import { axiosInstance, beUrl } from "../config.js"
import React from 'react';
import { StyleSheet, ActivityIndicator, View, ScrollView, Text, Image, Modal, Pressable, TouchableOpacity } from 'react-native';
import { Menu } from 'react-native-paper';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import randomColor from "randomcolor";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Client from "./Client.js";

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
        width: 200
    },
    overlayLoadingContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        backgroundColor: 'transparent'
    },
    rMaxWidth181ramg: {
        maxWidth: '100%'
    },
    item: {
        backgroundColor: 'white',
        flex: 1,
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
        marginTop: 17
    }
});

export default function MyCalendar(props) {

    const [events, setEvents] = React.useState([])
    const [eventsCalendar, setEventsCalendar] = React.useState({})
    const [itemsCalendar, setItemsCalendar] = React.useState({})
    const [customersInEvent, setCustomersInEvent] = React.useState([])
    const [isLoading, setIsLoading] = React.useState(false);
    const [showDates, setShowDates] = React.useState(false);
    const [openModal, setOpenModal] = React.useState(false);
    const [token, setToken] = React.useState(null);
    const [customerSelected, setCustomerSelected] = React.useState();

    const { navigate } = props.navigation;

    // Request Camera Permission
    React.useEffect(() => {
        getToken()
    }, []);

    // Request Camera Permission
    React.useEffect(() => {
        if (token) {
            getEvents();
        }
    }, [token]);

    // Request Camera Permission
    React.useEffect(() => {
        // console.log("events: ", eventsCalendar)
    }, [eventsCalendar]);

    const getEvents = () => {
        setIsLoading(true)
        let userFilter = props.route.params.user
        // if (userFilter === "mirisola") {
        //     userFilter = "admin"
        // }
        axiosInstance.get(beUrl + 'calendar?user=' + userFilter, { headers: { "Authorization": `Bearer ${token}` } })
            .then(res => {
                setEvents(res.data)
                createDataset(res.data)
                setIsLoading(false)
            }).catch(error => {
                setIsLoading(false)
                // setShowError(true)
            });
    }

    const createDataset = async (evs) => {
        let eventCalendar = {}
        let itemCalendar = {}
        for (let e of evs) {
            const col = randomColor()
            for (let dt = new Date(e.start); dt <= new Date(e.end); dt.setDate(dt.getDate() + 1)) {
                let periods = []
                let items = []
                if (eventCalendar[dt.getFullYear().toString() + "-" + (dt.getMonth() + 1).toString().padStart(2, "0") + "-" + dt.getDate().toString().padStart(2, "0")] === undefined) {
                    periods = []
                    items = []
                } else {
                    periods = eventCalendar[dt.getFullYear().toString() + "-" + (dt.getMonth() + 1).toString().padStart(2, "0") + "-" + dt.getDate().toString().padStart(2, "0")].periods
                    items = itemCalendar[dt.getFullYear().toString() + "-" + (dt.getMonth() + 1).toString().padStart(2, "0") + "-" + dt.getDate().toString().padStart(2, "0")]
                }
                let period = {}
                let item = {}
                if (Platform.OS !== 'android') {
                    item = { name: e.title + "\n\n" + new Date(e.start).toLocaleString('it-IT').split(", ")[1].substring(0, 5) + " - " + new Date(e.end).toLocaleString('it-IT').split(", ")[1].substring(0, 5), height: 20, dateString: dt.getFullYear().toString() + "-" + (dt.getMonth() + 1).toString().padStart(2, "0") + "-" + dt.getDate().toString().padStart(2, "0"), type: e.type, customerId: e.customer._id, employees: e.employees.map((e) => e.lastName).join("-"), start: new Date(e.start).toLocaleString('it-IT'), end: new Date(e.end).toLocaleString('it-IT') }
                } else {
                    let tStart = new Date(e.start).toLocaleString('it-IT').split(", ")[0].split(" ").filter((el) => el !== "")[3].substring(0, 5)
                    let tEnd = new Date(e.end).toLocaleString('it-IT').split(", ")[0].split(" ").filter((el) => el !== "")[3].substring(0, 5)
                    // let tStart = new Date(e.start).toLocaleString('it-IT').split(", ")[0].split(" ")[2] === "" ? new Date(e.start).toLocaleString('it-IT').split(", ")[0].split(" ")[4].substring(0, 5) : new Date(e.start).toLocaleString('it-IT').split(", ")[0].split(" ")[3].substring(0, 5)
                    // let tEnd = new Date(e.end).toLocaleString('it-IT').split(", ")[0].split(" ")[2] === "" ? new Date(e.end).toLocaleString('it-IT').split(", ")[0].split(" ")[4].substring(0, 5) : new Date(e.end).toLocaleString('it-IT').split(", ")[0].split(" ")[3].substring(0, 5)
                    item = { name: e.title + "\n\n" + tStart + " - " + tEnd, height: 20, dateString: dt.getFullYear().toString() + "-" + (dt.getMonth() + 1).toString().padStart(2, "0") + "-" + dt.getDate().toString().padStart(2, "0"), type: e.type, customerId: e.customer._id, employees: e.employees.map((e) => e.lastName).join("-"), start: new Date(e.start).toLocaleString('it-IT'), end: new Date(e.end).toLocaleString('it-IT') }
                }
                if (dt === new Date(e.start)) {
                    period = { startingDay: true, endingDay: false, color: col, id: e._id, customer: e.customer.nome_cognome, title: e.title, type: e.type, customerId: e.customer._id, start: new Date(e.start).toLocaleString('it-IT'), end: new Date(e.end).toLocaleString('it-IT') }
                } else if (dt === new Date(e.end)) {
                    period = { startingDay: false, endingDay: true, color: col, id: e._id, customer: e.customer.nome_cognome, title: e.title, type: e.type, customerId: e.customer._id, start: new Date(e.start).toLocaleString('it-IT'), end: new Date(e.end).toLocaleString('it-IT') }
                } else {
                    period = { startingDay: false, endingDay: false, color: col, id: e._id, customer: e.customer.nome_cognome, title: e.title, type: e.type, customerId: e.customer._id, start: new Date(e.start).toLocaleString('it-IT'), end: new Date(e.end).toLocaleString('it-IT') }
                }
                periods.push(period)
                items.push(item)
                itemCalendar[dt.getFullYear().toString() + "-" + (dt.getMonth() + 1).toString().padStart(2, "0") + "-" + dt.getDate().toString().padStart(2, "0")] = items
                if (eventCalendar[dt.getFullYear().toString() + "-" + (dt.getMonth() + 1).toString().padStart(2, "0") + "-" + dt.getDate().toString().padStart(2, "0")] === undefined) {
                    eventCalendar[dt.getFullYear().toString() + "-" + (dt.getMonth() + 1).toString().padStart(2, "0") + "-" + dt.getDate().toString().padStart(2, "0")] = { periods: periods }
                } else {
                    eventCalendar[dt.getFullYear().toString() + "-" + (dt.getMonth() + 1).toString().padStart(2, "0") + "-" + dt.getDate().toString().padStart(2, "0")].periods = periods
                }
            }
        }
        setItemsCalendar(itemCalendar)
        setEventsCalendar(eventCalendar)
        setIsLoading(false)
    }

    const getToken = async () => {
        let tkn = await AsyncStorage.getItem("token")
        setToken(tkn)
    }

    const showDate = (day) => {
        if (eventsCalendar[day.dateString] !== undefined) {
            let cies = []
            // console.log(eventsCalendar[day.dateString].periods)
            for (let period of eventsCalendar[day.dateString].periods) {
                cies.push({ title: period.title, customerId: period.customerId })
            }
            setCustomersInEvent(cies)
            setShowDates(true)
        } else {
            setCustomersInEvent([])
            setShowDates(false)
        }
    }

    const showCustomer = (item) => {
        setIsLoading(true)
        if (item.type !== "appuntamento") {
            axiosInstance.get(beUrl + 'customer/' + item.customerId, { headers: { "Authorization": `Bearer ${token}` } })
                .then(res => {
                    setCustomerSelected(res.data)
                    setOpenModal(true)
                    setIsLoading(false)
                    navigate('ClientCalendar', { customerSelected: res.data, event: item });
                }).catch(error => {
                    // console.log("ok")
                    setIsLoading(false)
                    // setShowError(true)
                });
        } else {
            setIsLoading(false)
            navigate('AppuntamentoCalendar', { appuntamento: item });
        }
    }

    // Return the SafeAreaView
    return (
        <>
            {
                !isLoading ? null : <View style={styles.overlayLoadingContainer}>
                    <ActivityIndicator size="large" color="green" animating={true} />
                </View>
            }
            <Agenda
                onDayPress={day => {
                    showDate(day);
                }}
                items={itemsCalendar}
                markingType="multi-period"
                markedDates={eventsCalendar}
                refreshing={false}
                renderItem={(item) => {
                    return <Pressable style={[styles.item]} onPress={() => {
                        showCustomer(item)
                        // console.log("ciao")
                    }}><Text>{item.name}</Text></Pressable>
                }}
                refreshControl={null}
                pastScrollRange={50}
                futureScrollRange={50}
            />
        </>
    );
}
