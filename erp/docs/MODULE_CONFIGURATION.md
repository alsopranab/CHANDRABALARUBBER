# Module configuration

The initial UI navigation is configured in `config/modules.ts`. Each module includes:
- id
- label
- description
- enabled
- group
- icon

To temporarily hide a module from the navigation, set `enabled: false`. The dashboard uses this configuration for its navigation and module cards.

This is a development-time configuration. A future admin Settings module will persist configuration in the database and apply permissions. Module visibility must not be treated as security or authorization; access controls must be enforced server-side.
