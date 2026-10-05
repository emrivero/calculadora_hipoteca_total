# Casa Clara · Calculadora hipotecaria

Aplicación estática en español con React, TypeScript y Vite. Calcula en el navegador la cuota hipotecaria y, sobre todo, cuánto del efectivo disponible se convierte realmente en entrada después de impuestos y gastos. Sin backend, cuentas, cookies, analítica, fuentes externas ni almacenamiento remoto.

## Desarrollo

Usa Node.js 24 LTS (24.15 o posterior) y npm. También se admite Node.js 26 o posterior. La versión mínima incluye los requisitos de las herramientas de prueba.

```sh
npm ci
npm run dev
```

Abre la dirección que muestre Vite (habitualmente `http://localhost:5173`).

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
```

`npm run build` comprueba TypeScript y genera `dist/`. `npm test` ejecuta las pruebas financieras y de interacción. `npm run test:watch` permite ejecutar pruebas durante el desarrollo.

## Funcionalidades

- Nueve parámetros editables y recálculo inmediato, sin botón de cálculo.
- Cuota francesa, hipoteca necesaria, financiación, esfuerzo y margen frente al 33 % de ingresos.
- Barra de distribución del efectivo y desglose completo, con IVA aplicado únicamente a honorarios.
- Avisos por esfuerzo superior al 33 %, financiación desde el 90 %, efectivo insuficiente e hipoteca superior al precio.
- Simulación automática a un TIN fijo del 4 % cuando la financiación llega al 90 %; si el TIN actual es mayor, se aclara que la referencia no supone una subida.
- Escenarios con nombre, tabla comparativa, carga para edición y eliminación. Son copias independientes en memoria: **se pierden al recargar o cerrar la página**. Restablecer el formulario no los elimina.
- Desglose del capital, intereses y total de cuotas durante el plazo.
- Diseño responsive, etiquetas accesibles, navegación por teclado y formato monetario español.

## Cálculos y supuestos

Las funciones puras están en `src/domain/mortgage.ts`; los tipos en `src/domain/types.ts` y la presentación numérica en `src/domain/formatters.ts`.

```text
honorariosBase = precio × comisión / 100
ivaHonorarios = honorariosBase × IVA / 100
honorariosTotales = honorariosBase + ivaHonorarios
ITP = precio × tipoITP / 100
gastosTotales = honorariosTotales + ITP + otrosGastos
entradaReal = efectivo − gastosTotales
hipoteca = max(0, precio − entradaReal)
financiación = hipoteca / precio × 100
capacidadPago = ingresosNetos × 0,33
esfuerzo = cuota / ingresosNetos × 100
margen = capacidadPago − cuota
```

La cuota usa amortización francesa con interés mensual `TIN / 100 / 12` y `años × 12` cuotas. Con TIN cero se divide el capital entre las cuotas. Se usan `log1p` y `expm1` para estabilidad numérica con tipos próximos a cero. No se redondean los cálculos intermedios. Las cifras principales se muestran en euros enteros y el desglose en céntimos; puede haber diferencias visuales de redondeo.

Los campos aceptan decimales con coma o punto, sin separadores de miles; el plazo se introduce en años enteros positivos. Se rechazan negativos, valores vacíos, no finitos y operaciones que desborden la precisión numérica. Precio y plazo deben ser mayores que cero. No se muestran resultados antiguos mientras el formulario sea inválido.

Con ingresos cero y una cuota positiva, el esfuerzo se muestra como «Sin ingresos» y aparece un aviso, evitando dividir por cero. Con efectivo insuficiente se conserva la entrada real negativa y la hipoteca teórica puede superar el precio. Con efectivo mayor que el coste total de la compra, la hipoteca y la cuota son cero, la entrada aplicada se limita al precio y se informa del sobrante.

El ITP se modela como un porcentaje del precio indicado, según la especificación; no se determinan automáticamente tipos, bonificaciones, bases imponibles ni el régimen fiscal de la vivienda. Los tipos son ejemplos editables. Se supone TIN constante durante todo el plazo; no se incluyen comisiones hipotecarias, seguros ni otros productos. El 33 % es la referencia de esta simulación y no considera otras deudas. La estimación no es una TAE ni una oferta bancaria.

### Escenario de referencia

Precio 255.000 €, efectivo 58.000 €, comisión 4 %, IVA de comisión 21 %, ITP 7 %, otros gastos 1.300 €, ingresos 4.600 €/mes, plazo 30 años y TIN 3 %:

| Resultado                 |     Importe |
| ------------------------- | ----------: |
| Honorarios con IVA        |    12.342 € |
| ITP                       |    17.850 € |
| Gastos totales            |    31.492 € |
| Entrada real              |    26.508 € |
| Hipoteca                  |   228.492 € |
| Financiación              |     89,60 % |
| Cuota mensual aproximada  |       963 € |
| Capacidad de pago al 33 % | 1.518 €/mes |

## GitHub Pages

1. Sube estos archivos y `package-lock.json` a un repositorio de GitHub en la rama `main`.
2. En **Settings → Pages → Build and deployment → Source**, selecciona **GitHub Actions**.
3. Ejecuta el workflow «Validate and deploy to GitHub Pages» o envía un cambio a `main`.

El workflow instala con `npm ci`, verifica TypeScript y lint, ejecuta tests, compila, sube `dist/` y lo publica. Las pull requests ejecutan las mismas comprobaciones sin publicar. La URL se muestra en el entorno `github-pages` del workflow.

Vite usa `base: './'`: los recursos se resuelven respecto a `index.html`, por lo que funciona tanto en `https://usuario.github.io/repositorio/` como en la raíz de un dominio. No hay rutas de cliente: la navegación utiliza anclas. El icono también respeta la base. Si necesitas una base absoluta, puedes usar:

```sh
VITE_BASE_PATH=/nombre-del-repositorio/ npm run build
```

Consulta la [guía oficial de Vite para GitHub Pages](https://vite.dev/guide/static-deploy.html#github-pages) y la [documentación de workflows de Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Estructura

```text
src/
  components/   Formulario, resumen, desglose, avisos, estrés y comparador
  domain/       Tipos, fórmulas puras, validación, formato y pruebas
  test/         Configuración de pruebas de interacción
  main.tsx      Punto de entrada
  styles.css    Estilos y adaptación a pantallas pequeñas
.github/workflows/deploy.yml
```

No se incluyen amortizaciones anticipadas ni préstamos personales: son ampliaciones futuras, fuera del alcance de esta versión.
