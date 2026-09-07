const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Student = require("./Student");

const Payment  = sequelize.define("payments",{
    id:{
        type:DataTypes.BIGINT,
        primaryKey:true,
        autoIncrement:true
    },
    amount:{
        type:DataTypes.DOUBLE,
    },
    status:{
        type:DataTypes.ENUM("payé","non payé"),
    },
    date:{
        type:DataTypes.DATE,
    },
    justification:{
        type:DataTypes.BOOLEAN,
    },
    student_id:{
        type:DataTypes.BIGINT,
        references:{
            model:Student,
            key:"id"
        }
    },
    
})
module.exports = Payment
