exports.up = (pgm) => {
  pgm.addColumn('users', {
    resume: {
      type: 'TEXT',
      notNull: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('users', 'resume');
};