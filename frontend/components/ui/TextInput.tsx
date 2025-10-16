import React from 'react';
import { TextInput as RNTextInput, StyleSheet, TextInputProps, TextStyle } from 'react-native';
import { commonStyles } from '../../theme/commonStyles';

interface CustomTextInputProps extends TextInputProps {
  style?: TextStyle | TextStyle[];
}

const TextInput: React.FC<CustomTextInputProps> = ({ style, ...props }) => {
  return (
    <RNTextInput
      style={[commonStyles.textInput, style]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  // Add any specific styles for the TextInput component here if needed
});

export default TextInput;