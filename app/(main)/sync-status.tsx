import { StyleSheet, Text, View } from 'react-native';

export default function SyncStatusScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Merkle Sync Manager</Text>
      <View style={styles.card}>
        <Text>Status: Offline 🔴</Text>
        <Text>Pending Batches: 12</Text>
        <Text>Local Merkle Root: 0xAb3...99</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f4f4f4' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  card: { padding: 15, backgroundColor: 'white', borderRadius: 10 }
});