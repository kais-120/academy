const ActivityLog = require("./ActivityLog");
const Package = require("./Package");
const PackageSubject = require("./packageSubject");
const Scoring = require("./Scoring");
const Student = require("./Student");
const Subject = require("./Subject");
const Subscription = require("./Subscription");
const Teacher = require("./Teacher");
const TeacherPayment = require("./TeacherPayment");
const User = require("./Users");

Teacher.hasMany(Subject,{
    foreignKey:"teacher_id",
    as:"subject"
})
Subject.belongsTo(Teacher,{
    foreignKey:"teacher_id",
    as:"teacher"
})

Teacher.hasMany(Subject,{
    foreignKey:"teacher_id",
    as:"scoring"
})
Scoring.belongsTo(Teacher,{
    foreignKey:"teacher_id",
    as:"scoringTeacher"
})

Student.hasOne(Subscription,{
    foreignKey:"student_id",
    as:"subscription"
})
Subscription.belongsTo(Student,{
    foreignKey:"student_id",
    as:"student"
})


Teacher.hasMany(TeacherPayment, {
    foreignKey: "teacher_id",
    as:"TeacherPayment"
});
TeacherPayment.belongsTo(Teacher, {
    foreignKey: "teacher_id",
    as: "paymentTeacher" 
});

User.hasMany(ActivityLog, {
    foreignKey: "user_id",
    as:"activityLog"
});
ActivityLog.belongsTo(User, {
    foreignKey: "user_id",
    as: "user" 
});

Package.hasMany(PackageSubject, {
    foreignKey: "package_id",
    as:"packageSubject"
});
PackageSubject.belongsTo(Package, {
    foreignKey: "package_id",
    as: "package" 
});
module.exports = {Teacher,Subject,Scoring,Student,Subscription,TeacherPayment,User,ActivityLog,Package,PackageSubject}