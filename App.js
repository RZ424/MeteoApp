import { useState, useEffect } from 'react';
import { Platform, Text, View, StyleSheet, Image, FlatList } from 'react-native';

import * as Location from 'expo-location';

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [meteo, setMeteo] = useState(null)
  const [forecast, setForecast] = useState(null);
  const OPENWHEATERAPIKEY = '7fc1a4a1b257ab043c9e86e2db82ab0a'

  useEffect(() => {
    async function getCurrentLocation() {

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);

      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${location.coords.latitude}&lon=${location.coords.longitude}&appid=${OPENWHEATERAPIKEY}&units=metric&lang=fr`)
        .then(function (response) {
          return response.json();
        })
        .then(response => setMeteo(response))

      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${location.coords.latitude}&lon=${location.coords.longitude}&appid=${OPENWHEATERAPIKEY}&units=metric&lang=fr`)
        .then(function (response) {
          return response.json();
        })
        .then(response => setForecast(groupForecastByDay(response.list)));
    }
    getCurrentLocation();
  }, []);

  function groupForecastByDay(forecastList) {
    const days = {};
    forecastList.forEach(item => {
      const date = item.dt_txt.split(" ")[0]; // Format YYYY-MM-DD
      if (!days[date]) days[date] = [];
      days[date].push(item);
    });
    return Object.entries(days).map(([day, hours]) => ({ day, hours }));
  }


  return (
    <View style={styles.container}>
      <View style={styles.currentContainer}>
        <Text style={styles.currentDate}>
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long", day: "numeric", month: "long"
          })}
        </Text>
        {meteo && <Text style={styles.paragraph}>{meteo.name}</Text>}
        {meteo && <Text style={styles.paragraph}>Température: {meteo.main.temp}°C</Text>}
        {meteo && <Text style={styles.paragraph}>Humidité: {meteo.main.humidity}%</Text>}
        {meteo && <Text style={styles.paragraph}>{meteo.weather[0].description}</Text>}
        {meteo && <Image style={{ width: 150, height: 150 }} source={{ uri: `https://openweathermap.org/img/wn/${meteo.weather[0].icon}@2x.png` }} />}
      </View>

      <FlatList
        data={forecast}
        keyExtractor={(item) => item.day}
        style={{ width: '100%' }}
        renderItem={({ item }) => (
          <View style={{ margin: 20 }}>
            <Text style={{ fontSize: 25, fontWeight: 'bold', marginBottom: 10 }}>{item.day}</Text>

            <FlatList
              data={item.hours}
              keyExtractor={(hourItem) => hourItem.dt_txt}
              horizontal
              renderItem={({ item: hourItem }) => (
                <View style={{ margin: 10, alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.3)', padding: 10, borderRadius: 5, width: 100 }}>
                  <Text>{new Date(hourItem.dt_txt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</Text>
                  <Text>{hourItem.main.temp}°C</Text>
                  <Text>{hourItem.weather[0].description}</Text>
                  <Image
                    style={{ width: 40, height: 40 }}
                    source={{ uri: `https://openweathermap.org/img/wn/${hourItem.weather[0].icon}@2x.png` }}
                  />
                </View>
              )}
            />
          </View>
        )}
      />


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'orange',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentContainer: {
    flexGrow: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'flex-start',
    margin: 40,
    padding: 20,
    borderColor: 'black',
    borderRadius: 10,
    width: '90%',
  },
  paragraph: {
    fontSize: 18,
    textAlign: 'center',
  },
  currentDate: {
    fontSize: 30,
    margin: 20,
  },
});
