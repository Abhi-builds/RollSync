// =========================================
// ROLLSYNC — EDIT ATTENDANCE
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

const editAttendanceForm =
    document.getElementById(
        "editAttendanceForm"
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

const updateAttendanceBtn =
    document.getElementById(
        "updateAttendanceBtn"
    );


// =========================================
// GLOBAL VARIABLES
// =========================================

let currentUser = null;

let currentSemester = null;

let attendanceRecord = null;


// =========================================
// GET RECORD ID FROM URL
// =========================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const recordId =
    urlParams.get("id");


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


    if (conducted <= 0) {

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
// VALIDATE FORM
// =========================================

function validateForm() {

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
            .neq(
                "id",
                recordId
            )
            .limit(1);


    if (error) {

        console.error(
            "Duplicate date check error:",
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
            "No current semester found."
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
// LOAD ATTENDANCE RECORD
// =========================================

async function loadAttendanceRecord() {

    if (!recordId) {

        showError(
            "Attendance record was not specified."
        );

        return false;
    }


    const {
        data: record,
        error
    } =
        await supabaseClient
            .from("attendance_records")
            .select("*")
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
            )
            .single();


    if (error) {

        console.error(
            "Attendance record error:",
            error
        );

        showError(
            "This attendance record could not be found."
        );

        return false;
    }


    if (!record) {

        showError(
            "This attendance record does not exist."
        );

        return false;
    }


    attendanceRecord =
        record;


    // -----------------------------------------
    // FILL FORM
    // -----------------------------------------

    attendanceDate.value =
        record.attendance_date;


    classesConducted.value =
        record.classes_conducted;


    classesAttended.value =
        record.classes_attended;


    updateDailyPercentage();


    return true;
}


// =========================================
// UPDATE ATTENDANCE RECORD
// =========================================

async function updateAttendance() {

    if (
        !validateForm()
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


    updateAttendanceBtn.disabled =
        true;


    updateAttendanceBtn.textContent =
        "Checking...";


    try {

        // -------------------------------------
        // DUPLICATE DATE CHECK
        // -------------------------------------

        const duplicate =
            await checkDuplicateDate(
                date
            );


        if (duplicate) {

            showError(
                "Another attendance record already exists for this date."
            );


            updateAttendanceBtn.disabled =
                false;


            updateAttendanceBtn.textContent =
                "Update Attendance";


            return;
        }


        // -------------------------------------
        // UPDATE
        // -------------------------------------

        updateAttendanceBtn.textContent =
            "Updating...";


        const {
            error
        } =
            await supabaseClient
                .from("attendance_records")
                .update({

                    attendance_date:
                        date,

                    classes_conducted:
                        conducted,

                    classes_attended:
                        attended

                })
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
                "Update attendance error:",
                error
            );


            showError(
                error.message ||
                "Could not update attendance."
            );


            updateAttendanceBtn.disabled =
                false;


            updateAttendanceBtn.textContent =
                "Update Attendance";


            return;
        }


        // -------------------------------------
        // SUCCESS
        // -------------------------------------

        updateAttendanceBtn.textContent =
            "Updated ✓";


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


        updateAttendanceBtn.disabled =
            false;


        updateAttendanceBtn.textContent =
            "Update Attendance";
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

if (editAttendanceForm) {

    editAttendanceForm.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            updateAttendance();

        }
    );
}


// =========================================
// INITIALIZE
// =========================================

async function initialize() {

    // -----------------------------------------
    // CHECK RECORD ID
    // -----------------------------------------

    if (!recordId) {

        showError(
            "No attendance record was selected."
        );

        return;
    }


    // -----------------------------------------
    // LOAD USER
    // -----------------------------------------

    const loggedIn =
        await loadUser();


    if (!loggedIn) {
        return;
    }


    // -----------------------------------------
    // LOAD SEMESTER
    // -----------------------------------------

    const semesterLoaded =
        await loadCurrentSemester();


    if (!semesterLoaded) {
        return;
    }


    // -----------------------------------------
    // LOAD RECORD
    // -----------------------------------------

    await loadAttendanceRecord();
}


initialize();