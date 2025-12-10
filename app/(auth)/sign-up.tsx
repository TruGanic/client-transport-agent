import { useRouter } from 'expo-router';
import React from 'react';
import { Button, Text, View } from 'react-native';


export default function SignUp() {
const router = useRouter();
return (
<View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
<Text>Sign Up (demo)</Text>
<Button title="Back to Login" onPress={() => router.back()} />
</View>
);
}