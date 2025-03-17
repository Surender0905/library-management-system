module.exports = (sequelize, DataTypes) => {
    return sequelize.define("Genre", {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    });
};
