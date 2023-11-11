import { bootstrap } from './modules/bootstrap';
import { devConfig } from './modules/dev-config';

bootstrap(devConfig).catch((error) => {
  console.log(error);
  process.exit(1);
});
