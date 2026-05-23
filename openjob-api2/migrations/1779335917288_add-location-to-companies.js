exports.up = (pgm) => {
  pgm.addColumns('companies', {
    location: {
      type: 'TEXT',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('companies', ['location']);
};