import { Image, type StyleProp, type ImageStyle, Platform, ViewStyle } from 'react-native';
import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';

interface IconSymbolImageProps {
  source: any;
  name?: never;
  size?: number;
  color?: string;
  style?: StyleProp<ImageStyle>;
  weight?: never;
}

interface IconSymbolSymbolProps {
  source?: never;
  name: SymbolViewProps['name'];
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}

type IconSymbolProps = IconSymbolImageProps | IconSymbolSymbolProps;

function IconSymbolImage({ source, size = 24, color, style }: IconSymbolImageProps) {
  return <Image source={source} style={[{ width: size, height: size, tintColor: color }, style]} />;
}

function IconSymbolNative({ name, size = 24, color, style, weight = 'regular' }: IconSymbolSymbolProps) {
  return (
    <SymbolView
      weight={weight}
      tintColor={color}
      resizeMode="scaleAspectFit"
      name={name}
      style={[{ width: size, height: size }, style]}
    />
  );
}

/**
 * An icon component that displays an image or a symbol based on platform.
 */
export function IconSymbol(props: IconSymbolProps) {
  if (Platform.OS === 'ios' && props.name) {
    return <IconSymbolNative {...(props as IconSymbolSymbolProps)} />;
  } else if (props.source) {
    return <IconSymbolImage {...(props as IconSymbolImageProps)} />;
  } else {
    return null; // Or a fallback icon/component
  }
}
