import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <LinearGradient
      colors={['#1A2B4C', '#3366CC']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.welcomeText}>¡Bienvenido, Alex!</Text>

        <Text style={styles.sectionTitle}>Tus Listas de Reproducción</Text>
        <View style={styles.playlistsContainer}>
          <View style={styles.playlistItem}>
            <View style={styles.playlistImagePlaceholder} />
            <Text style={styles.playlistText}>Tus Listas</Text>
          </View>
          <View style={styles.playlistItem}>
            <View style={styles.playlistImagePlaceholder} />
            <Text style={styles.playlistText}>Cuatro Millones</Text>
          </View>
          <View style={styles.playlistItem}>
            <View style={styles.playlistImagePlaceholder} />
            <Text style={styles.playlistText}>Reproducido Recientemente</Text>
          </View>
          <View style={styles.playlistItem}>
            <View style={styles.playlistImagePlaceholder} />
            <Text style={styles.playlistText}>Recomendaciones</Text>
          </View>
          <View style={styles.playlistItem}>
            <View style={styles.playlistImagePlaceholder} />
            <Text style={styles.playlistText}>Clasificación</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recomendado para Ti</Text>
        <View style={styles.recommendedContainer}>
          <View style={styles.recommendedItem}>
            <View style={styles.recommendedImagePlaceholder} />
            <Text style={styles.recommendedText}>Reproducido Recientemente</Text>
          </View>
          <View style={styles.recommendedItem}>
            <View style={styles.recommendedImagePlaceholder} />
            <Text style={styles.recommendedText}>Lunas Bárbaras</Text>
          </View>
          <View style={styles.recommendedItem}>
            <View style={styles.recommendedImagePlaceholder} />
            <Text style={styles.recommendedText}>Patrulla Mitil</Text>
          </View>
          <View style={styles.recommendedItem}>
            <View style={styles.recommendedImagePlaceholder} />
            <Text style={styles.recommendedText}>Gour Siley</Text>
          </View>
          <View style={styles.recommendedItem}>
            <View style={styles.recommendedImagePlaceholder} />
            <Text style={styles.recommendedText}>Bery:</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <Link href="/home" asChild>
          <TouchableOpacity style={styles.navItem}>
            <View style={styles.navIconPlaceholder} />
            <Text style={styles.navText}>Inicio</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/settings" asChild>
          <TouchableOpacity style={styles.navItem}>
            <View style={styles.navIconPlaceholder} />
            <Text style={styles.navText}>Configuración</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/wallet" asChild>
          <TouchableOpacity style={styles.navItem}>
            <View style={styles.navIconPlaceholder} />
            <Text style={styles.navText}>Billetera</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/dashboard" asChild>
          <TouchableOpacity style={styles.navItem}>
            <View style={styles.navIconPlaceholder} />
            <Text style={styles.navText}>Dashboard</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 100, // Space for bottom navigation
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 30,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    marginTop: 20,
  },
  playlistsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  playlistItem: {
    width: '48%', // Adjust as needed
    marginBottom: 15,
    alignItems: 'center',
  },
  playlistImagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 5,
    backgroundColor: '#333', // Placeholder background color
  },
  playlistText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
  recommendedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  recommendedItem: {
    width: '48%', // Adjust as needed
    marginBottom: 15,
    alignItems: 'center',
  },
  recommendedImagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 5,
    backgroundColor: '#333', // Placeholder background color
  },
  recommendedText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
  },
  navIconPlaceholder: {
    width: 30,
    height: 30,
    backgroundColor: '#333', // Placeholder background color
    marginBottom: 5,
  },
  navText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
});