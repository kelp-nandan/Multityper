'use-strict'

module.exports={
    async up(queryInterface, Sequelize){
        await queryInterface.addColumn('users','azure_oid',{
            type: Sequelize.STRING(255),
            allowNull:true,
        });

        await queryInterface.addColumn('users','azure_tenant_id',{
            type: Sequelize.STRING(255),
            allowNull:true,
        });

        //password nullable for azure users
        await queryInterface.changeColumn('users','password',{
            type: Sequelize.STRING(255),
            allowNull:true,
        });
    },

    async down(queryInterface,Sequelize){
        await queryInterface.removeColumn('users','azure_oid');
        await queryInterface.removeColumn('users','azure_tenant_id');

        //password revert to not nullable
        await queryInterface.changeColumn('users','password',{
            type: Sequelize.STRING(255),
            allowNull: false,
        });
    },
};