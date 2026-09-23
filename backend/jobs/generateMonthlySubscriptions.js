// jobs/generateMonthlySubscriptions.js
const cron = require("node-cron");
const Student = require("../models/Student");
const Subscription = require("../models/Subscription");
const JobLog = require("../models/JobLog");
const Price = require("../models/TuitionFee");
const SchoolBreak = require("../models/SchoolBreak");
const { Op } = require("sequelize");

const JOB_NAME = "generate_monthly_subscriptions";

function currentPeriod(date = new Date()) {
    // billing cycle is 1st -> 1st, so the period is just the current month
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed
    return `${year}-${String(month + 1).padStart(2, "0")}`;
}

function todayISO(date = new Date()) {
    return date.toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

// Is `date` inside any school_break row (summer or exceptional)?
async function isInBreak(date = new Date()) {
    const day = todayISO(date);

    const activeBreak = await SchoolBreak.findOne({
        where: {
            start_date: { [Op.lte]: day },
            end_date: { [Op.gte]: day },
        },
    });

    return activeBreak || null;
}

async function hasRunThisMonth(period = currentPeriod()) {
    const log = await JobLog.findOne({ where: { job_name: JOB_NAME, period } });
    return !!log;
}

// Price is just label -> amount, keyed by the student's class label.
function normalMonthPriceFromCache({ classe }, priceByClass) {
    const price = priceByClass.get(classe);
    if (!price) {
        throw new Error(`no Price row for class "${classe}"`);
    }

    return parseFloat(price.amount);
}

async function runMonthlySubscriptionJob() {
    const period = currentPeriod();

    const activeBreak = await isInBreak();
    if (activeBreak) {
        console.log(`[${JOB_NAME}] inside break "${activeBreak.label}" (${activeBreak.type}), skipping ${period}`);
        return;
    }

    // Claim the period FIRST, atomically, before touching any student data.
    try {
        await JobLog.create({ job_name: JOB_NAME, period });
    } catch (err) {
        if (err.name === "SequelizeUniqueConstraintError") {
            console.log(`[${JOB_NAME}] already ran (or running) for ${period}, skipping`);
            return;
        }
        throw err;
    }

    // Now safe — only one process can ever reach this point per period.
    const [students, allSubscriptions, prices] = await Promise.all([
        Student.findAll(),
        Subscription.findAll({ order: [["createdAt", "DESC"]] }),
        Price.findAll(),
    ]);

    const lastSubscriptionByStudent = new Map();
    for (const sub of allSubscriptions) {
        if (!lastSubscriptionByStudent.has(sub.student_id)) {
            lastSubscriptionByStudent.set(sub.student_id, sub);
        }
    }

    const priceByClass = new Map(prices.map(p => [p.label, p]));

    let created = 0;
    let skipped = 0;

    for (const student of students) {
        const lastSubscription = lastSubscriptionByStudent.get(student.id);

        if (!lastSubscription) {
            skipped++;
            continue;
        }

        // Offered students don't get a new subscription generated for them.
        if (lastSubscription.is_offer) {
            skipped++;
            continue;
        }

        let normalMonthPrice;
        try {
            normalMonthPrice = normalMonthPriceFromCache(
                { classe: student.class },
                priceByClass
            );
        } catch (err) {
            console.error(`[${JOB_NAME}] pricing failed for student ${student.id} (${student.class}):`, err.message);
            skipped++;
            continue;
        }

        await Subscription.create({
            amount: normalMonthPrice,
            status: "non payé",
            is_offer: false,
            student_id: student.id,
        });

        created++;
    }

    console.log(`[${JOB_NAME}] created ${created} subscriptions, skipped ${skipped} for ${period}`);
}

function startMonthlySubscriptionJob() {
    // run once on boot, in case a scheduled run was missed during downtime
    runMonthlySubscriptionJob().catch(err => {
        console.error(`[${JOB_NAME}] boot run failed:`, err);
    });

    // 1st of every month, 00:05 — matches the 1st->1st billing cycle
    cron.schedule("5 0 1 * *", () => {
        runMonthlySubscriptionJob().catch(err => {
            console.error(`[${JOB_NAME}] scheduled run failed:`, err);
        });
    });
}

module.exports = {
    runMonthlySubscriptionJob,
    startMonthlySubscriptionJob,
    hasRunThisMonth,
    currentPeriod,
    isInBreak,
    JOB_NAME
};