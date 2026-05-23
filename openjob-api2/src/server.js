require('dotenv').config();

const express = require('express');

const userRoutes = require('./routes/users');
const authRoutes = require('./routes/authentications');
const profileRoutes = require('./routes/profile');
const companyRoutes = require('./routes/companies');
const categoryRoutes = require('./routes/categories');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const bookmarksRoutes = require('./routes/bookmarks');
const documentRoutes = require('./routes/documents');

const errorHandler = require('./middlewares/errorHandler');

const app = express();

/**
 * PARSE JSON
 */
app.use(express.json());

/**
 * STATIC FOLDER
 */
app.use('/uploads', express.static('uploads'));

/**
 * ROUTES
 */
app.use('/users', userRoutes);

app.use('/authentications', authRoutes);

app.use('/profile', profileRoutes);

app.use('/companies', companyRoutes);

app.use('/categories', categoryRoutes);

app.use('/jobs', jobRoutes);

app.use('/applications', applicationRoutes);

app.use('/', bookmarksRoutes);

app.use('/documents', documentRoutes);

/**
 * ROOT ENDPOINT
 */
app.get('/', (req, res) => {

  return res.status(200).json({
    status: 'success',
    message: 'OpenJob API Running',
  });
});

/**
 * GLOBAL ERROR HANDLER
 */
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});