import { axiosInstance, beUrl } from "../config.js"
import React from 'react';
import { StyleSheet, ActivityIndicator, View, ScrollView, Text, Image } from 'react-native';
import { Menu } from 'react-native-paper';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import randomColor from "randomcolor";


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
});

export default function MyCalendar({ user }) {

    const [events, setEvents] = React.useState([])
    const [eventsCalendar, setEventsCalendar] = React.useState([])
    const [customersInEvent, setCustomersInEvent] = React.useState([])
    const [isLoading, setIsLoading] = React.useState(true);
    const [showDates, setShowDates] = React.useState(false);

    // Request Camera Permission
    React.useEffect(() => {
        getEvents();
    }, []);

    const getEvents = () => {
        axiosInstance.get(beUrl + 'calendar')
            .then(res => {
                // console.log("calendar: ", res.data)
                setEvents(res.data)
                createDataset(res.data)
            }).catch(error => {
                // console.log("error")
                setIsLoading(false)
                setShowError(true)
            });
    }

    const createDataset = async (evs) => {
        let eventCalendar = {}
        for (let e of evs) {
            const col = randomColor()
            for (let dt = new Date(e.start); dt <= new Date(e.end); dt.setDate(dt.getDate() + 1)) {
                let periods = []
                if (eventCalendar[dt.getFullYear().toString() + "-" + (dt.getMonth() + 1).toString().padStart(2, "0") + "-" + dt.getDate().toString().padStart(2, "0")] === undefined) {
                    periods = []
                } else {
                    periods = eventCalendar[dt.getFullYear().toString() + "-" + (dt.getMonth() + 1).toString().padStart(2, "0") + "-" + dt.getDate().toString().padStart(2, "0")].periods
                }
                let period = {}
                if (dt === new Date(e.start)) {
                    period = { startingDay: true, endingDay: false, color: col, id: e._id, customer: e.customer.nome_cognome, title: e.title }
                } else if (dt === new Date(e.end)) {
                    period = { startingDay: false, endingDay: true, color: col, id: e._id, customer: e.customer.nome_cognome, title: e.title }
                } else {
                    period = { startingDay: false, endingDay: false, color: col, id: e._id, customer: e.customer.nome_cognome, title: e.title }
                }
                periods.push(period)
                if (eventCalendar[dt.getFullYear().toString() + "-" + (dt.getMonth() + 1).toString().padStart(2, "0") + "-" + dt.getDate().toString().padStart(2, "0")] === undefined) {
                    eventCalendar[dt.getFullYear().toString() + "-" + (dt.getMonth() + 1).toString().padStart(2, "0") + "-" + dt.getDate().toString().padStart(2, "0")] = { periods: periods }
                } else {
                    eventCalendar[dt.getFullYear().toString() + "-" + (dt.getMonth() + 1).toString().padStart(2, "0") + "-" + dt.getDate().toString().padStart(2, "0")].periods = periods
                }
            }
        }
        setEventsCalendar(eventCalendar)
        // console.log(eventCalendar)
        // ok = await Promise.allSettled(ok)
        // let isOk = ok.filter((e) => e.status === "fulfilled").map((e) => e.value)
        // let isNotOk = ok.filter((e) => e.status !== "fulfilled").map((e) => e.value)
        setIsLoading(false)
    }

    const showDate = (day) => {
        if (eventsCalendar[day.dateString] !== undefined) {
            let cies = []
            // console.log(eventsCalendar[day.dateString].periods)
            for (let period of eventsCalendar[day.dateString].periods) {
                cies.push(period.customer + " - " + period.title)
            }
            setCustomersInEvent(cies)
            setShowDates(true)
        } else {
            setCustomersInEvent([])
            setShowDates(false)
        }
    }

    // Return the SafeAreaView
    return (
        <View initialRouteName='Calendar'>
            <Calendar
                onDayPress={day => {
                    showDate(day);
                }}
                markingType="multi-period"
                markedDates={eventsCalendar}
            />
            {
                !isLoading ? null : <View style={styles.overlayLoadingContainer}>
                    <ActivityIndicator size="large" color="green" animating={true} />
                </View>
            }
            {
                !showDates ? null : <ScrollView>
                    {customersInEvent.map(c => {
                        return <Menu.Item key={c} title={c} />
                    })}
                </ScrollView>
            }
        </View>
    );
}
