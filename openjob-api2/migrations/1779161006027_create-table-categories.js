exports.up = (pgm) => {

  pgm.createTable('categories', {

    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },

    name: {
      type: 'TEXT',
      notNull: true,
      unique: true,
    },

    created_at: {
      type: 'TIMESTAMP',
      default: pgm.func('current_timestamp'),
    },

    updated_at: {
      type: 'TIMESTAMP',
      default: pgm.func('current_timestamp'),
    },

  });
};

exports.down = (pgm) => {
  pgm.dropTable('categories');
};