// ==========================================
// ROLLSYNC - SUPABASE CONFIGURATION
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
// ELEMENTS
// ==========================================

const getStartedBtn =
    document.getElementById("getStartedBtn");

const loginBtn =
    document.getElementById("loginBtn");

const loginNavBtn =
    document.getElementById("loginNavBtn");


// ==========================================
// AUTO LOGIN / REMEMBER SESSION
// ==========================================

async function checkExistingSession() {

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();

    if (session) {

        // User is already logged in.
        // Send directly to dashboard.

        window.location.href = "dashboard.html";
    }
}


// Run only on landing page
if (
    getStartedBtn ||
    loginBtn ||
    loginNavBtn
) {
    checkExistingSession();
}


// ==========================================
// BUTTONS
// ==========================================

if (getStartedBtn) {

    getStartedBtn.addEventListener(
        "click",
        () => {
            showAuthScreen("register");
        }
    );
}


if (loginBtn) {

    loginBtn.addEventListener(
        "click",
        () => {
            showAuthScreen("login");
        }
    );
}


if (loginNavBtn) {

    loginNavBtn.addEventListener(
        "click",
        () => {
            showAuthScreen("login");
        }
    );
}


// ==========================================
// AUTH SCREEN
// ==========================================

function showAuthScreen(mode) {

    const existing =
        document.getElementById(
            "authScreen"
        );

    if (existing) {
        existing.remove();
    }


    const authScreen =
        document.createElement("div");

    authScreen.id =
        "authScreen";

    authScreen.className =
        "auth-overlay";


    // ======================================
    // REGISTER
    // ======================================

    if (mode === "register") {

        authScreen.innerHTML = `

            <div class="auth-card">

                <button
                    class="close-auth"
                    id="closeAuth"
                >
                    ×
                </button>


                <div class="auth-logo">

                    <span class="logo-mark">
                        R
                    </span>

                    <div class="brand-stack">
                        <strong>RollSync</strong>
                        <small>by Riishu</small>
                    </div>

                </div>


                <h2>
                    Create your account
                </h2>


                <p class="auth-subtitle">
                    Start tracking your semester attendance.
                </p>


                <form id="registerForm">

                    <label>
                        Full Name
                    </label>

                    <input
                        type="text"
                        id="registerName"
                        placeholder="Enter your full name"
                        required
                    >


                    <label>
                        Email
                    </label>

                    <input
                        type="email"
                        id="registerEmail"
                        placeholder="you@example.com"
                        required
                    >


                    <label>
                        Password
                    </label>

                    <input
                        type="password"
                        id="registerPassword"
                        placeholder="Create a password"
                        minlength="6"
                        required
                    >


                    <button
                        type="submit"
                        class="auth-submit"
                    >
                        Create Account
                    </button>

                </form>


                <p class="auth-switch">

                    Already have an account?

                    <button id="switchToLogin">
                        Login
                    </button>

                </p>


                <p
                    id="authMessage"
                    class="auth-message"
                ></p>

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
                >
                    ×
                </button>


                <div class="auth-logo">

                    <span class="logo-mark">
                        R
                    </span>

                    <div class="brand-stack">
                        <strong>RollSync</strong>
                        <small>by Riishu</small>
                    </div>

                </div>


                <h2>
                    Welcome back
                </h2>


                <p class="auth-subtitle">
                    Login to continue tracking your attendance.
                </p>


                <form id="loginForm">

                    <label>
                        Email
                    </label>

                    <input
                        type="email"
                        id="loginEmail"
                        placeholder="you@example.com"
                        required
                    >


                    <label>
                        Password
                    </label>

                    <input
                        type="password"
                        id="loginPassword"
                        placeholder="Enter your password"
                        required
                    >


                    <!-- REMEMBER ME -->

                    <label
                        class="remember-me"
                        for="rememberMe"
                    >

                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked
                        >

                        <span>
                            Remember me
                        </span>

                    </label>


                    <button
                        type="submit"
                        class="auth-submit"
                    >
                        Login
                    </button>

                </form>


                <p class="auth-switch">

                    Don't have an account?

                    <button id="switchToRegister">
                        Create Account
                    </button>

                </p>


                <p
                    id="authMessage"
                    class="auth-message"
                ></p>

            </div>
        `;
    }


    document.body.appendChild(
        authScreen
    );


    // ======================================
    // CLOSE
    // ======================================

    document
        .getElementById("closeAuth")
        .addEventListener(
            "click",
            () => {
                authScreen.remove();
            }
        );


    // ======================================
    // SWITCH TO LOGIN
    // ======================================

    const switchLogin =
        document.getElementById(
            "switchToLogin"
        );

    if (switchLogin) {

        switchLogin.addEventListener(
            "click",
            () => {
                showAuthScreen("login");
            }
        );
    }


    // ======================================
    // SWITCH TO REGISTER
    // ======================================

    const switchRegister =
        document.getElementById(
            "switchToRegister"
        );

    if (switchRegister) {

        switchRegister.addEventListener(
            "click",
            () => {
                showAuthScreen("register");
            }
        );
    }


    // ======================================
    // REGISTER
    // ======================================

    const registerForm =
        document.getElementById(
            "registerForm"
        );

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
        document.getElementById(
            "loginForm"
        );

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            loginUser
        );
    }
}


// ==========================================
// REGISTER
// ==========================================

async function registerUser(event) {

    event.preventDefault();


    const name =
        document
            .getElementById(
                "registerName"
            )
            .value
            .trim();


    const email =
        document
            .getElementById(
                "registerEmail"
            )
            .value
            .trim();


    const password =
        document.getElementById(
            "registerPassword"
        ).value;


    const message =
        document.getElementById(
            "authMessage"
        );


    message.textContent =
        "Creating your account...";


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.signUp({

                email: email,

                password: password,

                options: {

                    data: {

                        full_name:
                            name
                    }
                }
            });


        if (error) {
            throw error;
        }


        message.textContent =
            "Account created successfully. Check your email if verification is required.";

    }

    catch (error) {

        message.textContent =
            error.message;
    }
}


// ==========================================
// LOGIN
// ==========================================

async function loginUser(event) {

    event.preventDefault();


    const email =
        document
            .getElementById(
                "loginEmail"
            )
            .value
            .trim();


    const password =
        document.getElementById(
            "loginPassword"
        ).value;


    const rememberMe =
        document.getElementById(
            "rememberMe"
        ).checked;


    const message =
        document.getElementById(
            "authMessage"
        );


    message.textContent =
        "Logging in...";


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.signInWithPassword({

                email: email,

                password: password
            });


        if (error) {
            throw error;
        }


        // ==================================
        // REMEMBER ME
        // ==================================

        if (rememberMe) {

            localStorage.setItem(
                "rollsync_remember_me",
                "true"
            );

            localStorage.setItem(
                "rollsync_saved_email",
                email
            );

        }

        else {

            localStorage.removeItem(
                "rollsync_remember_me"
            );

            localStorage.removeItem(
                "rollsync_saved_email"
            );
        }


        message.textContent =
            "Login successful!";


        setTimeout(
            () => {

                window.location.href =
                    "dashboard.html";

            },
            500
        );

    }

    catch (error) {

        message.textContent =
            error.message;
    }
}


// ==========================================
// END
// ==========================================
