import { StyleSheet, ScrollView } from 'react-native';
import { NotificationTestPanel } from '@/src/components/NotificationTestPanel';

export default function TabOneScreen() {
  return (
    <ScrollView style={styles.scrollView}>
      {/* Painel de Notificações */}
      <NotificationTestPanel />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
});
