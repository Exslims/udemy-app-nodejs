db.createUser({
    user: 'mongo-user',
    pwd: 'mongo-password',
    roles: [
        {
            role: 'readWrite',
            db: 'udemy-db',
        },
    ],
});
