exports.up = (pgm) => {
  pgm.createTable('applications', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },

    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'users',
      onDelete: 'CASCADE',
    },

    job_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: 'jobs',
      onDelete: 'CASCADE',
    },

    status: {
      type: 'TEXT',
      notNull: true,
      default: 'pending',
    },

    created_at: {
      type: 'TIMESTAMP',
      default: pgm.func('current_timestamp'),
    },
  });

  // ADD UNIQUE CONSTRAINT
  pgm.addConstraint(
    'applications',
    'unique_user_job_app',
    'UNIQUE(user_id, job_id)'
  );
};

exports.down = (pgm) => {
  pgm.dropTable('applications');
};