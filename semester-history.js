// =========================================
// ROLLSYNC — SEMESTER HISTORY
// =========================================


// =========================================
// SUPABASE CONFIGURATION
// =========================================

const SUPABASE_URL =
    "https://lmeevakdwqhxflmvmbzc.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_Rs8nX3UjNllzWPOLMwJHOA_dW9X7y4T";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// =========================================
// DOM ELEMENTS
// =========================================

const semesterLoading =
    document.getElementById(
        "semesterLoading"
    );

const semesterHistoryGrid =
    document.getElementById(
        "semesterHistoryGrid"
    );

const semesterEmpty =
    document.getElementById(
        "semesterEmpty"
    );

const semesterError =
    document.getElementById(
        "semesterError"
    );


// =========================================
// GLOBAL
// =========================================

let currentUser = null;

let profile = null;


// =========================================
// ESCAPE HTML
// =========================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


// =========================================
// FORMAT DATE
// =========================================

function formatDate(
    dateString
) {

    if (!dateString) {
        return "—";
    }


    const date =
        new Date(
            dateString
        );


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


// =========================================
// SHOW ERROR
// =========================================

function showError(message) {

    semesterError.textContent =
        message;

    semesterError.style.display =
        "block";
}


// =========================================
// LOAD USER
// =========================================

async function loadUser() {

    const {
        data: {
            user
        },
        error
    } =
        await supabaseClient.auth.getUser();


    if (
        error ||
        !user
    ) {

        window.location.href =
            "index.html";

        return false;
    }


    currentUser =
        user;


    return true;
}


// =========================================
// LOAD PROFILE
// =========================================

async function loadProfile() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("profiles")
            .select("*")
            .eq(
                "id",
                currentUser.id
            )
            .single();


    if (error) {

        console.error(
            "Profile error:",
            error
        );

        return false;
    }


    profile =
        data;


    return true;
}


// =========================================
// LOAD SEMESTERS
// =========================================

async function loadSemesters() {

    const {
        data: semesters,
        error
    } =
        await supabaseClient
            .from("semesters")
            .select("*")
            .eq(
                "user_id",
                currentUser.id
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Semester loading error:",
            error
        );

        showError(
            error.message ||
            "Could not load semester history."
        );

        return;
    }


    if (
        !semesters ||
        semesters.length === 0
    ) {

        semesterLoading.style.display =
            "none";

        semesterEmpty.style.display =
            "block";

        return;
    }


    // -----------------------------------------
    // LOAD ATTENDANCE FOR ALL SEMESTERS
    // -----------------------------------------

    const semesterIds =
        semesters.map(
            semester =>
                semester.id
        );


    const {
        data: records,
        error:
            recordsError
    } =
        await supabaseClient
            .from("attendance_records")
            .select(
                "id, semester_id, classes_conducted, classes_attended, attendance_date"
            )
            .eq(
                "user_id",
                currentUser.id
            )
            .in(
                "semester_id",
                semesterIds
            );


    if (recordsError) {

        console.error(
            "Attendance history error:",
            recordsError
        );

        showError(
            "Could not load attendance history."
        );

        return;
    }


    // -----------------------------------------
    // CREATE RECORD MAP
    // -----------------------------------------

    const recordsBySemester =
        {};


    (records || []).forEach(
        function(record) {

            if (
                !recordsBySemester[
                    record.semester_id
                ]
            ) {

                recordsBySemester[
                    record.semester_id
                ] = [];

            }


            recordsBySemester[
                record.semester_id
            ].push(
                record
            );

        }
    );


    // -----------------------------------------
    // RENDER
    // -----------------------------------------

    renderSemesters(
        semesters,
        recordsBySemester
    );
}


// =========================================
// CALCULATE SEMESTER TOTALS
// =========================================

function calculateSemesterTotals(
    semester,
    records
) {

    const startingTotal =
        Number(
            semester.starting_total_classes
        ) || 0;


    const startingAttended =
        Number(
            semester.starting_attended_classes
        ) || 0;


    let dailyTotal = 0;

    let dailyAttended = 0;


    records.forEach(
        function(record) {

            dailyTotal +=
                Number(
                    record.classes_conducted
                ) || 0;


            dailyAttended +=
                Number(
                    record.classes_attended
                ) || 0;

        }
    );


    const total =
        startingTotal +
        dailyTotal;


    const attended =
        startingAttended +
        dailyAttended;


    const percentage =
        total > 0
            ? (
                attended /
                total
            ) * 100
            : 0;


    return {

        total:
            total,

        attended:
            attended,

        percentage:
            percentage,

        dailyRecords:
            records.length

    };
}


// =========================================
// RENDER SEMESTERS
// =========================================

function renderSemesters(
    semesters,
    recordsBySemester
) {

    semesterLoading.style.display =
        "none";


    semesterHistoryGrid.innerHTML =
        "";


    const target =
        Number(
            profile?.minimum_attendance
        ) || 75;


    semesters.forEach(
        function(semester) {

            const records =
                recordsBySemester[
                    semester.id
                ] || [];


            const stats =
                calculateSemesterTotals(
                    semester,
                    records
                );


            const isCurrent =
                semester.is_current === true;


            const statusClass =
                stats.percentage >= target
                    ? "good"
                    : "below";


            const statusText =
                stats.percentage >= target
                    ? "Target achieved"
                    : "Below target";


            const currentBadge =
                isCurrent
                    ? `
                        <div class="current-semester-badge">
                            Current semester
                        </div>
                    `
                    : "";


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                `semester-history-card ${
                    isCurrent
                        ? "current"
                        : ""
                }`;


            card.innerHTML = `

                <div class="semester-card-top">

                    <div>

                        <span class="semester-card-label">
                            ${
                                isCurrent
                                    ? "CURRENT SEMESTER"
                                    : "SEMESTER"
                            }
                        </span>

                        <h3 class="semester-card-title">
                            ${escapeHTML(
                                semester.semester
                            )}
                        </h3>

                        <div class="semester-card-year">
                            ${escapeHTML(
                                semester.academic_year
                            )}
                        </div>

                        ${currentBadge}

                    </div>


                    <div class="semester-card-percentage">
                        ${stats.percentage.toFixed(2)}%
                    </div>

                </div>


                <div class="semester-card-divider"></div>


                <div class="semester-card-stats">

                    <div class="semester-card-stat">

                        <span>
                            Attended
                        </span>

                        <strong>
                            ${stats.attended}
                        </strong>

                    </div>


                    <div class="semester-card-stat">

                        <span>
                            Total
                        </span>

                        <strong>
                            ${stats.total}
                        </strong>

                    </div>


                    <div class="semester-card-stat">

                        <span>
                            Daily records
                        </span>

                        <strong>
                            ${stats.dailyRecords}
                        </strong>

                    </div>

                </div>


                <div class="semester-card-footer">

                    <span
                        class="semester-card-status ${statusClass}"
                    >
                        ${statusText}
                    </span>


                    <span>
                        Created ${formatDate(
                            semester.created_at
                        )}
                    </span>

                </div>

            `;


            semesterHistoryGrid.appendChild(
                card
            );

        }
    );
}


// =========================================
// INITIALIZE
// =========================================

async function initialize() {

    const loggedIn =
        await loadUser();


    if (!loggedIn) {
        return;
    }


    const profileLoaded =
        await loadProfile();


    if (!profileLoaded) {

        showError(
            "Could not load your profile."
        );

        return;
    }


    await loadSemesters();
}


initialize();