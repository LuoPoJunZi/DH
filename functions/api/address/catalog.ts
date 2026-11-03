import { addressService } from '../../../addr/server/service';
import type { AddressContext } from '../../../addr/server/runtime';
export const onRequest = (context: AddressContext): Promise<Response> =>
  addressService.catalog(context);
