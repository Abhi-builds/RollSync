// =========================================
// ROLLSYNC — ADD ATTENDANCE
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

const attendanceForm =
    document.getElementById(
        "attendanceForm"
    );

const attendanceDate =
    document.getElementById(
        "attendanceDate"
    );

const classesConducted =
    document.getElementById(
        "classesConducted"
    );

const classesAttended =
    document.getElementById(
        "classesAttended"
    );

const dailyPercentage =
    document.getElementById(
        "dailyPercentage"
    );

const currentSemesterElement =
    document.getElementById(
        "currentSemester"
    );

const formError =
    document.getElementById(
        "formError"
    );

const saveAttendanceBtn =
    document.getElementById(
        "saveAttendanceBtn"
    );


// =========================================
// GLOBAL VARIABLES
// =========================================

let currentUser = null;

let currentSemester = null;


// =========================================
// TODAY'S DATE
// =========================================

function setTodayDate() {

    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        );


    attendanceDate.value =
        `${year}-${month}-${day}`;
}


// =========================================
// SHOW ERROR
// =========================================

function showError(message) {

    if (!formError) {
        return;
    }


    formError.textContent =
        message;


    formError.style.display =
        "block";
}


// =========================================
// CLEAR ERROR
// =========================================

function clearError() {

    if (!formError) {
        return;
    }


    formError.textContent =
        "";


    formError.style.display =
        "none";
}


// =========================================
// UPDATE DAILY PERCENTAGE
// =========================================

function updateDailyPercentage() {

    const conducted =
        Number(
            classesConducted.value
        ) || 0;


    const attended =
        Number(
            classesAttended.value
        ) || 0;


    if (
        conducted <= 0
    ) {

        dailyPercentage.textContent =
            "0.00%";

        return;
    }


    const percentage =
        (
            attended /
            conducted
        ) * 100;


    dailyPercentage.textContent =
        percentage.toFixed(2) + "%";
}


// =========================================
// VALIDATE INPUT
// =========================================

function validateAttendance() {

    clearError();


    const date =
        attendanceDate.value;


    const conducted =
        Number(
            classesConducted.value
        );


    const attended =
        Number(
            classesAttended.value
        );


    // -----------------------------------------
    // DATE
    // -----------------------------------------

    if (!date) {

        showError(
            "Please select a date."
        );

        return false;
    }


    // -----------------------------------------
    // CONDUCTED
    // -----------------------------------------

    if (
        !Number.isInteger(
            conducted
        ) ||
        conducted < 1
    ) {

        showError(
            "Classes conducted must be at least 1."
        );

        return false;
    }


    // -----------------------------------------
    // ATTENDED
    // -----------------------------------------

    if (
        !Number.isInteger(
            attended
        ) ||
        attended < 0
    ) {

        showError(
            "Classes attended cannot be negative."
        );

        return false;
    }


    // -----------------------------------------
    // ATTENDED > CONDUCTED
    // -----------------------------------------

    if (
        attended > conducted
    ) {

        showError(
            "Classes attended cannot be greater than classes conducted."
        );

        return false;
    }


    return true;
}


// =========================================
// CHECK DUPLICATE DATE
// =========================================

async function checkDuplicateDate(
    date
) {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("attendance_records")
            .select("id")
            .eq(
                "user_id",
                currentUser.id
            )
            .eq(
                "semester_id",
                currentSemester.id
            )
            .eq(
                "attendance_date",
                date
            )
            .limit(1);


    if (error) {

        console.error(
            "Duplicate check error:",
            error
        );

        throw error;
    }


    return (
        data &&
        data.length > 0
    );
}


// =========================================
// LOAD CURRENT USER
// =========================================

async function loadUser() {

    const {
        data: {
            user
        },
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

        return false;
    }


    if (!user) {

        window.location.href =
            "index.html";

        return false;
    }


    currentUser =
        user;


    return true;
}


// =========================================
// LOAD CURRENT SEMESTER
// =========================================

async function loadCurrentSemester() {

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
            .eq(
                "is_current",
                true
            )
            .limit(1);


    if (error) {

        console.error(
            "Semester error:",
            error
        );

        showError(
            "Could not load your current semester."
        );

        return false;
    }


    if (
        !semesters ||
        semesters.length === 0
    ) {

        showError(
            "No current semester found. Please create a semester first."
        );

        return false;
    }


    currentSemester =
        semesters[0];


    currentSemesterElement.textContent =
        `${currentSemester.semester} • ${currentSemester.academic_year}`;


    return true;
}


// =========================================
// SAVE ATTENDANCE
// =========================================

async function saveAttendance() {

    if (
        !validateAttendance()
    ) {
        return;
    }


    const date =
        attendanceDate.value;


    const conducted =
        Number(
            classesConducted.value
        );


    const attended =
        Number(
            classesAttended.value
        );


    // -----------------------------------------
    // CHECK DUPLICATE
    // -----------------------------------------

    saveAttendanceBtn.disabled =
        true;


    saveAttendanceBtn.textContent =
        "Checking...";


    try {

        const duplicate =
            await checkDuplicateDate(
                date
            );


        if (duplicate) {

            showError(
                "Attendance for this date already exists. Use Edit from the dashboard instead."
            );


            saveAttendanceBtn.disabled =
                false;


            saveAttendanceBtn.textContent =
                "Save Attendance";


            return;
        }


        // -------------------------------------
        // INSERT RECORD
        // -------------------------------------

        saveAttendanceBtn.textContent =
            "Saving...";


        const {
            error
        } =
            await supabaseClient
                .from("attendance_records")
                .insert({

                    user_id:
                        currentUser.id,

                    semester_id:
                        currentSemester.id,

                    attendance_date:
                        date,

                    classes_conducted:
                        conducted,

                    classes_attended:
                        attended

                });


        if (error) {

            console.error(
                "Save attendance error:",
                error
            );


            showError(
                error.message ||
                "Could not save attendance."
            );


            saveAttendanceBtn.disabled =
                false;


            saveAttendanceBtn.textContent =
                "Save Attendance";


            return;
        }


        // -------------------------------------
        // SUCCESS
        // -------------------------------------

        saveAttendanceBtn.textContent =
            "Saved ✓";


        setTimeout(
            function() {

                window.location.href =
                    "dashboard.html";

            },
            500
        );

    }

    catch (error) {

        console.error(
            error
        );


        showError(
            "Something went wrong. Please try again."
        );


        saveAttendanceBtn.disabled =
            false;


        saveAttendanceBtn.textContent =
            "Save Attendance";
    }
}


// =========================================
// INPUT EVENTS
// =========================================

if (classesConducted) {

    classesConducted.addEventListener(
        "input",
        updateDailyPercentage
    );
}


if (classesAttended) {

    classesAttended.addEventListener(
        "input",
        updateDailyPercentage
    );
}


// =========================================
// FORM SUBMIT
// =========================================

if (attendanceForm) {

    attendanceForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            saveAttendance();

        }
    );
}


// =========================================
// INITIALIZE
// =========================================

async function initialize() {

    setTodayDate();


    const loggedIn =
        await loadUser();


    if (!loggedIn) {
        return;
    }


    const semesterLoaded =
        await loadCurrentSemester();


    if (!semesterLoaded) {
        return;
    }


    updateDailyPercentage();
}


initialize();