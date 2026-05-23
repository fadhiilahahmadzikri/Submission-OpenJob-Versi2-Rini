exports.up = (pgm) => {
  pgm.addColumn('companies', {
    owner_id: {
      type: 'VARCHAR(50)',
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('companies', 'owner_id');
};