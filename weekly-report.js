/* =========================================================
   ROLLSYNC — WEEKLY REPORT
   by Riishu

   Current Week:
   attendance_records (LIVE)

   Completed Weeks:
   weekly_reports (ARCHIVED)

   Semester Overall:
   semester starting totals + current week live records
   ========================================================= */

const SUPABASE_URL = "https://lmeevakdwqhxflmvmbzc.supabase.co";
const SUPABASE_KEY =
    "sb_publishable_Rs8nX3UjNllzWPOLMwJHOA_dW9X7y4T";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


/* =========================================================
   DOM HELPERS
   ========================================================= */

function $(id) {
    return document.getElementById(id);
}


/* =========================================================
   DATE HELPERS
   ========================================================= */

function formatDateForDB(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function parseLocalDate(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);

    return new Date(
        year,
        month - 1,
        day
    );
}


function getCurrentWeekStart() {
    const today = new Date();

    const day = today.getDay();

    // Sunday = 0
    // Monday = 1

    const diff = day === 0 ? -6 : 1 - day;

    const monday = new Date(today);

    monday.setDate(today.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

    return monday;
}


function getNextWeekStart() {
    const monday = getCurrentWeekStart();

    const nextMonday = new Date(monday);

    nextMonday.setDate(monday.getDate() + 7);

    return nextMonday;
}


function getWeekEndFromStart(startDate) {
    const endDate = new Date(startDate);

    endDate.setDate(startDate.getDate() + 6);

    return endDate;
}


function formatShortDate(date) {
    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short"
    });
}


function formatLongDate(date) {
    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


function formatWeekRange(startString, endString) {
    const start = parseLocalDate(startString);
    const end = parseLocalDate(endString);

    return `${formatShortDate(start)} – ${formatShortDate(end)}`;
}


/* =========================================================
   NUMBER HELPERS
   ========================================================= */

function safeNumber(value) {
    const number = Number(value);

    return Number.isFinite(number) ? number : 0;
}


function calculatePercentage(attended, total) {
    attended = safeNumber(attended);
    total = safeNumber(total);

    if (total <= 0) {
        return 0;
    }

    return (attended / total) * 100;
}


function formatPercentage(value) {
    return `${safeNumber(value).toFixed(2)}%`;
}


/* =========================================================
   AUTH
   ========================================================= */

async function getCurrentUser() {
    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();

    if (error) {
        console.error("Unable to get current user:", error);
        return null;
    }

    return user;
}


/* =========================================================
   WEEKLY ROLLOVER
   ========================================================= */

async function runWeeklyAttendanceRollover(userId) {
    try {
        const weekStart = formatDateForDB(
            getCurrentWeekStart()
        );

        console.log("RollSync weekly rollover started.");

        const { data, error } =
            await supabaseClient.rpc(
                "rollup_attendance_weekly",
                {
                    p_user_id: userId,
                    p_cutoff_date: weekStart
                }
            );

        if (error) {
            console.error(
                "Weekly rollover failed:",
                error
            );

            return null;
        }

        console.log(
            "Weekly rollover completed.",
            data
        );

        return data;

    } catch (error) {
        console.error(
            "Weekly rollover exception:",
            error
        );

        return null;
    }
}


/* =========================================================
   PROFILE
   ========================================================= */

async function loadProfile(userId) {
    const { data, error } =
        await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle();

    if (error) {
        console.error(
            "Profile loading error:",
            error
        );

        return null;
    }

    return data;
}


/* =========================================================
   CURRENT SEMESTER
   ========================================================= */

async function loadCurrentSemester(userId) {
    let { data, error } =
        await supabaseClient
            .from("semesters")
            .select("*")
            .eq("user_id", userId)
            .eq("is_current", true)
            .order("created_at", {
                ascending: false
            })
            .limit(1)
            .maybeSingle();

    if (error) {
        console.error(
            "Current semester loading error:",
            error
        );

        return null;
    }

    return data;
}


/* =========================================================
   CURRENT WEEK — LIVE DATA
   ========================================================= */

async function loadCurrentWeekAttendance(
    userId,
    semesterId
) {
    const weekStart =
        formatDateForDB(
            getCurrentWeekStart()
        );

    const nextWeekStart =
        formatDateForDB(
            getNextWeekStart()
        );

    const {
        data,
        error
    } = await supabaseClient
        .from("attendance_records")
        .select(`
            id,
            attendance_date,
            classes_conducted,
            classes_attended
        `)
        .eq("user_id", userId)
        .eq("semester_id", semesterId)
        .gte("attendance_date", weekStart)
        .lt("attendance_date", nextWeekStart)
        .order("attendance_date", {
            ascending: true
        });

    if (error) {
        console.error(
            "Current week attendance loading error:",
            error
        );

        return [];
    }

    return data || [];
}


/* =========================================================
   COMPLETED WEEKS
   ========================================================= */

async function loadWeeklyReports(
    userId,
    semesterId
) {
    const {
        data,
        error
    } = await supabaseClient
        .from("weekly_reports")
        .select("*")
        .eq("user_id", userId)
        .eq("semester_id", semesterId)
        .order("week_start", {
            ascending: false
        });

    if (error) {
        console.error(
            "Weekly reports loading error:",
            error
        );

        return [];
    }

    return data || [];
}


/* =========================================================
   CURRENT WEEK CALCULATION
   ========================================================= */

function calculateCurrentWeekSummary(records) {
    let classes = 0;
    let attended = 0;

    records.forEach(record => {
        classes += safeNumber(
            record.classes_conducted
        );

        attended += safeNumber(
            record.classes_attended
        );
    });

    const missed = Math.max(
        classes - attended,
        0
    );

    const percentage =
        calculatePercentage(
            attended,
            classes
        );

    return {
        classes,
        attended,
        missed,
        percentage
    };
}


/* =========================================================
   OVERALL SEMESTER CALCULATION
   ========================================================= */

function calculateOverallAttendance(
    semester,
    currentWeek
) {
    const archivedTotal =
        safeNumber(
            semester?.starting_total_classes
        );

    const archivedAttended =
        safeNumber(
            semester?.starting_attended_classes
        );

    const liveTotal =
        safeNumber(
            currentWeek?.classes
        );

    const liveAttended =
        safeNumber(
            currentWeek?.attended
        );

    const total =
        archivedTotal + liveTotal;

    const attended =
        archivedAttended + liveAttended;

    const missed =
        Math.max(
            total - attended,
            0
        );

    const percentage =
        calculatePercentage(
            attended,
            total
        );

    return {
        total,
        attended,
        missed,
        percentage
    };
}


/* =========================================================
   TARGET STATUS
   ========================================================= */

function getTargetStatus(
    percentage,
    target
) {
    percentage = safeNumber(percentage);
    target = safeNumber(target);

    if (target <= 0) {
        return {
            text: "No target set",
            className: "neutral"
        };
    }

    if (percentage >= target) {
        return {
            text: `Above target by ${(percentage - target).toFixed(2)}%`,
            className: "good"
        };
    }

    return {
        text: `Below target by ${(target - percentage).toFixed(2)}%`,
        className: "warning"
    };
}


/* =========================================================
   UPDATE SEMESTER SUMMARY
   ========================================================= */

function updateSemesterSummary(
    semester,
    currentWeek,
    profile
) {
    const overall =
        calculateOverallAttendance(
            semester,
            currentWeek
        );

    const target =
        safeNumber(
            profile?.minimum_attendance ?? 75
        );

    if ($("semesterName")) {
        $("semesterName").textContent =
            semester?.semester
                ? `Semester ${semester.semester}`
                : "Current Semester";
    }

    if ($("overallPercentage")) {
        $("overallPercentage").textContent =
            formatPercentage(
                overall.percentage
            );
    }

    if ($("overallTotal")) {
        $("overallTotal").textContent =
            overall.total;
    }

    if ($("overallAttended")) {
        $("overallAttended").textContent =
            overall.attended;
    }

    if ($("overallMissed")) {
        $("overallMissed").textContent =
            overall.missed;
    }

    if ($("targetAttendance")) {
        $("targetAttendance").textContent =
            `${target}%`;
    }

    const status =
        getTargetStatus(
            overall.percentage,
            target
        );

    const statusElement =
        $("overallStatus");

    if (statusElement) {
        statusElement.textContent =
            status.text;

        statusElement.className =
            `attendance-status ${status.className}`;
    }
}


/* =========================================================
   CURRENT WEEK CARD
   ========================================================= */

function renderCurrentWeek(
    summary,
    profile
) {
    const container =
        $("currentWeekReport");

    if (!container) {
        console.warn(
            "currentWeekReport element not found."
        );

        return;
    }

    const weekStart =
        getCurrentWeekStart();

    const weekEnd =
        getWeekEndFromStart(
            weekStart
        );

    const target =
        safeNumber(
            profile?.minimum_attendance ?? 75
        );

    const status =
        getTargetStatus(
            summary.percentage,
            target
        );

    container.innerHTML = `
        <div class="weekly-report-card current-week-card">

            <div class="weekly-card-header">

                <div>
                    <span class="weekly-card-label">
                        CURRENT WEEK
                    </span>

                    <h3>
                        ${formatShortDate(weekStart)}
                        –
                        ${formatShortDate(weekEnd)}
                    </h3>
                </div>

                <span class="live-badge">
                    LIVE
                </span>

            </div>

            <div class="weekly-card-stats">

                <div class="weekly-stat">
                    <span class="weekly-stat-label">
                        Classes
                    </span>

                    <strong>
                        ${summary.classes}
                    </strong>
                </div>

                <div class="weekly-stat">
                    <span class="weekly-stat-label">
                        Attended
                    </span>

                    <strong>
                        ${summary.attended}
                    </strong>
                </div>

                <div class="weekly-stat">
                    <span class="weekly-stat-label">
                        Missed
                    </span>

                    <strong>
                        ${summary.missed}
                    </strong>
                </div>

                <div class="weekly-stat weekly-stat-highlight">
                    <span class="weekly-stat-label">
                        Attendance
                    </span>

                    <strong>
                        ${formatPercentage(
                            summary.percentage
                        )}
                    </strong>
                </div>

            </div>

            <div class="weekly-card-footer">

                <span class="weekly-status ${status.className}">
                    ${status.text}
                </span>

                <span class="weekly-live-note">
                    Updates from today's attendance
                </span>

            </div>

        </div>
    `;
}


/* =========================================================
   COMPLETED WEEKS
   ========================================================= */

function renderCompletedWeeks(
    reports,
    target
) {
    const container =
        $("weeklyReports");

    const emptyState =
        $("emptyReports");

    if (!container) {
        console.warn(
            "weeklyReports element not found."
        );

        return;
    }

    if (!reports || reports.length === 0) {
        container.innerHTML = "";

        if (emptyState) {
            emptyState.style.display =
                "block";
        }

        return;
    }

    if (emptyState) {
        emptyState.style.display =
            "none";
    }

    container.innerHTML =
        reports.map(
            (report, index) => {

                const classes =
                    safeNumber(
                        report.classes_conducted
                    );

                const attended =
                    safeNumber(
                        report.classes_attended
                    );

                const missed =
                    Math.max(
                        classes - attended,
                        0
                    );

                const percentage =
                    calculatePercentage(
                        attended,
                        classes
                    );

                const previous =
                    reports[index + 1];

                let comparison = "";

                if (previous) {
                    const previousPercentage =
                        calculatePercentage(
                            previous.classes_attended,
                            previous.classes_conducted
                        );

                    const difference =
                        percentage -
                        previousPercentage;

                    if (difference > 0) {
                        comparison = `
                            <span class="weekly-comparison positive">
                                ↑ ${difference.toFixed(2)}%
                                from previous week
                            </span>
                        `;
                    } else if (difference < 0) {
                        comparison = `
                            <span class="weekly-comparison negative">
                                ↓ ${Math.abs(
                                    difference
                                ).toFixed(2)}%
                                from previous week
                            </span>
                        `;
                    } else {
                        comparison = `
                            <span class="weekly-comparison neutral">
                                Same as previous week
                            </span>
                        `;
                    }
                }

                const status =
                    getTargetStatus(
                        percentage,
                        target
                    );

                return `
                    <div class="weekly-report-card">

                        <div class="weekly-card-header">

                            <div>
                                <span class="weekly-card-label">
                                    COMPLETED WEEK
                                </span>

                                <h3>
                                    ${formatWeekRange(
                                        report.week_start,
                                        report.week_end
                                    )}
                                </h3>
                            </div>

                            <span class="completed-badge">
                                COMPLETED
                            </span>

                        </div>

                        <div class="weekly-card-stats">

                            <div class="weekly-stat">
                                <span class="weekly-stat-label">
                                    Classes
                                </span>

                                <strong>
                                    ${classes}
                                </strong>
                            </div>

                            <div class="weekly-stat">
                                <span class="weekly-stat-label">
                                    Attended
                                </span>

                                <strong>
                                    ${attended}
                                </strong>
                            </div>

                            <div class="weekly-stat">
                                <span class="weekly-stat-label">
                                    Missed
                                </span>

                                <strong>
                                    ${missed}
                                </strong>
                            </div>

                            <div class="weekly-stat weekly-stat-highlight">
                                <span class="weekly-stat-label">
                                    Attendance
                                </span>

                                <strong>
                                    ${formatPercentage(
                                        percentage
                                    )}
                                </strong>
                            </div>

                        </div>

                        <div class="weekly-card-footer">

                            <span class="weekly-status ${status.className}">
                                ${status.text}
                            </span>

                            ${comparison}

                        </div>

                    </div>
                `;
            }
        ).join("");
}


/* =========================================================
   REPORT HEADER
   ========================================================= */

function updateReportHeader(
    semester,
    reports
) {
    if (!$("reportSubtitle")) {
        return;
    }

    const count =
        reports?.length || 0;

    if (semester?.semester) {
        $("reportSubtitle").textContent =
            `Semester ${semester.semester} · ${count} completed week${count === 1 ? "" : "s"}`;
    } else {
        $("reportSubtitle").textContent =
            `${count} completed week${count === 1 ? "" : "s"}`;
    }
}


/* =========================================================
   USER DISPLAY
   ========================================================= */

function updateUserDisplay(
    profile,
    user
) {
    const userName =
        $("userName");

    if (userName) {
        userName.textContent =
            profile?.full_name ||
            user?.email ||
            "Student";
    }
}


/* =========================================================
   LOGOUT
   ========================================================= */

async function logoutUser() {
    try {
        const {
            error
        } = await supabaseClient.auth.signOut();

        if (error) {
            console.error(
                "Logout error:",
                error
            );

            return;
        }

        window.location.href =
            "index.html";

    } catch (error) {
        console.error(
            "Logout exception:",
            error
        );
    }
}


/* =========================================================
   LOGOUT EVENT
   ========================================================= */

function setupLogout() {
    const logoutButton =
        $("logoutBtn");

    if (!logoutButton) {
        return;
    }

    logoutButton.addEventListener(
        "click",
        async event => {
            event.preventDefault();

            await logoutUser();
        }
    );
}


/* =========================================================
   MAIN PAGE LOADER
   ========================================================= */

async function loadWeeklyReportPage() {
    try {
        console.log(
            "RollSync weekly report loading..."
        );

        const user =
            await getCurrentUser();

        if (!user) {
            window.location.href =
                "index.html";

            return;
        }


        /* -------------------------------------------------
           STEP 1 — ROLLOVER
           ------------------------------------------------- */

        await runWeeklyAttendanceRollover(
            user.id
        );


        /* -------------------------------------------------
           STEP 2 — PROFILE
           ------------------------------------------------- */

        const profile =
            await loadProfile(
                user.id
            );


        /* -------------------------------------------------
           STEP 3 — CURRENT SEMESTER
           ------------------------------------------------- */

        const semester =
            await loadCurrentSemester(
                user.id
            );

        if (!semester) {
            console.warn(
                "No current semester found."
            );

            updateUserDisplay(
                profile,
                user
            );

            return;
        }


        /* -------------------------------------------------
           STEP 4 — CURRENT WEEK
           ------------------------------------------------- */

        const currentRecords =
            await loadCurrentWeekAttendance(
                user.id,
                semester.id
            );

        const currentWeek =
            calculateCurrentWeekSummary(
                currentRecords
            );


        /* -------------------------------------------------
           STEP 5 — COMPLETED WEEKS
           ------------------------------------------------- */

        const reports =
            await loadWeeklyReports(
                user.id,
                semester.id
            );


        /* -------------------------------------------------
           STEP 6 — SEMESTER SUMMARY
           ------------------------------------------------- */

        updateSemesterSummary(
            semester,
            currentWeek,
            profile
        );


        /* -------------------------------------------------
           STEP 7 — CURRENT WEEK UI
           ------------------------------------------------- */

        renderCurrentWeek(
            currentWeek,
            profile
        );


        /* -------------------------------------------------
           STEP 8 — COMPLETED WEEKS UI
           ------------------------------------------------- */

        renderCompletedWeeks(
            reports,
            safeNumber(
                profile?.minimum_attendance ?? 75
            )
        );


        /* -------------------------------------------------
           STEP 9 — HEADER
           ------------------------------------------------- */

        updateReportHeader(
            semester,
            reports
        );

        updateUserDisplay(
            profile,
            user
        );


        console.log(
            "RollSync weekly report loaded successfully."
        );

    } catch (error) {
        console.error(
            "Weekly report page error:",
            error
        );

        const container =
            $("weeklyReports");

        if (container) {
            container.innerHTML = `
                <div class="weekly-empty">
                    <h3>
                        Unable to load weekly report
                    </h3>

                    <p>
                        Please refresh the page and try again.
                    </p>
                </div>
            `;
        }
    }
}


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupLogout();

        loadWeeklyReportPage();

    }
);