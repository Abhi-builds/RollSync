// =========================================
// ROLLSYNC — SEMESTER MANAGEMENT
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

const semesterForm =
    document.getElementById(
        "semesterForm"
    );

const semesterInput =
    document.getElementById(
        "semester"
    );

const academicYearInput =
    document.getElementById(
        "academicYear"
    );

const startingTotalInput =
    document.getElementById(
        "startingTotal"
    );

const startingAttendedInput =
    document.getElementById(
        "startingAttended"
    );

const startingPercentage =
    document.getElementById(
        "startingPercentage"
    );

const formError =
    document.getElementById(
        "formError"
    );

const createSemesterBtn =
    document.getElementById(
        "createSemesterBtn"
    );


// =========================================
// GLOBAL
// =========================================

let currentUser = null;


// =========================================
// SHOW ERROR
// =========================================

function showError(message) {

    formError.textContent =
        message;

    formError.style.display =
        "block";
}


// =========================================
// CLEAR ERROR
// =========================================

function clearError() {

    formError.textContent =
        "";

    formError.style.display =
        "none";
}


// =========================================
// UPDATE PREVIEW
// =========================================

function updatePreview() {

    const total =
        Number(
            startingTotalInput.value
        ) || 0;


    const attended =
        Number(
            startingAttendedInput.value
        ) || 0;


    if (total <= 0) {

        startingPercentage.textContent =
            "0.00%";

        return;
    }


    const percentage =
        (
            attended /
            total
        ) * 100;


    startingPercentage.textContent =
        percentage.toFixed(2) + "%";
}


// =========================================
// VALIDATE
// =========================================

function validateForm() {

    clearError();


    const semester =
        semesterInput.value.trim();


    const academicYear =
        academicYearInput.value.trim();


    const total =
        Number(
            startingTotalInput.value
        );


    const attended =
        Number(
            startingAttendedInput.value
        );


    // -----------------------------------------
    // SEMESTER
    // -----------------------------------------

    if (!semester) {

        showError(
            "Please select a semester."
        );

        return false;
    }


    // -----------------------------------------
    // ACADEMIC YEAR
    // -----------------------------------------

    if (!academicYear) {

        showError(
            "Please enter your academic year."
        );

        return false;
    }


    // -----------------------------------------
    // TOTAL
    // -----------------------------------------

    if (
        !Number.isInteger(total) ||
        total < 0
    ) {

        showError(
            "Total classes must be a valid number."
        );

        return false;
    }


    // -----------------------------------------
    // ATTENDED
    // -----------------------------------------

    if (
        !Number.isInteger(attended) ||
        attended < 0
    ) {

        showError(
            "Attended classes must be a valid number."
        );

        return false;
    }


    // -----------------------------------------
    // ATTENDED > TOTAL
    // -----------------------------------------

    if (
        attended > total
    ) {

        showError(
            "Attended classes cannot be greater than total classes."
        );

        return false;
    }


    return true;
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


    if (error || !user) {

        window.location.href =
            "index.html";

        return false;
    }


    currentUser =
        user;


    return true;
}


// =========================================
// CHECK EXISTING SEMESTER
// =========================================

async function semesterAlreadyExists(
    semester,
    academicYear
) {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("semesters")
            .select("id")
            .eq(
                "user_id",
                currentUser.id
            )
            .eq(
                "semester",
                semester
            )
            .eq(
                "academic_year",
                academicYear
            )
            .limit(1);


    if (error) {

        console.error(
            "Semester check error:",
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
// CREATE NEW SEMESTER
// =========================================

async function createSemester() {

    if (!validateForm()) {
        return;
    }


    const semester =
        semesterInput.value.trim();


    const academicYear =
        academicYearInput.value.trim();


    const startingTotal =
        Number(
            startingTotalInput.value
        );


    const startingAttended =
        Number(
            startingAttendedInput.value
        );


    createSemesterBtn.disabled =
        true;


    createSemesterBtn.textContent =
        "Checking...";


    try {

        // -------------------------------------
        // CHECK DUPLICATE
        // -------------------------------------

        const exists =
            await semesterAlreadyExists(
                semester,
                academicYear
            );


        if (exists) {

            showError(
                "This semester already exists in your account."
            );


            createSemesterBtn.disabled =
                false;


            createSemesterBtn.textContent =
                "Start Semester";


            return;
        }


        // -------------------------------------
        // MAKE OLD SEMESTER INACTIVE
        // -------------------------------------

        createSemesterBtn.textContent =
            "Preparing...";


        const {
            error:
                deactivateError
        } =
            await supabaseClient
                .from("semesters")
                .update({
                    is_current: false
                })
                .eq(
                    "user_id",
                    currentUser.id
                )
                .eq(
                    "is_current",
                    true
                );


        if (deactivateError) {

            console.error(
                "Deactivate semester error:",
                deactivateError
            );


            showError(
                "Could not switch from the previous semester."
            );


            createSemesterBtn.disabled =
                false;


            createSemesterBtn.textContent =
                "Start Semester";


            return;
        }


        // -------------------------------------
        // CREATE NEW SEMESTER
        // -------------------------------------

        createSemesterBtn.textContent =
            "Creating...";


        const {
            data: newSemester,
            error:
                createError
        } =
            await supabaseClient
                .from("semesters")
                .insert({

                    user_id:
                        currentUser.id,

                    semester:
                        semester,

                    academic_year:
                        academicYear,

                    starting_total_classes:
                        startingTotal,

                    starting_attended_classes:
                        startingAttended,

                    is_current:
                        true

                })
                .select()
                .single();


        if (createError) {

            console.error(
                "Create semester error:",
                createError
            );


            // Try to restore previous semester
            await supabaseClient
                .from("semesters")
                .update({
                    is_current: true
                })
                .eq(
                    "user_id",
                    currentUser.id
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                )
                .limit(1);


            showError(
                createError.message ||
                "Could not create the new semester."
            );


            createSemesterBtn.disabled =
                false;


            createSemesterBtn.textContent =
                "Start Semester";


            return;
        }


        // -------------------------------------
        // UPDATE PROFILE
        // -------------------------------------

        const {
            error:
                profileError
        } =
            await supabaseClient
                .from("profiles")
                .update({

                    semester:
                        semester,

                    academic_year:
                        academicYear

                })
                .eq(
                    "id",
                    currentUser.id
                );


        if (profileError) {

            console.warn(
                "Profile update warning:",
                profileError
            );
        }


        // -------------------------------------
        // SUCCESS
        // -------------------------------------

        createSemesterBtn.textContent =
            "Semester Started ✓";


        setTimeout(
            function() {

                window.location.href =
                    "dashboard.html";

            },
            700
        );

    }

    catch (error) {

        console.error(
            error
        );


        showError(
            "Something went wrong. Please try again."
        );


        createSemesterBtn.disabled =
            false;


        createSemesterBtn.textContent =
            "Start Semester";
    }
}


// =========================================
// INPUT EVENTS
// =========================================

startingTotalInput.addEventListener(
    "input",
    updatePreview
);

startingAttendedInput.addEventListener(
    "input",
    updatePreview
);


// =========================================
// FORM SUBMIT
// =========================================

semesterForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        createSemester();

    }
);


// =========================================
// INITIALIZE
// =========================================

async function initialize() {

    const loggedIn =
        await loadUser();


    if (!loggedIn) {
        return;
    }


    updatePreview();
}


initialize();