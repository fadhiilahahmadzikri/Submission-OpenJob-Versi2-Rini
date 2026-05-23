exports.up = (pgm) => {
  pgm.createTable('companies', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },

    name: {
      type: 'TEXT',
      notNull: true,
      unique: true,
    },

    description: {
      type: 'TEXT',
    },

    created_at: {
      type: 'TIMESTAMP',
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('companies');
};