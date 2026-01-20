import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ECCILogo = ({ size = 'large' }) => {
  const isLarge = size === 'large';
  
  return (
    <View style={styles.container}>
      <Text style={[styles.title, isLarge && styles.titleLarge]}>ECCI</Text>
      <View style={[styles.underline, isLarge && styles.underlineLarge]} />
      <Text style={[styles.subtitle, isLarge && styles.subtitleLarge]}>
        Escuela de{'\n'}
        <Text style={styles.bold}>Ciencias de la{'\n'}Computación e{'\n'}Informática</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 2,
  },
  titleLarge: {
    fontSize: 64,
  },
  underline: {
    width: 200,
    height: 4,
    backgroundColor: '#3B82F6',
    marginTop: 4,
    marginBottom: 16,
  },
  underlineLarge: {
    width: 260,
    height: 5,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 20,
  },
  subtitleLarge: {
    fontSize: 16,
    lineHeight: 24,
  },
  bold: {
    fontWeight: '600',
    color: '#4B5563',
  },
});
