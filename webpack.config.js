import { WebpackStack } from '@premierstacks/webpack-stack';

// eslint-disable-next-line no-restricted-exports
export default function (env, argv) {
  let stack = WebpackStack.create(env, argv)
    .base()
    .browserslist()
    .entry({
      index: ['./src/index.ts'],
    })
    .environment()
    .environment({
      OTLP_API_KEY: env.OTLP_API_KEY ?? argv.otlpApiKey ?? process.env.OTLP_API_KEY ?? null,
    })
    .define()
    .html({
      template: './src/index.html',
      filename: 'index.html',
    })
    .copy();

  if (stack.isProduction) {
    stack = stack.gzip().brotli().pwa();
  }

  return stack.build();
}
