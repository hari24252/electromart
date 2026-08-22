import { User } from '../../models/user.model.js';

export const addressRepository = {
  findUser: (id: string) => User.findById(id),
  save: <T extends { save: () => Promise<unknown> }>(user: T) => user.save(),
};
