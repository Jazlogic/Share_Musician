import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppColors } from '../theme/colors';
import BottomNavigationBar from '@/components/BottomNavigationBar';
import { Ionicons } from '@expo/vector-icons';

export default function WalletScreen() {
  const gradientStart = useThemeColor({ light: AppColors.background.gradientStartLight, dark: AppColors.background.gradientStartDark }, 'background');
  const gradientEnd = useThemeColor({ light: AppColors.background.gradientEndLight, dark: AppColors.background.gradientEndDark }, 'background');
  const color = useThemeColor({ light: AppColors.text.light, dark: AppColors.text.dark }, 'text');
  const buttonColor = useThemeColor({ light: AppColors.button.backgroundLight, dark: AppColors.button.backgroundDark }, 'text');
  const backgrounIitemColor = useThemeColor({ light: AppColors.items.backgroundLight, dark: AppColors.items.backgroundDark}, 'background');
  const itemTextColor = useThemeColor({ light: AppColors.items.textLight, dark: AppColors.items.textDark }, 'text');

  const currentBalance = '$2,450.50';
  interface PaymentMethod {
    id: string;
    name: string;
    icon: keyof typeof Ionicons.glyphMap;
  }
  const paymentMethods: PaymentMethod[] = [
    { id: '1', name: 'Tarjeta de Crédito', icon: "card" },
    { id: '2', name: 'PayPal', icon: "logo-paypal" },
    { id: '3', name: 'Transferencia Bancaria', icon: "trending-up" },
  ];

  const transactions = [
    { id: '1', description: 'Concierto de Jazz', amount: '-$50.00', type: 'expense', date: '2024-07-20' },
    { id: '2', description: 'Pago de Cliente', amount: '+$200.00', type: 'income', date: '2024-07-19' },
    { id: '3', description: 'Clase de Música', amount: '-$30.00', type: 'expense', date: '2024-07-18' },
    { id: '4', description: 'Venta de Instrumento', amount: '+$500.00', type: 'income', date: '2024-07-17' },
  ];

  return (
    <LinearGradient
      colors={[gradientStart, gradientEnd]}
      style={{flex: 1}}
    >
      
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Saldo Actual */}
        <LinearGradient
          colors={[gradientStart, gradientEnd]}
          style={styles.balanceCard}
          >
          <Text style={[styles.balanceTitle, { color}]}>Saldo Actual</Text>
          <Text style={[styles.balanceAmount, { color }]}>{currentBalance}</Text>
          <TouchableOpacity style={[styles.addButton, { backgroundColor: buttonColor }]}>
            <Text style={[styles.addButtonText, { color}]}>Añadir Fondos</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Métodos de Pago */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color }]}>Métodos de Pago</Text>
          {paymentMethods.map((method) => (
            <View key={method.id} style={[styles.paymentMethodItem, { backgroundColor: backgrounIitemColor }]}>
              {/* <IconSymbol name={method.icon} size={24} color={itemTextColor} /> */}
               <Ionicons name={method.icon} size={24} color={AppColors.text.white} />
              <Text style={[styles.paymentMethodText, { color: itemTextColor }]}>{method.name}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.addMethodButton}>
            <Text style={[styles.addMethodButtonText, { color}]}>Añadir Nuevo Método</Text>
          </TouchableOpacity>
        </View>

        {/* Transacciones Recientes */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color }]}>Transacciones Recientes</Text>
          {transactions.map((transaction) => (
            <View key={transaction.id} style={[styles.transactionItem, { backgroundColor: backgrounIitemColor }]}>
              <View>
                <Text style={[styles.transactionDescription, { color}]}>{transaction.description}</Text>
                <Text style={[styles.transactionDate, { color: color }]}>{transaction.date}</Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  {
                    color: transaction.type === 'income' ? color : color,
                  },
                ]}
                >
                {transaction.amount}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <BottomNavigationBar />
    </View>
  </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 30,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 80, // Espacio para la barra de navegación inferior
  },
  balanceCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    // elevation: 8,
  },
  balanceTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    // elevation: 3,
  },
  paymentMethodText: {
    fontSize: 16,
    marginLeft: 15,
  },
  addMethodButton: {
    marginTop: 10,
    padding: 10,
    alignItems: 'center',
  },
  addMethodButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    // elevation: 3,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});