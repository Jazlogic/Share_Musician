### Análisis General del Sistema de Estilos Actual

Observo que en archivos como `create-request.tsx`, se utilizan `StyleSheet.create` para definir estilos. También se hace uso de `useThemeColor` y se importan `AppColors` de `../theme/colors.ts`, lo cual es un buen punto de partida para la centralización de colores. Sin embargo, la creación de `dynamicStyles` dentro del componente puede llevar a re-renders innecesarios y a la repetición de lógica de estilo.

El objetivo es evitar la repetición de estilos y asegurar que los cambios de diseño se puedan aplicar de manera global y consistente desde un único lugar.

### Opciones para un Sistema de Diseño Centralizado y Reutilizable

Aquí te presento varias opciones que puedes considerar para optimizar el sistema de diseño de tu aplicación:

1.  **Centralización de `StyleSheet.create` para Estilos Estáticos:**
    *   **Descripción:** Mover todas las definiciones de `StyleSheet.create` que no dependen de props o estados a archivos de estilos dedicados (por ejemplo, `styles.ts` o `commonStyles.ts` dentro de cada módulo o a nivel global).
    *   **Beneficios:** Reduce la duplicación de código, mejora la legibilidad y facilita el mantenimiento. Los estilos se definen una vez y se importan donde se necesiten.
    *   **Ejemplo Conceptual:** En lugar de `const styles = StyleSheet.create({...})` en cada componente, tendrías `import { commonStyles } from '../styles/commonStyles';` y usarías `commonStyles.container`, `commonStyles.input`, etc.

2.  **Componentes de Estilo Reutilizables (Styled Components):**
    *   **Descripción:** Crear componentes pequeños que encapsulen tanto la estructura como los estilos comunes. Por ejemplo, un `Button` personalizado, un `TextInput` con estilos predefinidos, o un `Card` con sombreado y bordes.
    *   **Beneficios:** Promueve la reutilización de UI, asegura la consistencia visual y reduce la cantidad de código de estilo en los componentes de vista. Los cambios en el diseño de un botón, por ejemplo, se harían solo en el componente `StyledButton`.
    *   **Ejemplo Conceptual:** Tendrías un componente `<CustomButton title="Enviar" onPress={...} />` que ya tiene todos los estilos de botón aplicados internamente.

3.  **Sistema de Diseño Basado en Tokens (Design Tokens):**
    *   **Descripción:** Definir un conjunto de variables (tokens) para colores, tipografía, espaciado, tamaños de borde, etc., en un archivo central (como ya haces parcialmente con `AppColors`). Estos tokens se usarían en todos los estilos de la aplicación.
    *   **Beneficios:** Permite cambios de diseño a gran escala con facilidad (ej. cambiar la paleta de colores principal modificando solo unos pocos tokens). Asegura una consistencia de marca rigurosa.
    *   **Ejemplo Conceptual:** En `theme/tokens.ts` definirías `export const Spacing = { small: 8, medium: 16 };` y luego en tus estilos usarías `padding: Spacing.medium`.

4.  **Contexto de Tema Global (si no se usa completamente):**
    *   **Descripción:** Si bien ya usas `useThemeColor`, podrías expandir un contexto de tema para proporcionar no solo colores, sino también tipografía, espaciado y otros tokens de diseño a todos los componentes de la aplicación. Esto es especialmente útil para manejar temas claros/oscuros de manera más robusta.
    *   **Beneficios:** Permite que los componentes accedan a los valores del tema sin pasarlos explícitamente como props, simplificando la gestión de temas.
    *   **Ejemplo Conceptual:** Un `ThemeProvider` que envuelve la aplicación y un hook `useTheme` que proporciona acceso a `theme.colors.primary`, `theme.spacing.medium`, etc.

5.  **Utilización de Bibliotecas de UI/Componentes (Opcional, para el futuro):**
    *   **Descripción:** Considerar la adopción de una biblioteca de componentes de UI para React Native (como NativeBase, React Native Paper, UI Kitten, etc.) que ya vienen con un sistema de diseño integrado y componentes pre-estilizados y accesibles.
    *   **Beneficios:** Acelera el desarrollo, asegura la accesibilidad y proporciona componentes bien probados y mantenidos.
    *   **Consideración:** Esto implicaría una refactorización más grande, por lo que sería una opción a largo plazo si las soluciones internas no son suficientes.

### Plan de Acción Detallado

Para implementar un sistema de diseño centralizado y reutilizable, seguiremos los siguientes pasos, priorizando la base y la reutilización temprana:

#### Fase 1: Preparación y Centralización de Bases (Prioridad Alta)

1.  **Auditoría de Estilos y Creación de Archivo de Tokens (Día 1-2):**
    *   **Objetivo:** Identificar patrones de estilo existentes y definir la base del sistema de diseño.
    *   **Acciones:**
        *   Realizar una auditoría exhaustiva de los estilos actuales en componentes clave (ej. `create-request.tsx`, `home.tsx`, `perfil.tsx`).
        *   Identificar colores, tipografías, espaciados, tamaños de borde y sombras que se repiten.
        *   Crear un nuevo archivo `frontend/theme/tokens.ts` (o similar) para exportar estos valores como constantes (ej. `export const Spacing = { small: 8, medium: 16 };`).
        *   **Prioridad:** Alta.

2.  **Centralización de `StyleSheet.create` Estáticos (Día 3-5):**
    *   **Objetivo:** Reducir la duplicación de estilos que no dependen de props o estados.
    *   **Acciones:**
        *   Crear un archivo `frontend/theme/commonStyles.ts`.
        *   Mover las definiciones de `StyleSheet.create` estáticas y comunes de los componentes existentes a `commonStyles.ts`.
        *   Actualizar los componentes para importar y usar estos estilos centralizados.
        *   **Prioridad:** Alta.

#### Fase 2: Desarrollo de Componentes Reutilizables (Prioridad Media)

3.  **Creación de Componentes de UI Básicos (Día 6-10):**
    *   **Objetivo:** Desarrollar un conjunto de componentes de UI reutilizables que encapsulen estilos y lógica.
    *   **Acciones:**
        *   Identificar los componentes más utilizados y repetitivos (ej. `Button`, `TextInput`, `Card`, `Container`).
        *   Crear nuevos componentes en `frontend/components/ui/` (ej. `Button.tsx`, `Input.tsx`, `Card.tsx`).
        *   Estos componentes deben utilizar los `tokens.ts` y `commonStyles.ts` definidos previamente.
        *   **Prioridad:** Media.

4.  **Expansión del Contexto de Tema Global (Día 11-13):**
    *   **Objetivo:** Proporcionar acceso global a los tokens de diseño y facilitar la gestión de temas (claro/oscuro).
    *   **Acciones:**
        *   Revisar y expandir el `UserContext.tsx` o crear un nuevo `ThemeProvider` si es necesario.
        *   Asegurar que los componentes puedan acceder a los tokens de diseño (colores, espaciado, tipografía) a través de un hook (ej. `useTheme`).
        *   **Prioridad:** Media.

#### Fase 3: Refactorización y Optimización (Prioridad Baja a Media)

5.  **Refactorización Progresiva de Componentes Existentes (Día 14 en adelante):**
    *   **Objetivo:** Reemplazar gradualmente las implementaciones de estilo repetidas con los nuevos componentes y estilos centralizados.
    *   **Acciones:**
        *   Priorizar la refactorización de las pantallas más complejas o con más `dynamicStyles` (ej. `create-request.tsx`).
        *   Eliminar `dynamicStyles` dentro de los componentes siempre que sea posible, moviendo la lógica de estilo a los componentes de UI reutilizables o a funciones de estilo externas.
        *   **Prioridad:** Baja a Media (se puede hacer de forma continua).

6.  **Optimización de `dynamicStyles` (Continuo):**
    *   **Objetivo:** Minimizar los re-renders innecesarios causados por la re-creación de estilos dinámicos.
    *   **Acciones:**
        *   Para los estilos que *realmente* necesitan ser dinámicos, considerar el uso de `useMemo` o mover la lógica de creación de estilos a funciones fuera del componente que acepten props.
        *   **Prioridad:** Media (se aborda durante la refactorización progresiva).

#### Consideraciones Generales:

*   **Pruebas:** Asegurar que cada paso de refactorización esté acompañado de pruebas para evitar regresiones.
*   **Documentación:** Mantener el archivo `design_system_plan.md` actualizado y documentar los nuevos componentes y tokens de diseño.
*   **Colaboración:** Si hay un equipo, asegurar la comunicación y el acuerdo sobre los nuevos estándares de diseño y desarrollo.