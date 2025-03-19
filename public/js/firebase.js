
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, getRedirectResult, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
// import {signInWithPopup} from "firebase/auth"
const firebaseConfig = {
    apiKey: "AIzaSyC54KldshIKgg_pUAjMvhcAfqhtgS8UE9I",
    authDomain: "younite-frb.firebaseapp.com",
    projectId: "younite-frb",
    storageBucket: "younite-frb.firebasestorage.app",
    messagingSenderId: "449672533697",
    appId: "1:449672533697:web:db05e368b1d92447866640",
    measurementId: "G-BYS23CQNXM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const g_provider = new GoogleAuthProvider();

// // // -------------------


const BtnSignWithGoole = document.getElementById("btn_connect_with_gog");




if (BtnSignWithGoole) BtnSignWithGoole.onclick = async () => {
    let res = await signInWithPopup(auth, g_provider);
    if (res.user) {
        console.log(res);

        const { email, displayName, photoURL } = res.user;
        const [FirstName, LastName] = displayName.split(" ")
        const profile_img = photoURL;

        SendToCreateUser({ email, FirstName, LastName, profile_img });
    }
}

const BtnLoginWithGoole = document.getElementById("btn_login_with_gog");

if (BtnLoginWithGoole) BtnLoginWithGoole.onclick = async () => {
    console.log('test');

    let res = await signInWithPopup(auth, g_provider);
    if (res.user) {
        console.log(res);

        const { email } = res.user;

        SendToAuthUser(email);
    }
}




const SendToCreateUser = async ({ email, FirstName, LastName, profile_img }) => {

    fetch("/social_action/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, FirstName, LastName, profile_img })
    }).then(res => res.json()).then(res => {

        ValidateResponse(res)
    })
}
const SendToAuthUser = async (email) => {

    fetch("/social_action/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({email})
    }).then(res => res.json()).then(res => {
        console.log(res);
        ValidateResponse(res)
    })
}


const ValidateResponse = res => {
    if (res.ok == true) {
        window.location.href = res.url;
    } else if (res.error_code == "email_already_taken") {
        document.querySelector('.statusEmail').innerText = "Email you are trying to use is already taken";
    }
    else if (res.error_code == "email_not_found") {
        document.querySelector('.statusEmail').innerText = "Email not exist in our db ";
    }
}

