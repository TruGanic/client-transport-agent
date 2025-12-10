import React from 'react';
import { Alert, Button, Text, View } from 'react-native';


export default function TripStart() {
function startTrip() {
Alert.alert('Trip Started', 'GPS & transport workflow would begin here (demo).');
}


return (
<View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
<Text style={{fontSize:20}}>Transport / Trip</Text>
<Button title="Start Trip" onPress={startTrip} />
</View>
);
}