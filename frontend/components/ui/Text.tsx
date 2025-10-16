import React from 'react';
import { Text as RNText, StyleSheet, TextProps } from 'react-native';
import { commonStyles } from '../../theme/commonStyles';

interface CustomTextProps extends TextProps {
  children: React.ReactNode;
}

const Text: React.FC<CustomTextProps> = ({ children, style, ...props }) => {
  return (
    <RNText style={[style]} {...props}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  // Add any specific styles for the Text component here if needed
});

export default Text;