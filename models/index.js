const { Sequelize, DataTypes } = require("sequelize");
const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: "./database.sqlite",
});

const Author = require("./author")(sequelize, DataTypes);
const Book = require("./book")(sequelize, DataTypes);
const Genre = require("./genre")(sequelize, DataTypes);

Book.belongsTo(Author, { foreignKey: "authorId" });
Author.hasMany(Book, { foreignKey: "authorId" });

Book.belongsToMany(Genre, { through: "BookGenres" });
Genre.belongsToMany(Book, { through: "BookGenres" });

module.exports = { sequelize, Author, Book, Genre };
