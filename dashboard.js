// =========================================
// ROLLSYNC — DASHBOARD
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
// GLOBAL VARIABLES
// =========================================

let currentUser = null;

let currentProfile = null;

let currentSemester = null;

let attendanceChart = null;


// =========================================
// DOM ELEMENTS
// =========================================

const navUserName =
    document.getElementById("navUserName");

const studentName =
    document.getElementById("studentName");

const studentInfo =
    document.getElementById("studentInfo");

const attendancePercentage =
    document.getElementById("attendancePercentage");

const attendanceStatus =
    document.getElementById("attendanceStatus");

const attendanceProgressBar =
    document.getElementById("attendanceProgressBar");

const minimumAttendance =
    document.getElementById("minimumAttendance");

const attendedClasses =
    document.getElementById("attendedClasses");

const totalClasses =
    document.getElementById("totalClasses");

const canMiss =
    document.getElementById("canMiss");

const neededClasses =
    document.getElementById("neededClasses");

const semesterName =
    document.getElementById("semesterName");

const academicYear =
    document.getElementById("academicYear");

const collegeName =
    document.getElementById("collegeName");

const branchName =
    document.getElementById("branchName");

const attendanceHistory =
    document.getElementById("attendanceHistory");

const emptyHistory =
    document.getElementById("emptyHistory");

const logoutBtn =
    document.getElementById("logoutBtn");

const addAttendanceBtn =
    document.getElementById("addAttendanceBtn");

const historyAddBtn =
    document.getElementById("historyAddBtn");

const emptyAddBtn =
    document.getElementById("emptyAddBtn");


// =========================================
// SAFE HTML
// =========================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =========================================
// FORMAT DATE
// =========================================

function formatDate(dateString) {

    if (!dateString) {
        return "—";
    }

    const date =
        new Date(
            dateString + "T00:00:00"
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
// GET CURRENT USER
// =========================================

async function getCurrentUser() {

    const {
        data: { user },
        error
    } =
        await supabaseClient.auth.getUser();


    if (error) {

        console.error(
            "User error:",
            error
        );

        window.location.href =
            "index.html";

        return null;
    }


    if (!user) {

        window.location.href =
            "index.html";

        return null;
    }


    currentUser = user;

    return user;
}


// =========================================
// LOAD PROFILE
// =========================================

async function loadProfile(userId) {

    const {
        data: profile,
        error
    } =
        await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();


    if (error) {

        console.error(
            "Profile error:",
            error
        );

        return null;
    }


    currentProfile = profile;

    return profile;
}


// =========================================
// LOAD CURRENT SEMESTER
// =========================================

async function loadCurrentSemester(userId) {

    const {
        data: semesters,
        error
    } =
        await supabaseClient
            .from("semesters")
            .select("*")
            .eq("user_id", userId)
            .eq("is_current", true)
            .limit(1);


    if (error) {

        console.error(
            "Current semester error:",
            error
        );

        return null;
    }


    if (
        !semesters ||
        semesters.length === 0
    ) {

        console.warn(
            "No current semester found."
        );

        return null;
    }


    currentSemester =
        semesters[0];

    return currentSemester;
}


// =========================================
// LOAD ATTENDANCE RECORDS
// =========================================

async function loadAttendanceRecords(
    userId,
    semesterId
) {

    const {
        data: records,
        error
    } =
        await supabaseClient
            .from("attendance_records")
            .select("*")
            .eq("user_id", userId)
            .eq("semester_id", semesterId)
            .order(
                "attendance_date",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Attendance records error:",
            error
        );

        return [];
    }


    return records || [];
}


// =========================================
// CALCULATE ATTENDANCE
// =========================================

function calculateAttendance(
    startingAttended,
    startingTotal,
    records
) {

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


    const currentTotal =
        startingTotal +
        dailyTotal;


    const currentAttended =
        startingAttended +
        dailyAttended;


    let percentage = 0;


    if (currentTotal > 0) {

        percentage =
            (
                currentAttended /
                currentTotal
            ) * 100;
    }


    return {

        currentTotal:
            currentTotal,

        currentAttended:
            currentAttended,

        dailyTotal:
            dailyTotal,

        dailyAttended:
            dailyAttended,

        percentage:
            percentage

    };
}


// =========================================
// CALCULATE ATTENDANCE INSIGHTS
// =========================================

function calculateAttendanceInsights(
    attended,
    total,
    target
) {

    const afterAttendElement =
        document.getElementById(
            "afterAttend"
        );

    const afterMissElement =
        document.getElementById(
            "afterMiss"
        );

    const targetNeededElement =
        document.getElementById(
            "targetNeeded"
        );

    const targetMissableElement =
        document.getElementById(
            "targetMissable"
        );

    const smartMessageElement =
        document.getElementById(
            "smartMessage"
        );


    if (
        !afterAttendElement ||
        !afterMissElement ||
        !targetNeededElement ||
        !targetMissableElement ||
        !smartMessageElement
    ) {

        console.error(
            "Attendance insight elements are missing."
        );

        return;
    }


    // -----------------------------------------
    // CURRENT %
    // -----------------------------------------

    const currentPercentage =
        total > 0
            ? (
                attended /
                total
            ) * 100
            : 0;


    // -----------------------------------------
    // ATTEND NEXT
    // -----------------------------------------

    const afterAttend =
        (
            (attended + 1) /
            (total + 1)
        ) * 100;


    afterAttendElement.textContent =
        afterAttend.toFixed(2) + "%";


    // -----------------------------------------
    // MISS NEXT
    // -----------------------------------------

    const afterMiss =
        total > 0
            ? (
                attended /
                (total + 1)
            ) * 100
            : 0;


    afterMissElement.textContent =
        afterMiss.toFixed(2) + "%";


    // -----------------------------------------
    // CLASSES NEEDED
    // -----------------------------------------

    let needed = 0;


    if (
        total > 0 &&
        currentPercentage < target &&
        target < 100
    ) {

        needed =
            Math.ceil(
                (
                    (
                        target / 100
                    ) * total -
                    attended
                )
                /
                (
                    1 -
                    target / 100
                )
            );


        needed =
            Math.max(
                0,
                needed
            );
    }


    targetNeededElement.textContent =
        needed;


    // -----------------------------------------
    // CLASSES CAN MISS
    // -----------------------------------------

    let missable = 0;


    if (
        total > 0 &&
        currentPercentage >= target &&
        target < 100
    ) {

        missable =
            Math.floor(
                (
                    attended /
                    (target / 100)
                ) -
                total
            );


        missable =
            Math.max(
                0,
                missable
            );
    }


    targetMissableElement.textContent =
        missable;


    // -----------------------------------------
    // SMART MESSAGE
    // -----------------------------------------

    if (total === 0) {

        smartMessageElement.textContent =
            "Start recording attendance to unlock smart insights.";

        return;
    }


    if (
        currentPercentage >= target
    ) {

        if (missable > 0) {

            smartMessageElement.textContent =
                `You're at ${currentPercentage.toFixed(2)}%. ` +
                `You can miss approximately ${missable} ` +
                `more class${missable === 1 ? "" : "es"} ` +
                `while staying at or above ${target}%.`;

        } else {

            smartMessageElement.textContent =
                `You're at ${currentPercentage.toFixed(2)}%. ` +
                `Keep attending classes to maintain your ${target}% target.`;
        }

    } else {

        const gap =
            target -
            currentPercentage;


        smartMessageElement.textContent =
            `You're ${gap.toFixed(2)} percentage points ` +
            `below your ${target}% target. ` +
            `Attend the next ${needed} consecutive ` +
            `class${needed === 1 ? "" : "es"} ` +
            `to reach your target.`;
    }
}


// =========================================
// UPDATE STATUS
// =========================================

function updateAttendanceStatus(
    percentage,
    target
) {

    if (!attendanceStatus) {
        return;
    }


    attendanceStatus.classList.remove(
        "status-good",
        "status-warning",
        "status-danger"
    );


    if (percentage === 0) {

        attendanceStatus.textContent =
            "No classes recorded";

        return;
    }


    if (
        percentage >= target
    ) {

        attendanceStatus.textContent =
            "Target achieved";

        attendanceStatus.classList.add(
            "status-good"
        );

    }

    else if (
        percentage >= target - 5
    ) {

        attendanceStatus.textContent =
            "Close to target";

        attendanceStatus.classList.add(
            "status-warning"
        );

    }

    else {

        attendanceStatus.textContent =
            "Below target";

        attendanceStatus.classList.add(
            "status-danger"
        );
    }
}


// =========================================
// UPDATE PROGRESS BAR
// =========================================

function updateProgressBar(
    percentage,
    target
) {

    if (!attendanceProgressBar) {
        return;
    }


    attendanceProgressBar.style.width =
        Math.min(
            Math.max(
                percentage,
                0
            ),
            100
        ) + "%";


    attendanceProgressBar.classList.remove(
        "progress-good",
        "progress-warning",
        "progress-danger"
    );


    if (
        percentage >= target
    ) {

        attendanceProgressBar.classList.add(
            "progress-good"
        );

    }

    else if (
        percentage >= target - 5
    ) {

        attendanceProgressBar.classList.add(
            "progress-warning"
        );

    }

    else {

        attendanceProgressBar.classList.add(
            "progress-danger"
        );
    }
}


// =========================================
// UPDATE DASHBOARD UI
// =========================================

function updateDashboardUI(
    profile,
    semester,
    attendance
) {

    const {

        currentTotal,
        currentAttended,
        percentage

    } = attendance;


    const target =
        Number(
            profile.minimum_attendance
        ) || 75;


    // -----------------------------------------
    // NAME
    // -----------------------------------------

    const name =
        profile.full_name ||
        currentUser.user_metadata?.full_name ||
        "Student";


    if (navUserName) {

        navUserName.textContent =
            name;
    }


    if (studentName) {

        studentName.textContent =
            name;
    }


    // -----------------------------------------
    // STUDENT INFO
    // -----------------------------------------

    if (studentInfo) {

        studentInfo.textContent =
            `${profile.branch || "Student"} • ${semester.semester || "Semester"}`;
    }


    // -----------------------------------------
    // ATTENDANCE %
    // -----------------------------------------

    if (attendancePercentage) {

        attendancePercentage.textContent =
            percentage.toFixed(2) + "%";
    }


    // -----------------------------------------
    // TARGET
    // -----------------------------------------

    if (minimumAttendance) {

        minimumAttendance.textContent =
            target + "%";
    }


    // -----------------------------------------
    // BASIC STATISTICS
    // -----------------------------------------

    if (attendedClasses) {

        attendedClasses.textContent =
            currentAttended;
    }


    if (totalClasses) {

        totalClasses.textContent =
            currentTotal;
    }


    // -----------------------------------------
    // NEEDED / CAN MISS
    // -----------------------------------------

    let needed = 0;

    let missable = 0;


    if (
        currentTotal > 0 &&
        percentage < target &&
        target < 100
    ) {

        needed =
            Math.ceil(
                (
                    (
                        target / 100
                    ) * currentTotal -
                    currentAttended
                )
                /
                (
                    1 -
                    target / 100
                )
            );
    }


    if (
        currentTotal > 0 &&
        percentage >= target &&
        target < 100
    ) {

        missable =
            Math.floor(
                (
                    currentAttended /
                    (target / 100)
                ) -
                currentTotal
            );
    }


    needed =
        Math.max(
            0,
            needed
        );


    missable =
        Math.max(
            0,
            missable
        );


    if (canMiss) {

        canMiss.textContent =
            missable;
    }


    if (neededClasses) {

        neededClasses.textContent =
            needed;
    }


    // -----------------------------------------
    // STATUS
    // -----------------------------------------

    updateAttendanceStatus(
        percentage,
        target
    );


    // -----------------------------------------
    // PROGRESS
    // -----------------------------------------

    updateProgressBar(
        percentage,
        target
    );


    // -----------------------------------------
    // SEMESTER INFORMATION
    // -----------------------------------------

    if (semesterName) {

        semesterName.textContent =
            semester.semester || "—";
    }


    if (academicYear) {

        academicYear.textContent =
            semester.academic_year || "—";
    }


    if (collegeName) {

        collegeName.textContent =
            profile.college || "—";
    }


    if (branchName) {

        branchName.textContent =
            profile.branch || "—";
    }


    // -----------------------------------------
    // INSIGHTS
    // -----------------------------------------

    calculateAttendanceInsights(
        currentAttended,
        currentTotal,
        target
    );
}


// =========================================
// RENDER ATTENDANCE HISTORY
// =========================================

function renderAttendanceHistory(
    records
) {

    if (!attendanceHistory) {
        return;
    }


    if (
        !records ||
        records.length === 0
    ) {

        attendanceHistory.innerHTML =
            "";


        if (emptyHistory) {

            emptyHistory.style.display =
                "block";
        }

        return;
    }


    if (emptyHistory) {

        emptyHistory.style.display =
            "none";
    }


    let html = `

        <div class="attendance-table">

            <div class="attendance-table-header">

                <span>
                    DATE
                </span>

                <span>
                    CLASSES
                </span>

                <span>
                    ATTENDED
                </span>

                <span>
                    DAILY %
                </span>

                <span>
                    ACTION
                </span>

            </div>

    `;


    records.forEach(
        function(record) {

            const conducted =
                Number(
                    record.classes_conducted
                ) || 0;


            const attended =
                Number(
                    record.classes_attended
                ) || 0;


            const dailyPercentage =
                conducted > 0
                    ? (
                        attended /
                        conducted
                    ) * 100
                    : 0;


            html += `

                <div
                    class="attendance-table-row"
                >

                    <span>
                        ${escapeHTML(
                            formatDate(
                                record.attendance_date
                            )
                        )}
                    </span>


                    <span>
                        ${conducted}
                    </span>


                    <span>
                        ${attended}
                    </span>


                    <span>
                        ${dailyPercentage.toFixed(2)}%
                    </span>


                    <span
                        class="attendance-actions"
                    >

                        <button
                            class="edit-attendance-btn"
                            data-id="${escapeHTML(record.id)}"
                        >
                            Edit
                        </button>


                        <button
                            class="delete-attendance-btn"
                            data-id="${escapeHTML(record.id)}"
                        >
                            Delete
                        </button>

                    </span>

                </div>

            `;

        }
    );


    html += `
        </div>
    `;


    attendanceHistory.innerHTML =
        html;


    // -----------------------------------------
    // EDIT BUTTONS
    // -----------------------------------------

    const editButtons =
        document.querySelectorAll(
            ".edit-attendance-btn"
        );


    editButtons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    const id =
                        button.dataset.id;


                    window.location.href =
                        `edit-attendance.html?id=${encodeURIComponent(id)}`;

                }
            );

        }
    );


    // -----------------------------------------
    // DELETE BUTTONS
    // -----------------------------------------

    const deleteButtons =
        document.querySelectorAll(
            ".delete-attendance-btn"
        );


    deleteButtons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                async function() {

                    const id =
                        button.dataset.id;


                    const confirmed =
                        confirm(
                            "Delete this attendance record?"
                        );


                    if (!confirmed) {
                        return;
                    }


                    button.disabled =
                        true;


                    button.textContent =
                        "Deleting...";


                    await deleteAttendance(
                        id
                    );

                }
            );

        }
    );
}


// =========================================
// DELETE ATTENDANCE
// =========================================

async function deleteAttendance(
    recordId
) {

    if (
        !currentUser ||
        !currentSemester
    ) {

        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("attendance_records")
            .delete()
            .eq(
                "id",
                recordId
            )
            .eq(
                "user_id",
                currentUser.id
            )
            .eq(
                "semester_id",
                currentSemester.id
            );


    if (error) {

        console.error(
            "Delete attendance error:",
            error
        );


        alert(
            "Could not delete this attendance record."
        );


        return;
    }


    await loadDashboard();
}


// =========================================
// ATTENDANCE TREND CHART
// =========================================

function renderAttendanceChart(
    records,
    startingAttended,
    startingTotal,
    target
) {

    const canvas =
        document.getElementById(
            "attendanceChart"
        );


    if (!canvas) {

        console.warn(
            "Attendance chart canvas not found."
        );

        return;
    }


    // -----------------------------------------
    // SORT OLD → NEW
    // -----------------------------------------

    const sortedRecords =
        [...records].sort(
            function(a, b) {

                return new Date(
                    a.attendance_date
                ) -
                new Date(
                    b.attendance_date
                );

            }
        );


    const labels = [];

    const attendanceData = [];


    // -----------------------------------------
    // STARTING POINT
    // -----------------------------------------

    if (
        startingTotal > 0
    ) {

        labels.push(
            "Starting"
        );


        attendanceData.push(
            Number(
                (
                    (
                        startingAttended /
                        startingTotal
                    ) * 100
                ).toFixed(2)
            )
        );
    }


    // -----------------------------------------
    // RUNNING ATTENDANCE
    // -----------------------------------------

    let runningTotal =
        startingTotal;

    let runningAttended =
        startingAttended;


    sortedRecords.forEach(
        function(record) {

            runningTotal +=
                Number(
                    record.classes_conducted
                ) || 0;


            runningAttended +=
                Number(
                    record.classes_attended
                ) || 0;


            const percentage =
                runningTotal > 0
                    ? (
                        runningAttended /
                        runningTotal
                    ) * 100
                    : 0;


            const date =
                new Date(
                    record.attendance_date +
                    "T00:00:00"
                );


            const formattedDate =
                date.toLocaleDateString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short"
                    }
                );


            labels.push(
                formattedDate
            );


            attendanceData.push(
                Number(
                    percentage.toFixed(2)
                )
            );

        }
    );


    // -----------------------------------------
    // TARGET DATA
    // -----------------------------------------

    const targetData =
        labels.map(
            function() {

                return target;

            }
        );


    // -----------------------------------------
    // DESTROY OLD CHART
    // -----------------------------------------

    if (attendanceChart) {

        attendanceChart.destroy();

        attendanceChart = null;
    }


    // -----------------------------------------
    // CREATE CHART
    // -----------------------------------------

    attendanceChart =
        new Chart(
            canvas,
            {

                type: "line",


                data: {

                    labels:
                        labels,


                    datasets: [

                        {

                            label:
                                "Attendance %",

                            data:
                                attendanceData,

                            tension:
                                0.3,

                            borderWidth:
                                3,

                            pointRadius:
                                4,

                            pointHoverRadius:
                                6,

                            fill:
                                false

                        },


                        {

                            label:
                                `Target (${target}%)`,

                            data:
                                targetData,

                            borderWidth:
                                2,

                            borderDash:
                                [
                                    6,
                                    6
                                ],

                            pointRadius:
                                0,

                            fill:
                                false

                        }

                    ]

                },


                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,


                    interaction: {

                        mode:
                            "index",

                        intersect:
                            false

                    },


                    scales: {

                        y: {

                            min:
                                0,

                            max:
                                100,


                            ticks: {

                                callback:
                                    function(value) {

                                        return (
                                            value +
                                            "%"
                                        );

                                    }

                            }

                        }

                    },


                    plugins: {

                        legend: {

                            display:
                                true

                        },


                        tooltip: {

                            callbacks: {

                                label:
                                    function(context) {

                                        return (
                                            context.dataset.label +
                                            ": " +
                                            context.parsed.y +
                                            "%"
                                        );

                                    }

                            }

                        }

                    }

                }

            }
        );
}


// =========================================
// SHOW DASHBOARD ERROR
// =========================================

function showDashboardError(
    message
) {

    console.error(
        message
    );


    if (attendanceHistory) {

        attendanceHistory.innerHTML = `

            <div class="empty-history">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h3>
                    Something went wrong
                </h3>

                <p>
                    ${escapeHTML(message)}
                </p>

            </div>

        `;
    }
}


// =========================================
// LOAD DASHBOARD
// =========================================

async function loadDashboard() {

    console.log(
        "Loading RollSync dashboard..."
    );


    // -----------------------------------------
    // GET USER
    // -----------------------------------------

    const user =
        await getCurrentUser();


    if (!user) {
        return;
    }


    // -----------------------------------------
    // GET PROFILE
    // -----------------------------------------

    const profile =
        await loadProfile(
            user.id
        );


    if (!profile) {

        showDashboardError(
            "Your profile could not be loaded."
        );

        return;
    }


    // -----------------------------------------
    // GET CURRENT SEMESTER
    // -----------------------------------------

    const semester =
        await loadCurrentSemester(
            user.id
        );


    if (!semester) {

        alert(
            "No current semester found. Please create a semester first."
        );


        window.location.href =
            "semester.html";


        return;
    }


    // -----------------------------------------
    // GET ATTENDANCE
    // -----------------------------------------

    const records =
        await loadAttendanceRecords(
            user.id,
            semester.id
        );


    // -----------------------------------------
    // STARTING TOTALS
    // -----------------------------------------

    const startingTotal =
        Number(
            semester.starting_total_classes
        ) || 0;


    const startingAttended =
        Number(
            semester.starting_attended_classes
        ) || 0;


    // -----------------------------------------
    // CALCULATE CURRENT TOTALS
    // -----------------------------------------

    const attendance =
        calculateAttendance(
            startingAttended,
            startingTotal,
            records
        );


    // -----------------------------------------
    // UPDATE DASHBOARD
    // -----------------------------------------

    updateDashboardUI(
        profile,
        semester,
        attendance
    );


    // -----------------------------------------
    // HISTORY
    // -----------------------------------------

    renderAttendanceHistory(
        records
    );


    // -----------------------------------------
    // CHART
    // -----------------------------------------

    const target =
        Number(
            profile.minimum_attendance
        ) || 75;


    renderAttendanceChart(
        records,
        startingAttended,
        startingTotal,
        target
    );


    // -----------------------------------------
    // LOG
    // -----------------------------------------

    console.log(
        "RollSync dashboard loaded successfully.",
        {

            semester:
                semester.semester,

            semesterId:
                semester.id,

            startingAttended:
                startingAttended,

            startingTotal:
                startingTotal,

            dailyAttended:
                attendance.dailyAttended,

            dailyTotal:
                attendance.dailyTotal,

            currentAttended:
                attendance.currentAttended,

            currentTotal:
                attendance.currentTotal,

            percentage:
                attendance.percentage,

            target:
                target

        }
    );
}


// =========================================
// ADD ATTENDANCE
// =========================================

function openAttendancePage() {

    window.location.href =
        "add-attendance.html";
}


if (addAttendanceBtn) {

    addAttendanceBtn.addEventListener(
        "click",
        openAttendancePage
    );
}


if (historyAddBtn) {

    historyAddBtn.addEventListener(
        "click",
        openAttendancePage
    );
}


if (emptyAddBtn) {

    emptyAddBtn.addEventListener(
        "click",
        openAttendancePage
    );
}


// =========================================
// LOGOUT
// =========================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async function() {

            const {
                error
            } =
                await supabaseClient.auth.signOut();


            if (error) {

                console.error(
                    "Logout error:",
                    error
                );


                alert(
                    "Could not log out. Please try again."
                );


                return;
            }


            window.location.href =
                "index.html";

        }
    );
}


// =========================================
// START
// =========================================

loadDashboard();