exports.up = (pgm) => {
  pgm.createTable('jobs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },

    title: {
      type: 'TEXT',
      notNull: true,
    },

    description: {
      type: 'TEXT',
    },

    company_id: {
      type: 'VARCHAR(50)',
      references: 'companies',
      onDelete: 'CASCADE',
    },

    category_id: {
      type: 'VARCHAR(50)',
      references: 'categories',
      onDelete: 'CASCADE',
    },

    created_at: {
      type: 'TIMESTAMP',
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('jobs');
};