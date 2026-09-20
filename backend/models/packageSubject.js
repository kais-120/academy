const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PackageSubject = sequelize.define(
  'PackageSubject',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
          type: DataTypes.STRING,
          allowNull: false,
    },

    package_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'package_subjects',
    timestamps: true,
  }
);

module.exports = PackageSubject;