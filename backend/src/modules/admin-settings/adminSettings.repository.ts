import { StoreSettings } from '../../models/storeSettings.model.js';

export const adminSettingsRepository = {
  find: () => StoreSettings.findOne({ key: 'default' }),
  save: (input: Record<string, unknown>) => StoreSettings.findOneAndUpdate(
    { key: 'default' },
    { $set: input, $setOnInsert: { key: 'default' } },
    { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true, runValidators: true },
  ),
};
