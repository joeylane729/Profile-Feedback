import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

interface RatingSliderProps {
  min: number;
  max: number;
  step: number;
  initialValue: number;
  onValueChange: (value: number) => void;
  leftLabel?: string;
  rightLabel?: string;
}

const RatingSlider: React.FC<RatingSliderProps> = ({
  min,
  max,
  step,
  initialValue,
  onValueChange,
  leftLabel,
  rightLabel,
}) => {
  const [value, setValue] = useState(initialValue);

  const handleValueChange = (newValue: number) => {
    setValue(newValue);
    onValueChange(newValue);
  };

  return (
    <View style={styles.container}>
      {leftLabel && <Text style={styles.label}>{leftLabel}</Text>}
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={value}
          onValueChange={handleValueChange}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#e0e0e0"
          thumbTintColor="#007AFF"
        />
      </View>
      {rightLabel && <Text style={styles.label}>{rightLabel}</Text>}
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  sliderContainer: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    minWidth: 30,
    textAlign: 'center',
  },
});

export default RatingSlider; 