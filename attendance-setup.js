const SUPABASE_URL = "https://lmeevakdwqhxflmvmbzc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Rs8nX3UjNllzWPOLMwJHOA_dW9X7y4T";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// Get form elements
const form = document.getElementById("attendanceForm");

const totalClassesInput =
    document.getElementById("totalClasses");

const attendedClassesInput =
    document.getElementById("attendedClasses");

const attendancePercentage =
    document.getElementById("attendancePercentage");

const attendanceSummary =
    document.getElementById("attendanceSummary");

const errorMessage =
    document.getElementById("errorMessage");


// Check login
async function checkUser() {

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


// Calculate attendance preview
function updatePreview() {

    const total = Number(totalClassesInput.value) || 0;
    const attended = Number(attendedClassesInput.value) || 0;

    if (total === 0) {

        attendancePercentage.textContent = "0.00%";

    } else {

        const percentage = (attended / total) * 100;

        attendancePercentage.textContent =
            percentage.toFixed(2) + "%";
    }

    attendanceSummary.textContent =
        `${attended} of ${total} classes attended`;
}


// Update preview whenever values change
totalClassesInput.addEventListener(
    "input",
    updatePreview
);

attendedClassesInput.addEventListener(
    "input",
    updatePreview
);


// Submit attendance setup
form.addEventListener("submit", async function(event) {

    event.preventDefault();

    errorMessage.textContent = "";

    const user = await checkUser();

    if (!user) return;


    const totalClasses =
        Number(totalClassesInput.value);

    const attendedClasses =
        Number(attendedClassesInput.value);


    // Validation
    if (!Number.isInteger(totalClasses) || totalClasses < 0) {

        errorMessage.textContent =
            "Please enter a valid total number of classes.";

        return;
    }


    if (!Number.isInteger(attendedClasses) || attendedClasses < 0) {

        errorMessage.textContent =
            "Please enter a valid attended class count.";

        return;
    }


    if (attendedClasses > totalClasses) {

        errorMessage.textContent =
            "Attended classes cannot be greater than total classes.";

        return;
    }


    // Get user's profile
    const { data: profile, error: profileError } =
        await supabaseClient
            .from("profiles")
            .select("semester, academic_year")
            .eq("id", user.id)
            .single();


    if (profileError) {

        console.error(profileError);

        errorMessage.textContent =
            "Could not load your profile.";

        return;
    }


    // Save semester attendance
    const { error } = await supabaseClient
        .from("semesters")
        .insert({

            user_id: user.id,

            semester: profile.semester,

            academic_year: profile.academic_year,

            starting_total_classes: totalClasses,

            starting_attended_classes: attendedClasses

        });


    if (error) {

        console.error(error);

        errorMessage.textContent =
            error.message;

        return;
    }


    // Success
    window.location.href = "dashboard.html";

});