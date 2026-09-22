const { validationResult, body, query } = require("express-validator");
const Student = require("../models/Student");
const { Subscription, Package, StudentPackage, PackageSubject } = require("../models");
const Price = require("../models/TuitionFee");
const { Op, fn, col, where } = require("sequelize");
const ActivityLog = require("../models/ActivityLog");
const User = require("../models/Users");
const StudentSubject = require("../models/StudentSubject");
const getUser = async (req) => {
  const userId = req.userId;
  const user = await User.findByPk(userId);
  return user;
};

exports.createStudent = [
  body("name").trim().notEmpty().withMessage("Name is required."),

  body("last_name").trim().notEmpty().withMessage("Last name is required."),

  body("father_name").optional().trim(),

  body("mother_name").optional().trim(),

  body("father_phone")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\d{8}$/)
    .withMessage("Invalid father phone number."),

  body("mother_phone")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\d{8}$/)
    .withMessage("Invalid mother phone number."),
  body("level").trim().notEmpty().withMessage("Level is required."),

  body("materials")
    .notEmpty()
    .withMessage("materials is required.")
    .isArray({ min: 1 })
    .withMessage("materials must be a non-empty array."),

  async (req, res) => {
    try {
      const user = await getUser(req);

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const {
        name,
        last_name,
        father_name,
        mother_name,
        father_phone,
        mother_phone,
        level,
        stage,
        section,
        materials,
      } = req.body;

      const stageChoosing =
        stage === "ثانوي" && level === "باكالوريا" ? "باكالوريا" : stage;

      const price = await Price.findOne({ where: { label: stageChoosing } });

      if (!price) {
        return res.status(400).json({
          message: "That class does not exist.",
        });
      }

      const totalAmount = price.amount * materials.length;
      const student = await Student.create({
        name,
        last_name,
        father_name,
        mother_name,
        father_phone,
        mother_phone,
        level,
        section,
        stage,
      });
      await Subscription.create({
        amount: totalAmount,
        student_id: student.id,
      });

      for (const material of materials) {
        await StudentSubject.create({
          label: material,
          student_id: student.id,
        });
      }

      await ActivityLog.create({
        action: "create",
        entity_type: "student",
        entity_id: student.id,
        entity_name: `${student.name} ${student.last_name}`,
        description: `تمت إضافة التلميذ ${student.name} ${student.last_name}`,
        user_name: `${user.name} ${user.last_name}`,
        user_role: user.role,
        user_id: user.id,
      });

      return res.status(201).json({
        message: "Student added successfully.",
        student,
      });
    } catch (error) {
      console.error("Create student error:", error);

      return res.status(500).json({
        message: "Server error.",
      });
    }
  },
];

exports.getAllStudents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 8,
      search = "",
      level = "",
      gender = "",
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 8, 1);
    const offset = (pageNum - 1) * limitNum;

    const whereClause = { is_deleted: false };

    if (level) whereClause.class = level;
    if (gender) whereClause.gender = gender;

    const andConditions = [];

    if (search.trim()) {
      andConditions.push(
        where(
          fn(
            "concat",
            col("students.name"),
            " ",
            col("students.last_name"),
          ),
          { [Op.like]: `%${search.trim()}%` },
        ),
      );
    }

    if (andConditions.length) {
      whereClause[Op.and] = andConditions;
    }

    const { rows: students, count: total } = await Student.findAndCountAll({
      order: [["createdAt", "DESC"]],
      where: whereClause,
      include: [
        {
          model: Subscription,
          as: "subscription",
        },
        {
          model: StudentPackage,
          as: "studentPackage",
          attributes:["id","package_id"],
          include:[
            {
                model:Package,
                as:"packageStudentPackage",
                include:[
                    {
                        model:PackageSubject,
                        as:"packageSubject"
                    }
                ]
            }
          ]
        },
      ],
      limit: limitNum,
      offset,
      distinct: true, // required for correct count with include
    });

    return res.status(200).json({
      message: "Students retrieved successfully.",
      students,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Get students error:", error);

    return res.status(500).json({
      message: "Server error.",
    });
  }
};

exports.deleteStudents = async (req, res) => {
  try {
    const user = await getUser(req);
    const { id } = req.params;
    const student = await Student.findByPk(id);
    if (!student) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }
    student.update({ is_deleted: true });

    await ActivityLog.create({
      action: "delete",
      entity_type: "student",
      entity_id: student.id,
      entity_name: `${student.name} ${student.last_name}`,
      description: `تم حذف التلميذ ${student.name} ${student.last_name}`,
      user_name: `${user.name} ${user.last_name}`,
      user_role: user.role,
      user_id: user.id,
    });

    return res.status(200).json({
      message: "Student deleted.",
    });
  } catch (error) {
    console.error("Get students error:", error);

    return res.status(500).json({
      message: "Server error.",
    });
  }
};

exports.updateStudent = [
  body("name").trim().notEmpty().withMessage("Name is required."),

  body("last_name").trim().notEmpty().withMessage("Last name is required."),

  body("father_name").optional().trim(),

  body("mother_name").optional().trim(),

  body("father_phone")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\d{8}$/)
    .withMessage("Invalid father phone number."),

  body("mother_phone")
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\d{8}$/)
    .withMessage("Invalid mother phone number."),

  body("gender").isIn(["بنت", "ولد"]).withMessage("Gender must be M or F."),

  body("birthday")
    .notEmpty()
    .withMessage("Date of birth is required.")
    .isISO8601()
    .withMessage("Invalid date of birth."),

  body("classe").trim().notEmpty().withMessage("Class is required."),

  body("address").trim().notEmpty().withMessage("Address is required."),

  async (req, res) => {
    try {
      const user = await getUser(req);

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const {
        name,
        last_name,
        father_name,
        mother_name,
        father_phone,
        mother_phone,
        address,
        classe,
        gender,
        birthday,
        unique_id,
        transport,
        is_take_book,
        is_take_uniform,
      } = req.body;

      const { id } = req.params;

      // Find student
      const student = await Student.findByPk(id);

      if (!student) {
        return res.status(404).json({
          message: "Student not found.",
        });
      }

      if (unique_id) {
        const studentUnique = await Student.findOne({
          where: {
            unique_id,
            id: { [Op.ne]: id },
          },
        });

        if (studentUnique) {
          return res.status(400).json({
            message: "Unique ID already exists.",
          });
        }
      }

      // Check class price
      const price = await Price.findOne({
        where: {
          label: classe,
        },
      });

      if (!price) {
        return res.status(400).json({
          message: "That class does not exist.",
        });
      }

      // Convert values to boolean
      const toBool = (v) => v === true || v === "true";

      const transportBool = toBool(transport);
      const bookBool = toBool(is_take_book);
      const uniformBool = toBool(is_take_uniform);

      const totalPrice =
        (parseFloat(price.amount) +
          (bookBool ? 10 : 0) +
          (transportBool ? 10 : 0) +
          (uniformBool ? 10 : 0)) /
        2;

      await student.update({
        name,
        last_name,
        father_name,
        mother_name,
        father_phone,
        mother_phone,
        gender,
        birthday,
        unique_id,
        class: classe,
        address,
      });

      // Find existing subscription
      const subscription = await Subscription.findOne({
        where: {
          student_id: student.id,
        },
      });

      if (subscription) {
        // Update existing
        await subscription.update({
          amount: totalPrice,
          transport: transportBool,
          is_take_book: bookBool,
          is_take_uniform: uniformBool,
        });
      } else {
        // Create if student doesn't have one
        await Subscription.create({
          amount: totalPrice,
          student_id: student.id,
          transport: transportBool,
          is_take_book: bookBool,
          is_take_uniform: uniformBool,
        });
      }

      await ActivityLog.create({
        action: "update",
        entity_type: "student",
        entity_id: student.id,
        entity_name: `${student.name} ${student.last_name}`,
        description: `تم تعديل بيانات التلميذ ${student.name} ${student.last_name}`,
        user_name: `${user.name} ${user.last_name}`,
        user_role: user.role,
        user_id: user.id,
      });

      return res.status(200).json({
        message: "Student updated successfully.",
        student,
      });
    } catch (error) {
      console.error("Update student error:", error);

      return res.status(500).json({
        message: "Server error.",
      });
    }
  },
];

exports.reenrollStudent = [
  body("type").trim().notEmpty().withMessage("type is required."),

  async (req, res) => {
    try {
      const user = await getUser(req);

      const levels = [
        "التحضيري",
        "السنة الأولى",
        "السنة الثانية",
        "السنة الثالثة",
        "السنة الرابعة",
        "السنة الخامسة",
        "السنة السادسة",
      ];

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { type } = req.body;
      const { id } = req.params;

      const student = await Student.findByPk(id);

      if (!student) {
        return res.status(404).json({
          message: "Student not found.",
        });
      }

      // If successful, promote student to next class
      if (type === "ناجح") {
        const currentIndex = levels.indexOf(student.class);

        if (currentIndex === -1) {
          return res.status(400).json({
            message: `Invalid student class: ${student.class}`,
          });
        }
        if (currentIndex < levels.length - 1) {
          student.class = levels[currentIndex + 1];
        }
      }

      // Save changes
      await student.save();

      await ActivityLog.create({
        action: "update",
        entity_type: "student",
        entity_id: student.id,
        entity_name: `${student.name} ${student.last_name}`,
        description: `تم تسجيل نتيجة التلميذ ${student.name} ${student.last_name} كـ ${type}`,
        user_name: `${user.name} ${user.last_name}`,
        user_role: user.role,
        user_id: user.id,
      });

      return res.status(200).json({
        message: "Student registration result saved successfully.",
        student,
      });
    } catch (error) {
      console.error("Register student error:", error);

      return res.status(500).json({
        message: "Server error.",
      });
    }
  },
];

exports.createOfferStudent = [
  body("name").trim().notEmpty().withMessage("Name is required."),

  body("last_name").trim().notEmpty().withMessage("Last name is required."),

  body("phone").trim().notEmpty().withMessage("Phone number is required."),

  body("level").trim().notEmpty().withMessage("Level is required."),

  body("package_id").notEmpty().withMessage("materials is required."),

  async (req, res) => {
    try {
      const user = await getUser(req);

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { name, last_name, phone, level, stage, section, package_id } =
        req.body;

      const price = await Price.findOne({ where: { label: "باكالوريا" } });

      if (!price) {
        return res.status(400).json({
          message: "That class does not exist.",
        });
      }

      const package = await Package.findByPk(package_id);

      if (!package) {
        return res.status(400).json({
          message: "That package does not exist.",
        });
      }

      const student = await Student.create({
        name,
        last_name,
        phone,
        level,
        section,
        stage,
      });
      StudentPackage.create({ student_id: student.id, package_id: package_id });
      await Subscription.create({
        amount: package.amount,
        is_offer: true,
        student_id: student.id,
      });

      await ActivityLog.create({
        action: "create",
        entity_type: "student",
        entity_id: student.id,
        entity_name: `${student.name} ${student.last_name}`,
        description: `تمت إضافة التلميذ ${student.name} ${student.last_name}`,
        user_name: `${user.name} ${user.last_name}`,
        user_role: user.role,
        user_id: user.id,
      });

      return res.status(201).json({
        message: "Student added successfully.",
        student,
      });
    } catch (error) {
      console.error("Create student error:", error);

      return res.status(500).json({
        message: "Server error.",
      });
    }
  },
];
