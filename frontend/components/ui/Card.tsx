import React from 'react';
import { View, ViewProps } from 'react-native';
import { commonStyles } from '../../theme/commonStyles';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, style, ...props }) => {
  return (
    <View style={[commonStyles.card, style]} {...props}>
      {children}
    </View>
  );
};

export default Card;