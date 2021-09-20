db = db.getSiblingDB('property_pro');
db.createUser(
  {
    user: 'root',
    pwd: 'password',
    roles: [{ role: 'readWrite', db: 'property_pro' }],
  },
);
// db.createCollection('users');
// db.users.insert({
//     _id: "1",
//     first_name: "Jay",
//     last_name: "Mykels",
//     email: "jaymykels69@gmail.com",
//     phone: "08012345678"
// })