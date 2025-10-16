import React from 'react';
import { View as RNView, StyleSheet, ViewProps } from 'react-native';

interface CustomViewProps extends ViewProps {
  children?: React.ReactNode;
}

const View: React.FC<CustomViewProps> = ({ children, style, ...props }) => {
  return (
    <RNView style={[style]} {...props}>
      {children}
    </RNView>
  );
};

const styles = StyleSheet.create({
  // Add any specific styles for the View component here if needed
});

export default View;