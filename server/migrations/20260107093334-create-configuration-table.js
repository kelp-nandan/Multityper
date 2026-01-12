'use strict'

module.exports={
    async up(queryInterface,Sequelize){
        await queryInterface.createTable('configurations',{
            id:{
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            key:{
                type: Sequelize.STRING(255),
                allowNull:false,
                unique: true,
            },
            value:{
                type: Sequelize.TEXT,
                allowNull: false,
            },
            description:{
                type: Sequelize.TEXT,
                allowNull: true,
            },
            created_at:{
                type: Sequelize.DATE,
                allowNull:false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updated_at:{
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
        });

        await queryInterface.bulkInsert('configurations',[
            {
                key: 'authStrategy',
                value: 'local',
                description: 'Authentication strategy: local (JWT) or azure (MSAL)',
                updated_at: new Date(),
                created_at: new Date(),
            },
            {
                key: 'allowUserRegistration',
                value: 'true',
                description: ' Allow new user registration for Azure AD users',
                created_at: new Date(),
                updated_at: new Date(),
            },
        ])
    },
    async down(queryInterface, Sequlize){
        await queryInterface.dropTable('configurations')
    }
}