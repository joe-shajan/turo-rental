


function logvalid() {

    var email = document.getElementById("email").value
    if (email == "") {

        document.getElementById("emailmsg").innerHTML = "Email id should not be empty";
        return false;
    }

}
function validation() {
    var firstname = document.getElementById("firstname").value;
    var lastname = document.getElementById("lastname").value;
    var password = document.getElementById("password").value;
    var repassword = document.getElementById("repassword").value;
    var phoneno = document.getElementById("phoneno").value;
    var email = document.getElementById("email").value;

    if (firstname == "") {
        document.getElementById("firstnamemsg").innerHTML = "Please fill the Name field";
        return false;
    } else {
        document.getElementById("firstnamemsg").innerHTML = "";
    }
    if (lastname == "") {
        document.getElementById("lastnamemsg").innerHTML = "Please fill the Name field";
        return false;
    } else {
        document.getElementById("lastnamemsg").innerHTML = "";

    }

    if (phoneno == "") {
        document.getElementById("phonenomsg").innerHTML = "Please fill the mobile Number field";
        return false;
    } else {
        document.getElementById("phonenomsg").innerHTML = "";

    }
    if (isNaN(phoneno)) {
        document.getElementById("phonenomsg").innerHTML = "user must write digits only not characters";
        return false;
    } else {
        document.getElementById("phonenomsg").innerHTML = "";

    }
    if (phoneno.length != 10) {
        document.getElementById("phonenomsg").innerHTML = "Mobile Number must be 10 digits only";
        return false;
    } else {
        document.getElementById("phonenomsg").innerHTML = "";

    }

    if (email == "") {
        document.getElementById("emailmsg").innerHTML = "Please fill the email id field";
        return false;
    } else {
        document.getElementById("emailmsg").innerHTML = "";

    }
    if (email.indexOf("@") <= 0) {
        document.getElementById("emailmsg").innerHTML = "Invalid Email";
        return false;
    } else {
        document.getElementById("emailmsg").innerHTML = "";

    }

    if (
        email.charAt(email.length - 4) != "." &&
        email.charAt(email.length - 3) != "."
    ) {
        document.getElementById("emailmsg").innerHTML = "Invalid Email";
        return false;
    } else {
        document.getElementById("emailmsg").innerHTML = "";

    }

    if (password == "") {
        document.getElementById("passwordmsg").innerHTML = "Please fill the password field";
        return false;
    }
    if (password.length <= 5 || password.length > 20) {
        document.getElementById("passwordmsg").innerHTML = "password must be greater than 5 characters";
        return false;
    } else {
        document.getElementById("passwordmsg").innerHTML = "";
    }


    if (repassword == "") {
        document.getElementById("repasswordmsg").innerHTML = "Please fill the confirmpassword field";
        return false;
    }
    if (password != repassword) {
        document.getElementById("repasswordmsg").innerHTML = "Password Mismatch";
        return false;
    } else {
        document.getElementById("repasswordmsg").innerHTML = "";

    }
}

let timerOn = true;

function timer(remaining) {
    var m = Math.floor(remaining / 60);
    var s = remaining % 60;

    m = m < 10 ? '0' + m : m;
    s = s < 10 ? '0' + s : s;
    document.getElementById('timer').innerHTML = m + ':' + s;
    remaining -= 1;

    if (remaining >= 0 && timerOn) {
        setTimeout(function () {
            timer(remaining);
        }, 1000);
        return;
    }

    if (!timerOn) {
        // Do validate stuff here
        return;
    }

    // Do timeout stuff here
    document.getElementById('timer').innerHTML = 'OTP expired resend again';
    document.getElementById("otpBtn").disabled = true;

}

timer(120);



$(".otpinput").keyup(function () {
    if (this.value.length == this.maxLength) {
        if(this.value >= 0 || this.value <= 9){
           
            $(this).next('.otpinput').focus();
        }else{
            this.value = ""
        }
    }
});



//===========otp form validation ==============
function validateotp() {

    var first = document.getElementById("first").value;
    var second = document.getElementById("second").value;
    var third = document.getElementById("third").value;
    var fourth = document.getElementById("fourth").value;

    if (first == "" || second == "" || third == "" || fourth == "") {

        document.getElementById('otpfieldempty').innerHTML = 'Enter the OTP';
        setTimeout(() => {
            document.getElementById('otpfieldempty').innerHTML = '';
        }, 10000);
    } else {
        document.getElementById('otpfieldempty').innerHTML = '';

    }
}



//==============preview image ===============

function previewsingle(event) {
    let singleimgformat = document.getElementById("singleimg").value
    let allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;

    var img = document.getElementById("singleimg");
    var imglen = img.files.length;

    if (!allowedExtensions.exec(singleimgformat)) {
        document.getElementById("singlemsg").innerHTML = "Please upload only images."
        singleimg.value = ""
        return false;
    } else {
        document.getElementById("singlemsg").innerHTML = ""
        for (i = 0; i < imglen; i++) {
            var urls = URL.createObjectURL(event.target.files[i]);
            document.getElementById("single").innerHTML += '<img src="' + urls + '">';
        }
    }
}

function previewMultiple(event) {

    let multipleimgformat = document.getElementById("multipleimg").value
    let allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;

    var img = document.getElementById("multipleimg");
    var imglen = img.files.length;

    if (!allowedExtensions.exec(multipleimgformat)) {
        document.getElementById("multiplemsg").innerHTML = "Please upload only images."
        multipleimg.value = ""
        return false;
    } else {
        document.getElementById("multiplemsg").innerHTML = ""
        for (i = 0; i < imglen; i++) {
            var urls = URL.createObjectURL(event.target.files[i]);
            document.getElementById("multiple").innerHTML += '<img src="' + urls + '">';
        }
    }
}

function previewlicence(event) {
    var img = document.getElementById("licenceimg");
    var imglen = img.files.length;
    for (i = 0; i < imglen; i++) {
        var urls = URL.createObjectURL(event.target.files[i]);
        document.getElementById("licence").innerHTML = '<img src="' + urls + '">';
    }
}

function previewProfilePic(event) {
    var img = document.getElementById("img");
    var imglen = img.files.length;
    for (i = 0; i < imglen; i++) {
        var urls = URL.createObjectURL(event.target.files[i]);
        document.getElementById("profile").innerHTML = '<img src="' + urls + '">';
    }
}
//==============preview image ===============


//==============add models form validation========
// function validateAddModel() {
//     var make = document.getElementById("make").value;
//     var type = document.getElementById("type").value;
//     var model = document.getElementById("model").value;
//     var year = document.getElementById("year").value;

//     if (make == "") {
//         document.getElementById('makemsg').innerHTML = 'Input fields must not be empty';
//         return false
//     } else {
//         document.getElementById('make').innerHTML = '';
//     }
//     if (type == "") {
//         document.getElementById('typemsg').innerHTML = 'Input fields must not be empty';
//         return false
//     } else {
//         document.getElementById('typemsg').innerHTML = '';
//     }
//     if (model == "") {
//         document.getElementById('modelmsg').innerHTML = 'Input fields must not be empty';
//         return false
//     } else {
//         document.getElementById('modelmsg').innerHTML = '';
//     }
//     if (year == "") {
//         document.getElementById('yearmsg').innerHTML = 'Input fields must not be empty';
//         return false
//     } else {
//         document.getElementById('yearmsg').innerHTML = '';
//     }
// }



//==============add models form validation========


