exports.up = (pgm) => {
  pgm.addColumn('documents', {
    user_id: {
      type: 'VARCHAR(50)',
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('documents', 'user_id');
};
