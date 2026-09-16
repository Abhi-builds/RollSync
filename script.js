// ==========================================
// ROLLSYNC — SUPABASE CONFIGURATION
// ==========================================

const SUPABASE_URL =
    "https://lmeevakdwqhxflmvmbzc.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_Rs8nX3UjNllzWPOLMwJHOA_dW9X7y4T";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// ==========================================
// ELEMENTS
// ==========================================

const getStartedBtn =
    document.getElementById("getStartedBtn");

const loginBtn =
    document.getElementById("loginBtn");

const loginNavBtn =
    document.getElementById("loginNavBtn");

const ctaGetStarted =
    document.getElementById("ctaGetStarted");


// ==========================================
// BUTTON EVENTS
// ==========================================

if (getStartedBtn) {
    getStartedBtn.addEventListener("click", () => {
        showAuthScreen("register");
    });
}


if (ctaGetStarted) {
    ctaGetStarted.addEventListener("click", () => {
        showAuthScreen("register");
    });
}


if (loginBtn) {
    loginBtn.addEventListener("click", () => {
        showAuthScreen("login");
    });
}


if (loginNavBtn) {
    loginNavBtn.addEventListener("click", () => {
        showAuthScreen("login");
    });
}


// ==========================================
// AUTH SCREEN
// ==========================================

function showAuthScreen(mode) {

    const existing =
        document.getElementById("authScreen");

    if (existing) {
        existing.remove();
    }


    const authScreen =
        document.createElement("div");

    authScreen.id = "authScreen";
    authScreen.className = "auth-overlay";


    // ======================================
    // REGISTER
    // ======================================

    if (mode === "register") {

        authScreen.innerHTML = `

            <div class="auth-card">

                <button
                    class="close-auth"
                    id="closeAuth"
                    type="button"
                    aria-label="Close"
                >
                    ×
                </button>


                <div class="auth-card-brand">

                    <div class="auth-logo-mark">
                        R
                    </div>

                    <div class="auth-brand-name">
                        <strong>RollSync</strong>
                        <span>by Riishu</span>
                    </div>

                </div>


                <div class="auth-heading">

                    <span class="auth-eyebrow">
                        GET STARTED
                    </span>

                    <h2>
                        Create your account
                    </h2>

                    <p>
                        Start tracking your semester attendance
                        in a simpler way.
                    </p>

                </div>


                <form id="registerForm">

                    <div class="auth-field">

                        <label for="registerName">
                            Full Name
                        </label>

                        <input
                            type="text"
                            id="registerName"
                            placeholder="Enter your full name"
                            autocomplete="name"
                            required
                        >

                    </div>


                    <div class="auth-field">

                        <label for="registerEmail">
                            Email
                        </label>

                        <input
                            type="email"
                            id="registerEmail"
                            placeholder="you@example.com"
                            autocomplete="email"
                            required
                        >

                    </div>


                    <div class="auth-field">

                        <label for="registerPassword">
                            Password
                        </label>

                        <input
                            type="password"
                            id="registerPassword"
                            placeholder="Create a password"
                            autocomplete="new-password"
                            minlength="6"
                            required
                        >

                        <small>
                            Minimum 6 characters
                        </small>

                    </div>


                    <button
                        type="submit"
                        class="auth-submit"
                        id="registerSubmit"
                    >
                        Create Account
                        <span>→</span>
                    </button>

                </form>


                <div
                    id="authMessage"
                    class="auth-message"
                    aria-live="polite"
                ></div>


                <div class="auth-switch">

                    <span>
                        Already have an account?
                    </span>

                    <button
                        id="switchToLogin"
                        type="button"
                    >
                        Login
                    </button>

                </div>


                <div class="auth-security">
                    <span>🔒</span>
                    Your account is secured with Supabase Auth.
                </div>

            </div>

        `;
    }


    // ======================================
    // LOGIN
    // ======================================

    else {

        authScreen.innerHTML = `

            <div class="auth-card">

                <button
                    class="close-auth"
                    id="closeAuth"
                    type="button"
                    aria-label="Close"
                >
                    ×
                </button>


                <div class="auth-card-brand">

                   <div class="auth-logo">
                        <span class="logo-mark">R</span>

                        <div class="auth-brand-text">
                            <span class="auth-brand-name">RollSync</span>
                            <span class="auth-brand-by">by Riishu</span>
                        </div>
                    </div>

                    <div class="auth-brand-name">
                        <strong>RollSync</strong>
                        <span>by Riishu</span>
                    </div>

                </div>


                <div class="auth-heading">

                    <span class="auth-eyebrow">
                        WELCOME BACK
                    </span>

                    <h2>
                        Welcome back
                    </h2>

                    <p>
                        Login to continue tracking your attendance.
                    </p>

                </div>


                <form id="loginForm">

                    <div class="auth-field">

                        <label for="loginEmail">
                            Email
                        </label>

                        <input
                            type="email"
                            id="loginEmail"
                            placeholder="you@example.com"
                            autocomplete="email"
                            required
                        >

                    </div>


                    <div class="auth-field">

                        <label for="loginPassword">
                            Password
                        </label>

                        <input
                            type="password"
                            id="loginPassword"
                            placeholder="Enter your password"
                            autocomplete="current-password"
                            required
                        >

                    </div>


                    <button
                        type="submit"
                        class="auth-submit"
                        id="loginSubmit"
                    >
                        Login
                        <span>→</span>
                    </button>

                </form>


                <div
                    id="authMessage"
                    class="auth-message"
                    aria-live="polite"
                ></div>


                <div class="auth-switch">

                    <span>
                        Don't have an account?
                    </span>

                    <button
                        id="switchToRegister"
                        type="button"
                    >
                        Create Account
                    </button>

                </div>


                <div class="auth-security">
                    <span>🔒</span>
                    Your account is secured with Supabase Auth.
                </div>

            </div>

        `;
    }


    document.body.appendChild(authScreen);


    // ======================================
    // CLOSE
    // ======================================

    document
        .getElementById("closeAuth")
        .addEventListener("click", () => {

            authScreen.classList.add("closing");

            setTimeout(() => {
                authScreen.remove();
            }, 180);

        });


    // Close when clicking outside card

    authScreen.addEventListener("click", (event) => {

        if (event.target === authScreen) {

            authScreen.classList.add("closing");

            setTimeout(() => {
                authScreen.remove();
            }, 180);

        }

    });


    // ======================================
    // SWITCH LOGIN
    // ======================================

    const switchLogin =
        document.getElementById("switchToLogin");

    if (switchLogin) {

        switchLogin.addEventListener("click", () => {
            showAuthScreen("login");
        });

    }


    // ======================================
    // SWITCH REGISTER
    // ======================================

    const switchRegister =
        document.getElementById("switchToRegister");

    if (switchRegister) {

        switchRegister.addEventListener("click", () => {
            showAuthScreen("register");
        });

    }


    // ======================================
    // REGISTER
    // ======================================

    const registerForm =
        document.getElementById("registerForm");

    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            registerUser
        );

    }


    // ======================================
    // LOGIN
    // ======================================

    const loginForm =
        document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            loginUser
        );

    }


    // Focus first field

    setTimeout(() => {

        const firstInput =
            authScreen.querySelector("input");

        if (firstInput) {
            firstInput.focus();
        }

    }, 100);

}


// ==========================================
// REGISTER USER
// ==========================================

async function registerUser(event) {

    event.preventDefault();


    const name =
        document
            .getElementById("registerName")
            .value
            .trim();

    const email =
        document
            .getElementById("registerEmail")
            .value
            .trim();

    const password =
        document
            .getElementById("registerPassword")
            .value;

    const message =
        document.getElementById("authMessage");

    const submitButton =
        document.getElementById("registerSubmit");


    if (!name || !email || !password) {

        showAuthMessage(
            message,
            "Please fill in all fields.",
            "error"
        );

        return;
    }


    if (password.length < 6) {

        showAuthMessage(
            message,
            "Password must contain at least 6 characters.",
            "error"
        );

        return;
    }


    submitButton.disabled = true;

    submitButton.innerHTML =
        `<span class="auth-spinner"></span> Creating account...`;

    message.textContent = "";


    try {

        const { data, error } =
            await supabaseClient.auth.signUp({

                email: email,

                password: password,

                options: {

                    data: {
                        full_name: name
                    }

                }

            });


        if (error) {
            throw error;
        }


        /*
         * If email confirmation is disabled,
         * Supabase normally returns a session.
         *
         * If confirmation is enabled,
         * the user needs to confirm their email.
         */

        if (data.session) {

            showAuthMessage(
                message,
                "Account created! Setting up your profile...",
                "success"
            );


            setTimeout(() => {

                window.location.href =
                    "profile.html";

            }, 800);

        } else {

            showAuthMessage(
                message,
                "Account created. Please check your email to verify your account.",
                "success"
            );


            submitButton.disabled = false;

            submitButton.innerHTML =
                `Create Account <span>→</span>`;

        }

    } catch (error) {

        showAuthMessage(
            message,
            getFriendlyAuthError(error),
            "error"
        );


        submitButton.disabled = false;

        submitButton.innerHTML =
            `Create Account <span>→</span>`;

    }

}


// ==========================================
// LOGIN USER
// ==========================================

async function loginUser(event) {

    event.preventDefault();


    const email =
        document
            .getElementById("loginEmail")
            .value
            .trim();

    const password =
        document
            .getElementById("loginPassword")
            .value;

    const message =
        document.getElementById("authMessage");

    const submitButton =
        document.getElementById("loginSubmit");


    if (!email || !password) {

        showAuthMessage(
            message,
            "Please enter your email and password.",
            "error"
        );

        return;
    }


    submitButton.disabled = true;

    submitButton.innerHTML =
        `<span class="auth-spinner"></span> Logging in...`;

    message.textContent = "";


    try {

        const { data, error } =
            await supabaseClient.auth.signInWithPassword({

                email: email,

                password: password

            });


        if (error) {
            throw error;
        }


        if (!data.session) {

            throw new Error(
                "Login session could not be created. Please try again."
            );

        }


        showAuthMessage(
            message,
            "Login successful! Opening RollSync...",
            "success"
        );


        setTimeout(() => {

            window.location.href =
                "dashboard.html";

        }, 700);


    } catch (error) {

        showAuthMessage(
            message,
            getFriendlyAuthError(error),
            "error"
        );


        submitButton.disabled = false;

        submitButton.innerHTML =
            `Login <span>→</span>`;

    }

}


// ==========================================
// AUTH MESSAGE
// ==========================================

function showAuthMessage(
    element,
    text,
    type
) {

    if (!element) return;

    element.textContent = text;

    element.className =
        `auth-message ${type}`;

}


// ==========================================
// FRIENDLY ERROR MESSAGES
// ==========================================

function getFriendlyAuthError(error) {

    const message =
        error?.message || "";

    const lower =
        message.toLowerCase();


    if (
        lower.includes("invalid login credentials")
    ) {

        return "Incorrect email or password.";

    }


    if (
        lower.includes("user already registered")
    ) {

        return "An account with this email already exists. Try logging in.";

    }


    if (
        lower.includes("password")
        &&
        lower.includes("6")
    ) {

        return "Password must contain at least 6 characters.";

    }


    if (
        lower.includes("email")
        &&
        lower.includes("invalid")
    ) {

        return "Please enter a valid email address.";

    }


    if (
        lower.includes("rate limit")
    ) {

        return "Too many attempts. Please wait a moment and try again.";

    }


    return message || "Something went wrong. Please try again.";

}


// ==========================================
// ESC KEY
// ==========================================

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key !== "Escape") return;

        const authScreen =
            document.getElementById("authScreen");

        if (authScreen) {
            authScreen.remove();
        }

    }
);