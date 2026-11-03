import { addressService } from '../../../server/address/service';
import type { AddressContext } from '../../../server/address/runtime';
export const onRequest = (context: AddressContext): Promise<Response> =>
  addressService.catalog(context);
