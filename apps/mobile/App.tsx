import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, Text } from "react-native";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <Text accessibilityRole="header" style={styles.title}>
        Sina Maoni
      </Text>
      <Text style={styles.caption}>Accessibility scanning and WCAG conformance tracking.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 24 },
  title: { fontSize: 28, fontWeight: "600" },
  caption: { fontSize: 14, color: "#475569", textAlign: "center" },
});
