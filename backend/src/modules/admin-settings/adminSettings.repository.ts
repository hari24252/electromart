import { StoreSettings } from '../../models/storeSettings.model.js';

export const adminSettingsRepository = {
  find: () => StoreSettings.findOne({ key: 'default' }),
  save: (input: Record<string, unknown>) => StoreSettings.findOneAndUpdate(
    { key: 'default' },
    { $set: input, $setOnInsert: { key: 'default' } },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
  ),
};
