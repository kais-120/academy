const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Teacher = require("./Teacher");
const Student = require("./Student");

const Subscription  = sequelize.define("subscriptions",{
    id:{
        type:DataTypes.BIGINT,
        primaryKey:true,
        autoIncrement:true
    },
    amount:{
        type:DataTypes.DOUBLE,
    },
    transport:{
        type:DataTypes.BOOLEAN
    },
    payment_type:{
        type:DataTypes.ENUM('يدفع شهريًا',
            'يدفع بالثلاثي',
            'يدفع سنويًا',
            'غير معني بالدفع'),
    },
    status:{
        type:DataTypes.ENUM("payé","en attente","non payé"),
        defaultValue:"payé"
    },
    is_take_book:{
        type:DataTypes.BOOLEAN
    },
    is_take_uniform:{
        type:DataTypes.BOOLEAN
    },
    student_id:{
        type:DataTypes.BIGINT,
        references:{
            model:Student,
            key:"id"
        }
    },
    
})
module.exports = Subscription