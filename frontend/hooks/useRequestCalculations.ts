import { useState, useEffect } from 'react';

interface RequestFormState {
  title: string;
  description: string;
  category: string;
  location: string;
  event_date: Date;
  start_time: Date;
  end_time: Date;
  is_public: boolean;
  instruments: string[];
  event_type: string;
  tip: number;
  extra_amount: number;
}

export const useRequestCalculations = (form: RequestFormState) => {
  const [predictedDuration, setPredictedDuration] = useState<string>('');
  const [dynamicPrice, setDynamicPrice] = useState<number>(0);

  useEffect(() => {
    // Predict duration based on start and end times
    const start = form.start_time.getTime();
    const end = form.end_time.getTime();
    if (end > start) {
      const diff = end - start;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setPredictedDuration(`${hours}h ${minutes}m`);
    } else {
      setPredictedDuration('Duración inválida');
    }
  }, [form.start_time, form.end_time]);

  useEffect(() => {
    // Dynamic price calculation (simplified example)
    const calculatePrice = () => {
      let price = 0;
      if (form.instruments.length > 0) {
        price += form.instruments.length * 50; // Base price per instrument
      }
      if (form.event_type) {
        price += 100; // Base price for event type
      }
      const durationInHours = (form.end_time.getTime() - form.start_time.getTime()) / (1000 * 60 * 60);
      if (durationInHours > 0) {
        price += durationInHours * 20; // Price per hour
      }
      price += form.tip;
      price += form.extra_amount;
      setDynamicPrice(parseFloat(price.toFixed(2)));
    };
    calculatePrice();
  }, [form.instruments, form.event_type, form.start_time, form.end_time, form.tip, form.extra_amount]);

  return { predictedDuration, dynamicPrice };
};