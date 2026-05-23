exports.up = (pgm) => {
  pgm.createTable('bookmarks', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },

    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users(id)',
      onDelete: 'cascade',
    },

    job_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'jobs(id)',
      onDelete: 'cascade',
    },

    created_at: {
      type: 'TIMESTAMP',
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.addConstraint(
    'bookmarks',
    'unique_user_job',
    'UNIQUE(user_id, job_id)',
  );
};

exports.down = (pgm) => {
  pgm.dropTable('bookmarks');
};