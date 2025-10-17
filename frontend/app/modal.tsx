import { useLocalSearchParams, router } from 'expo-router';
import { useEffect } from 'react';

export default function ModalScreen() {
  const params = useLocalSearchParams();
  const requestId = params.requestId as string;
  const flow = params.flow as string;

  useEffect(() => {
    if (flow === 'makeOffer' && requestId) {
      // Redirigir a la pantalla de hacer oferta
      router.replace({
        pathname: '/make-offer',
        params: { requestId, flow }
      });
    } else {
      // Redirigir a la pantalla principal si no hay parámetros válidos
      router.replace('/');
    }
  }, [flow, requestId]);

  // Este componente no renderiza nada ya que redirige inmediatamente
  return null;
}
