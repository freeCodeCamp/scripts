import dotenv from 'dotenv';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import GhostAdminAPI from '@tryghost/admin-api';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ALLOWED_ROLES = ['Author', 'Contributor', 'Administrator', 'Editor'];

const keys = {
  user: {
    role: process.env.NEWS_API_USER_ROLE || null
  },
  api: {
    url: process.env.NEWS_API_URL,
    key: process.env.NEWS_API_ADMIN_KEY,
    version: process.env.NEWS_API_VERSION || 'v3.42'
  }
};

let api;
try {
  api = new GhostAdminAPI({
    ...keys.api
  });
} catch (error) {
  console.error('Error initializing Ghost Admin API:', error.message);
  console.error(
    'Please check your .env file and ensure NEWS_API_URL and NEWS_API_ADMIN_KEY are correctly set.'
  );
  process.exit(1);
}

const createUsersDump = async (users, format) => {
  const fileName = `${keys.user.role || 'all_users'}_${
    new Date().toISOString().split('T')[0]
  }.${format}`;
  const filePath = path.resolve(__dirname, fileName);

  let data;
  if (format === 'json') {
    data = JSON.stringify(users, null, 2);
  } else if (format === 'csv') {
    const header = Object.keys(users[0]).join(',') + '\n';
    const rows = users
      .map((user) =>
        Object.values(user)
          .map((value) => `"${value}"`)
          .join(',')
      )
      .join('\n');
    data = header + rows;
  } else {
    throw new Error('Unsupported format');
  }

  await fs.writeFile(filePath, data);
  console.log(`File created: ${fileName}`);
};

const filterAndMapUsers = (users, role) => {
  return users
    .filter(
      (user) => !role || user.roles.some((userRole) => userRole.name === role)
    )
    .map(
      ({ email, name, slug, facebook = '', twitter = '', website = '' }) => ({
        email,
        name,
        slug,
        facebook,
        twitter,
        website
      })
    );
};

const getUsers = async () => {
  try {
    const users = await api.users.browse({ include: 'roles', limit: 'all' });

    if (keys.user.role) {
      const filteredUsers = filterAndMapUsers(users, keys.user.role);
      await createUsersDump(filteredUsers, 'json');
      await createUsersDump(filteredUsers, 'csv');
    } else {
      for (const role of ALLOWED_ROLES) {
        const filteredUsers = filterAndMapUsers(users, role);
        if (filteredUsers.length > 0) {
          keys.user.role = role;
          await createUsersDump(filteredUsers, 'json');
          await createUsersDump(filteredUsers, 'csv');
        }
      }
    }
  } catch (err) {
    console.error('Error fetching users:', err.message);
    if (err.message.includes('Config Invalid')) {
      console.error(
        'Please check your Ghost Admin API configuration in the .env file.'
      );
    }
  }
};

getUsers();
