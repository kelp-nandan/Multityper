'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if columns exist before adding them
    const tableDescription = await queryInterface.describeTable('users');
    
    if (!tableDescription.wins) {
      await queryInterface.addColumn('users', 'wins', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }

    if (!tableDescription.gamesPlayed) {
      await queryInterface.addColumn('users', 'gamesPlayed', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }

    if (!tableDescription.bestWpm) {
      await queryInterface.addColumn('users', 'bestWpm', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove columns in reverse order
    await queryInterface.removeColumn('users', 'bestWpm');
    await queryInterface.removeColumn('users', 'gamesPlayed');
    await queryInterface.removeColumn('users', 'wins');
  }
};