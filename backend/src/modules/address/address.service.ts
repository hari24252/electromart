import { notFound } from '../../utils/apiError.js';
import { ensureObjectId } from '../../utils/ids.js';
import { addressRepository } from './address.repository.js';

type AddressInput = Record<string, unknown>;

export const addressService = {
  async list(userId: string) { const user = await addressRepository.findUser(userId); if (!user) throw notFound('Account'); return user.addresses; },
  async add(userId: string, input: AddressInput) {
    const user = await addressRepository.findUser(userId);
    if (!user) throw notFound('Account');
    const makeDefault = input.isDefault === true || user.addresses.length === 0;
    if (makeDefault) user.addresses.forEach((address) => { address.isDefault = false; });
    user.addresses.push({ ...input, isDefault: makeDefault } as never);
    await addressRepository.save(user);
    return user.addresses[user.addresses.length - 1];
  },
  async update(userId: string, addressId: string, input: AddressInput) {
    const user = await addressRepository.findUser(userId);
    if (!user) throw notFound('Account');
    const id = ensureObjectId(addressId, 'address').toString();
    const address = (user.addresses as typeof user.addresses & { id: (value: string) => any }).id(id);
    if (!address) throw notFound('Address');
    if (input.isDefault === true) user.addresses.forEach((entry) => { entry.isDefault = false; });
    Object.assign(address, input);
    await addressRepository.save(user);
    return address;
  },
  async remove(userId: string, addressId: string) {
    const user = await addressRepository.findUser(userId);
    if (!user) throw notFound('Account');
    const id = ensureObjectId(addressId, 'address').toString();
    const address = (user.addresses as typeof user.addresses & { id: (value: string) => any }).id(id);
    if (!address) throw notFound('Address');
    const removedDefault = address.isDefault;
    address.deleteOne();
    if (removedDefault && user.addresses.length > 0) user.addresses[0]!.isDefault = true;
    await addressRepository.save(user);
  },
  async setDefault(userId: string, addressId: string) {
    const user = await addressRepository.findUser(userId);
    if (!user) throw notFound('Account');
    const id = ensureObjectId(addressId, 'address').toString();
    const address = (user.addresses as typeof user.addresses & { id: (value: string) => any }).id(id);
    if (!address) throw notFound('Address');
    user.addresses.forEach((entry) => { entry.isDefault = entry._id.toString() === id; });
    await addressRepository.save(user);
    return address;
  },
};
