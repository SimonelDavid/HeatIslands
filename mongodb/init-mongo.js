db.createUser({
    user: "admin",
    pwd: "admin",
    roles: [
        { role: "readWrite", db: "climate_perception" }
    ]
});

db.users.insert({
    email: "test@example.com",
    password: "test"
});
