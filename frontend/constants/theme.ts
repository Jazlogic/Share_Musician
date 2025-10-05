/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';
import { AppColors } from '../theme/colors';

const tintColorLight = AppColors.primary.accent;
const tintColorDark = AppColors.neutral.white;

export const Colors = {
  light: {
    text: AppColors.text.light,
    background: AppColors.background.light,
    tint: tintColorLight,
    icon: AppColors.icon.default,
    tabIconDefault: AppColors.icon.default,
    tabIconSelected: tintColorLight,
    borderTopColor: AppColors.border.dark,
  },
  dark: {
    text: AppColors.text.dark,
    background: AppColors.background.dark,
    tint: tintColorDark,
    icon: AppColors.icon.default,
    tabIconDefault: AppColors.icon.default,
    tabIconSelected: tintColorDark,
    borderTopColor: AppColors.border.dark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
