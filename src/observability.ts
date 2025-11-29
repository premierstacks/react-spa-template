import { metrics, trace, ValueType, type Gauge, type Histogram } from '@opentelemetry/api';
import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { CompositePropagator, W3CBaggagePropagator, W3CTraceContextPropagator } from '@opentelemetry/core';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { browserDetector } from '@opentelemetry/opentelemetry-browser-detector';
import { defaultResource, detectResources, resourceFromAttributes } from '@opentelemetry/resources';
import { BatchLogRecordProcessor, LoggerProvider } from '@opentelemetry/sdk-logs';
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import {
  ATTR_ERROR_TYPE,
  ATTR_EXCEPTION_MESSAGE,
  ATTR_EXCEPTION_STACKTRACE,
  ATTR_EXCEPTION_TYPE,
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  ATTR_URL_FRAGMENT,
  ATTR_URL_FULL,
  ATTR_URL_PATH,
  ATTR_URL_QUERY,
  ATTR_USER_AGENT_ORIGINAL,
} from '@opentelemetry/semantic-conventions';
import { ATTR_DEPLOYMENT_ENVIRONMENT_NAME } from '@opentelemetry/semantic-conventions/incubating';
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';

const APP_NAME = process.env['APP_NAME'] ?? '';
const APP_VERSION = process.env['APP_VERSION'] ?? '';
const WEBPACK_MODE = process.env['WEBPACK_MODE'] ?? '';
const OTLP_API_KEY = process.env['OTLP_API_KEY'] ?? '';

if (APP_NAME === '') {
  throw new Error('APP_NAME');
}

if (APP_VERSION === '') {
  throw new Error('APP_VERSION');
}

if (WEBPACK_MODE === '') {
  throw new Error('WEBPACK_MODE');
}

const resource = defaultResource()
  .merge(
    resourceFromAttributes({
      [ATTR_SERVICE_NAME]: APP_NAME,
      [ATTR_SERVICE_VERSION]: APP_VERSION,
      [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: WEBPACK_MODE,
      [ATTR_USER_AGENT_ORIGINAL]: navigator.userAgent,
    }),
  )
  .merge(detectResources({ detectors: [browserDetector] }));

const headers
  = OTLP_API_KEY !== ''
    ? {
        Authorization: `Bearer ${OTLP_API_KEY}`,
      }
    : undefined;

const tracerProvider = new WebTracerProvider({
  resource: resource,
  spanProcessors: [
    new BatchSpanProcessor(
      new OTLPTraceExporter({
        url: location.origin + '/otlp/v1/traces',
        headers: headers,
      }),
    ),
  ],
});

tracerProvider.register({
  propagator: new CompositePropagator({
    propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()],
  }),
});

trace.setGlobalTracerProvider(tracerProvider);

const meterProvider = new MeterProvider({
  resource: resource,
  readers: [
    new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: location.origin + '/otlp/v1/metrics',
        headers: headers,
      }),
    }),
  ],
});

metrics.setGlobalMeterProvider(meterProvider);

const loggerProvider = new LoggerProvider({
  resource: resource,
  processors: [
    new BatchLogRecordProcessor(
      new OTLPLogExporter({
        url: location.origin + '/otlp/v1/logs',
        headers: headers,
      }),
    ),
  ],
});

logs.setGlobalLoggerProvider(loggerProvider);

registerInstrumentations({
  tracerProvider: tracerProvider,
  meterProvider: meterProvider,
  loggerProvider: loggerProvider,
  instrumentations: [getWebAutoInstrumentations()],
});

const meter = metrics.getMeter('web-vitals');

const lcpRecorder = meter.createHistogram('web_vitals.lcp', {
  description: 'Largest Contentful Paint',
  unit: 'ms',
  valueType: ValueType.DOUBLE,
});

const clsRecorder = meter.createGauge('web_vitals.cls', {
  description: 'Cumulative Layout Shift',
  unit: 'score',
  valueType: ValueType.DOUBLE,
});

const ttfbRecorder = meter.createHistogram('web_vitals.ttfb', {
  description: 'Time to First Byte',
  unit: 'ms',
  valueType: ValueType.DOUBLE,
});

const fcpRecorder = meter.createHistogram('web_vitals.fcp', {
  description: 'First Contentful Paint',
  unit: 'ms',
  valueType: ValueType.DOUBLE,
});

const inpRecorder = meter.createHistogram('web_vitals.inp', {
  description: 'Input Performance',
  unit: 'ms',
  valueType: ValueType.DOUBLE,
});

function recordWebVital(recorder: Histogram | Gauge, metric: Metric) {
  recorder.record(metric.value, {
    id: metric.id,
    delta: metric.delta,
    rating: metric.rating,
    navigation: metric.navigationType,
  });
}

onLCP((metric) => {
  recordWebVital(lcpRecorder, metric);
});

onCLS((metric) => {
  recordWebVital(clsRecorder, metric);
});

onTTFB((metric) => {
  recordWebVital(ttfbRecorder, metric);
});

onFCP((metric) => {
  recordWebVital(fcpRecorder, metric);
});

onINP((metric) => {
  recordWebVital(inpRecorder, metric);
});

const logger = logs.getLogger('logs');

window.addEventListener('error', (event: ErrorEvent) => {
  console.error(event);

  let message: string | undefined = undefined;

  if (event.error instanceof Error) {
    message = event.error.message;
  } else if (event.error instanceof String || typeof event.error === 'string') {
    message = event.error.toString();
  }

  logger.emit({
    attributes: {
      [ATTR_ERROR_TYPE]: '500',
      [ATTR_EXCEPTION_TYPE]: event.error instanceof Error ? event.error.name : undefined,
      [ATTR_EXCEPTION_MESSAGE]: message,
      [ATTR_EXCEPTION_STACKTRACE]: event.error instanceof Error ? event.error.stack : undefined,
      [ATTR_URL_FULL]: location.href,
      [ATTR_URL_PATH]: location.pathname,
      [ATTR_URL_QUERY]: location.search,
      [ATTR_URL_FRAGMENT]: location.hash,
    },
    severityNumber: SeverityNumber.ERROR,
    severityText: 'ERROR',
    body: event.message,
  });
});
