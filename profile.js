// ==========================================
// ROLLSYNC SUPABASE
// ==========================================

const SUPABASE_URL =
    "https://lmeevakdwqhxflmvmbzc.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_Rs8nX3UjNllzWPOLMwJHOA_dW9X7y4T";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// ==========================================
// CURRENT USER
// ==========================================

let currentUser = null;


// ==========================================
// AUTH CHECK
// ==========================================

async function checkProfileAccess() {

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();

    if (error || !user) {

        window.location.href = "index.html";

        return null;
    }

    return user;
}


// ==========================================
// ELEMENTS
// ==========================================

const profileForm =
    document.getElementById("profileForm");

const message =
    document.getElementById("profileMessage");

const saveButton =
    document.getElementById("saveProfileBtn");

const logoutButton =
    document.getElementById("logoutBtn");


// ==========================================
// GET LOGGED-IN USER
// ==========================================

async function getCurrentUser() {

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();

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

    return user;
}


// ==========================================
// LOAD PROFILE
// ==========================================

async function loadProfile(user) {

    const {
        data,
        error
    } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();


    // ======================================
    // DATABASE ERROR
    // ======================================

    if (error) {

        console.error(
            "Profile loading error:",
            error
        );

        showMessage(
            "Could not load your profile. " +
            error.message,
            "error"
        );

        return null;
    }


    // ======================================
    // ACCOUNT EMAIL
    // ======================================

    const emailElement =
        document.getElementById(
            "accountEmail"
        );

    if (emailElement) {

        emailElement.textContent =
            user.email || "Not available";
    }


    // ======================================
    // NO PROFILE YET
    // ======================================

    if (!data) {

        setupFirstTimeMode();

        updateAvatar("");

        return null;
    }


    // ======================================
    // EXISTING PROFILE
    // ======================================

    const fullNameElement =
        document.getElementById("fullName");

    const collegeElement =
        document.getElementById("college");

    const rollNumberElement =
        document.getElementById("rollNumber");

    const branchElement =
        document.getElementById("branch");

    const semesterElement =
        document.getElementById("semester");

    const academicYearElement =
        document.getElementById("academicYear");

    const minimumAttendanceElement =
        document.getElementById(
            "minimumAttendance"
        );


    // ======================================
    // POPULATE FIELDS
    // ======================================

    if (fullNameElement) {

        fullNameElement.value =
            data.full_name || "";
    }


    if (collegeElement) {

        collegeElement.value =
            data.college || "";
    }


    if (rollNumberElement) {

        rollNumberElement.value =
            data.roll_number || "";
    }


    if (branchElement) {

        branchElement.value =
            data.branch || "";
    }


    if (semesterElement) {

        semesterElement.value =
            data.semester || "";
    }


    if (academicYearElement) {

        academicYearElement.value =
            data.academic_year || "";
    }


    if (minimumAttendanceElement) {

        minimumAttendanceElement.value =
            data.minimum_attendance ?? 75;
    }


    // ======================================
    // AVATAR
    // ======================================

    updateAvatar(
        data.full_name
    );


    // ======================================
    // EDIT MODE
    // ======================================

    setupEditMode();


    return data;
}


// ==========================================
// FIRST TIME MODE
// ==========================================

function setupFirstTimeMode() {

    const pageTitle =
        document.getElementById(
            "pageTitle"
        );

    if (pageTitle) {

        pageTitle.textContent =
            "Set up your profile";
    }


    const pageSubtitle =
        document.getElementById(
            "pageSubtitle"
        );

    if (pageSubtitle) {

        pageSubtitle.textContent =
            "Tell us a little about yourself to get started with RollSync.";
    }


    const saveProfileButton =
        document.getElementById(
            "saveProfileBtn"
        );

    if (saveProfileButton) {

        saveProfileButton.textContent =
            "Continue";
    }


    // ======================================
    // BACK BUTTON
    // ======================================

    const backButton =
        document.querySelector(
            ".profile-back"
        );

    if (backButton) {

        backButton.textContent =
            "← Back";

        backButton.href =
            "index.html";
    }


    // ======================================
    // HIDE MANAGEMENT
    // ======================================

    const managementCard =
        document.querySelector(
            ".profile-management-card"
        );

    if (managementCard) {

        managementCard.style.display =
            "none";
    }


    // ======================================
    // HIDE DANGER CARD
    // ======================================

    const dangerCard =
        document.querySelector(
            ".account-danger-card"
        );

    if (dangerCard) {

        dangerCard.style.display =
            "none";
    }


    // ======================================
    // HIDE ACCOUNT EMAIL BOX
    // ======================================

    const accountBox =
        document.querySelector(
            ".profile-account-box"
        );

    if (accountBox) {

        accountBox.style.display =
            "none";
    }


    // ======================================
    // SEMESTER HELP
    // ======================================

    const semesterHelp =
        document.getElementById(
            "semesterHelp"
        );

    if (semesterHelp) {

        semesterHelp.textContent =
            "Choose the semester you are currently studying.";
    }


    // ======================================
    // ENABLE SEMESTER
    // ======================================

    const semester =
        document.getElementById(
            "semester"
        );

    if (semester) {

        semester.disabled =
            false;
    }


    // ======================================
    // ENABLE ACADEMIC YEAR
    // ======================================

    const academicYear =
        document.getElementById(
            "academicYear"
        );

    if (academicYear) {

        academicYear.disabled =
            false;
    }
}


// ==========================================
// EDIT MODE
// ==========================================

function setupEditMode() {

    const pageTitle =
        document.getElementById(
            "pageTitle"
        );

    if (pageTitle) {

        pageTitle.textContent =
            "Profile & Settings";
    }


    const pageSubtitle =
        document.getElementById(
            "pageSubtitle"
        );

    if (pageSubtitle) {

        pageSubtitle.textContent =
            "Manage your RollSync profile and attendance settings.";
    }


    const saveProfileButton =
        document.getElementById(
            "saveProfileBtn"
        );

    if (saveProfileButton) {

        saveProfileButton.textContent =
            "Save Changes";
    }


    // ======================================
    // SEMESTER CONTROLLED BY
    // SEMESTER MANAGEMENT
    // ======================================

    const semester =
        document.getElementById(
            "semester"
        );

    if (semester) {

        semester.disabled =
            true;
    }


    // ======================================
    // ACADEMIC YEAR CONTROLLED BY
    // SEMESTER MANAGEMENT
    // ======================================

    const academicYear =
        document.getElementById(
            "academicYear"
        );

    if (academicYear) {

        academicYear.disabled =
            true;
    }


    // ======================================
    // SEMESTER HELP
    // ======================================

    const semesterHelp =
        document.getElementById(
            "semesterHelp"
        );

    if (semesterHelp) {

        semesterHelp.textContent =
            "Use Manage Semester to start or switch semesters.";
    }
}


// ==========================================
// AVATAR
// ==========================================

function updateAvatar(name) {

    const avatar =
        document.getElementById(
            "profileAvatar"
        );

    if (!avatar) {
        return;
    }


    // ======================================
    // DEFAULT AVATAR
    // ======================================

    if (!name) {

        avatar.textContent =
            "R";

        return;
    }


    // ======================================
    // CREATE INITIALS
    // ======================================

    const letters =
        name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(word =>
                word.charAt(0)
            )
            .join("")
            .toUpperCase();


    avatar.textContent =
        letters || "R";
}


// ==========================================
// MESSAGE
// ==========================================

function showMessage(
    text,
    type = "normal"
) {

    if (!message) {
        return;
    }


    message.textContent =
        text;


    message.className =
        "profile-message";


    if (type === "error") {

        message.classList.add(
            "profile-message-error"
        );
    }


    if (type === "success") {

        message.classList.add(
            "profile-message-success"
        );
    }
}


// ==========================================
// SAVE PROFILE
// ==========================================

if (profileForm) {

    profileForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ==================================
            // GET USER
            // ==================================

            const user =
                await getCurrentUser();


            if (!user) {

                return;
            }


            // ==================================
            // GET FORM VALUES
            // ==================================

            const fullName =
                document.getElementById(
                    "fullName"
                ).value.trim();


            const college =
                document.getElementById(
                    "college"
                ).value.trim();


            const rollNumber =
                document.getElementById(
                    "rollNumber"
                ).value.trim();


            const branch =
                document.getElementById(
                    "branch"
                ).value.trim();


            const semester =
                document.getElementById(
                    "semester"
                ).value;


            const academicYear =
                document.getElementById(
                    "academicYear"
                ).value.trim();


            const minimumAttendance =
                Number(
                    document.getElementById(
                        "minimumAttendance"
                    ).value
                );


            // ==================================
            // VALIDATION
            // ==================================

            if (!fullName) {

                showMessage(
                    "Please enter your full name.",
                    "error"
                );

                return;
            }


            if (!college) {

                showMessage(
                    "Please enter your college name.",
                    "error"
                );

                return;
            }


            if (!rollNumber) {

                showMessage(
                    "Please enter your roll number.",
                    "error"
                );

                return;
            }


            if (!branch) {

                showMessage(
                    "Please enter your branch.",
                    "error"
                );

                return;
            }


            if (!semester) {

                showMessage(
                    "Please select your semester.",
                    "error"
                );

                return;
            }


            if (!academicYear) {

                showMessage(
                    "Please enter your academic year.",
                    "error"
                );

                return;
            }


            if (
                !Number.isFinite(
                    minimumAttendance
                ) ||
                minimumAttendance < 1 ||
                minimumAttendance > 100
            ) {

                showMessage(
                    "Attendance target must be between 1% and 100%.",
                    "error"
                );

                return;
            }


            // ==================================
            // BUTTON LOADING
            // ==================================

            if (saveButton) {

                saveButton.disabled =
                    true;

                saveButton.textContent =
                    "Saving...";
            }


            showMessage(
                "Saving your profile..."
            );


            // ==================================
            // CHECK EXISTING PROFILE
            // ==================================

            const {
                data: existingProfile,
                error: profileCheckError
            } = await supabaseClient
                .from("profiles")
                .select("id")
                .eq("id", user.id)
                .maybeSingle();


            if (profileCheckError) {

                console.error(
                    "Profile check error:",
                    profileCheckError
                );

                showMessage(
                    profileCheckError.message,
                    "error"
                );

                resetSaveButton();

                return;
            }


            // ==================================
            // SAVE PROFILE
            // ==================================

            const {
                error
            } = await supabaseClient
                .from("profiles")
                .upsert(
                    {
                        id: user.id,

                        full_name:
                            fullName,

                        college:
                            college,

                        roll_number:
                            rollNumber,

                        branch:
                            branch,

                        semester:
                            semester,

                        academic_year:
                            academicYear,

                        minimum_attendance:
                            minimumAttendance
                    },
                    {
                        onConflict:
                            "id"
                    }
                );


            // ==================================
            // SAVE ERROR
            // ==================================

            if (error) {

                console.error(
                    "Profile save error:",
                    error
                );

                showMessage(
                    error.message,
                    "error"
                );

                resetSaveButton();

                return;
            }


            // ==================================
            // SUCCESS
            // ==================================

            updateAvatar(
                fullName
            );


            showMessage(
                "Profile saved successfully.",
                "success"
            );


            // ==================================
            // FIRST-TIME USER
            // ==================================

            if (!existingProfile) {

                setTimeout(
                    () => {

                        window.location.href =
                            "attendance-setup.html";

                    },
                    700
                );

                return;
            }


            // ==================================
            // EXISTING USER
            // ==================================

            resetSaveButton();

        }
    );
}


// ==========================================
// RESET SAVE BUTTON
// ==========================================

function resetSaveButton() {

    if (!saveButton) {
        return;
    }


    saveButton.disabled =
        false;


    saveButton.textContent =
        "Save Changes";
}


// ==========================================
// LOGOUT
// ==========================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

            const confirmed =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmed) {

                return;
            }


            // ==================================
            // LOADING
            // ==================================

            logoutButton.disabled =
                true;

            logoutButton.textContent =
                "Logging out...";


            // ==================================
            // SIGN OUT
            // ==================================

            const {
                error
            } =
                await supabaseClient
                    .auth
                    .signOut();


            // ==================================
            // LOGOUT ERROR
            // ==================================

            if (error) {

                console.error(
                    "Logout error:",
                    error
                );


                logoutButton.disabled =
                    false;


                logoutButton.textContent =
                    "Logout";


                showMessage(
                    error.message,
                    "error"
                );


                return;
            }


            // ==================================
            // REDIRECT
            // ==================================

            window.location.href =
                "index.html";
        }
    );
}


// ==========================================
// INITIALIZE PROFILE
// ==========================================

async function initializeProfile() {

    try {

        // ==================================
        // GET CURRENT USER
        // ==================================

        currentUser =
            await getCurrentUser();


        if (!currentUser) {

            return;
        }


        // ==================================
        // LOAD PROFILE
        // ==================================

        await loadProfile(
            currentUser
        );

    } catch (error) {

        console.error(
            "Profile initialization error:",
            error
        );


        showMessage(
            "Could not load your profile. Please refresh and try again.",
            "error"
        );
    }
}


// ==========================================
// START
// ==========================================

initializeProfile();