import { calculateScore, countByImpact, type Impact } from "@sina-maoni/core";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

const DEMO_FINDINGS: { impact: Impact }[] = [
  { impact: "critical" },
  { impact: "serious" },
  { impact: "minor" },
];

export default function App() {
  const score = calculateScore(DEMO_FINDINGS);
  const counts = countByImpact(DEMO_FINDINGS);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <Text accessibilityRole="header" style={styles.title}>
        Sina Maoni
      </Text>

      <View accessible accessibilityLabel={`Accessibility score ${score} out of 100`}>
        <Text style={styles.score}>{score}</Text>
        <Text style={styles.caption}>Accessibility score</Text>
      </View>

      <View style={styles.row}>
        {(Object.keys(counts) as Impact[]).map((impact) => (
          <Text key={impact} style={styles.badge} accessibilityLabel={`${counts[impact]} ${impact}`}>
            {impact}: {counts[impact]}
          </Text>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  title: { fontSize: 28, fontWeight: "600" },
  score: { fontSize: 56, fontWeight: "700", textAlign: "center" },
  caption: { fontSize: 14, color: "#475569", textAlign: "center" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  badge: { backgroundColor: "#e2e8f0", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
});
