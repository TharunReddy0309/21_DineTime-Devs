export const dataObjectSchema = {
  type: 'object',
  properties: {
    data: {
      type: 'object',
    },
  },
};

export const dataArraySchema = {
  type: 'object',
  properties: {
    data: {
      type: 'array',
      items: {
        type: 'object',
      },
    },
  },
};

export const deletedSchema = {
  type: 'object',
  properties: {
    data: {
      type: 'object',
      properties: {
        deleted: {
          type: 'boolean',
        },
      },
    },
  },
};
