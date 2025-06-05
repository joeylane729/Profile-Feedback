import React from 'react';
import Svg, { Circle, Path, G } from 'react-native-svg';
import { StyleProp, ViewStyle } from 'react-native';

interface CoinIconProps {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

const CoinIcon: React.FC<CoinIconProps> = ({ size = 18, color = '#333', style }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={style}>
    <Circle cx="24" cy="24" r="20" stroke={color} strokeWidth="3" fill="none" />
    <Circle cx="24" cy="24" r="15" stroke={color} strokeWidth="2.5" fill="none" />
    <G transform="scale(-1,1) translate(-48,0)">
      <Path
        d="M24 14v20M19 18c0-2.5 2.5-4 5-4s5 1.5 5 4c0 2.5-2.5 4-5 4s-5 1.5-5 4c0 2.5 2.5 4 5 4s5-1.5 5-4"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </G>
  </Svg>
);

export default CoinIcon; 