document.addEventListener("DOMContentLoaded", () => {

    if (document.title == 'Index'){
        check_position();
        window.addEventListener('scroll', check_position);
    }
    if (document.title == 'Register'){

        // For the register page
        document.querySelector('#register_button').addEventListener("click", validate);
        document.querySelector('#register_second').style.display = 'none';
        document.querySelector('#register_first').append(document.querySelector('#register_div'));
    }
    if (document.title == 'Login'){
        
        // For the Login page
        const button = document.querySelector('#login_btn');
        button.type = "submit";
        document.querySelector("#login_form").addEventListener("submit", event => { checks(event) });

        //Hide the Forgot password view
        document.querySelector('#change_pword_view').style.display = "none";
        document.querySelector('#forgot_pword').addEventListener("click", change_view);
        document.querySelector('#change_pword_form').addEventListener("submit", change_password);
        document.querySelector('#continue').addEventListener("click", check_details_next);
    }

    if (document.title != 'My Accounts'){

        // Change the background colour and colour of footer if not My Accounts page
        let footer = document.querySelector('.footer1');
        if (footer != null){
            footer.style.backgroundColor = "rgb(6, 95, 122)";
            footer.style.color = "white";
        }
    }

    document.querySelector('#toggler').addEventListener("click", change_menu_style);
})


function checks(event){
    
    event.preventDefault();

    const username = document.querySelector("#lusername").value;
    const password = document.querySelector("#lpassword").value;
    const confirmation = document.querySelector('#lconfirmation').value;
    const parent = document.querySelector("#login");
    
    if (username == ""){
        // IF the username field is blank
        display_message("error", "Username field cannot be blank!");
        return false;
    }
    if (password == ""){
        // If the password field is blank
        display_message("error", "Password field cannot be blank!");
        return false;
    }
    if (confirmation == ""){
        // If the confirmation field is blank
        display_message("error", "Password confirmation field cannot be blank!");
        return false;
    }
    if (password != confirmation){
        // If the password fields values do not match
        display_message("error", "Passwords do not match!");
        return false;
    }

    document.querySelector('#login_form').submit();
}


function validate(){

    const firstname = document.querySelector('#firstname');
    const lastname = document.querySelector('#lastname');
    const username = document.querySelector('#username');
    const email = document.querySelector('#email');
    const password = document.querySelector('#password').value;
    const confirmation = document.querySelector('#confirmation').value;
    const answer = document.querySelector('#recover').value;

    let registerbtn = document.querySelector('#register_button');

    if (registerbtn.innerHTML == 'Create Account'){

        const parent = document.querySelector('#register_second');

        // If any of the fields are blank
        if (password == ""){
            display_message("error", "Password field cannot be blank!")
            return false;
        }
        if(confirmation == ""){
            display_message("error", "Password confirmation field cannot be blank!")
            return false;
        }
        if (password != confirmation){
            display_message("error", "Passwords do not match!")
            return false;
        }
        if (answer == ""){
            display_message("error", "Answer field cannot be blank!");
            return false;
        }
        for (let i=0; i < answer.length; i++){
            if (Number.isInteger(parseInt(answer[i])) == true){
                display_message("error", "Security answer must contain only text!");
                return false;
            }
        }
        registerbtn.type = "submit";
        registerbtn.click();

    } else {

        if (firstname.value == ""){
            
            // Throw an error if field is blank
            display_message("error", "Firstname field cannot be blank!")
            return false;
        }
        if (lastname.value == ""){
            
            // Throw an error if last name field is blank
            display_message("error", "Lastname field cannot be blank!")
            return false;
        }
        if (username.value == ""){
            
            // Throw an error if username field is blank
            display_message("error", "Username field cannot be blank!")
            return false;
        }
        if (email.value == ""){
            
            // Throw an error if email address field is blank
            display_message("error", "Email address field cannot be blank!")
            return false;
        }
        // Check if email is valid
        if (email.value.includes(".") == false || email.value.includes("@") == false){
            display_message("error", "Please enter a valid email address!")
            return false;
        }

        // Check if the username exists
        fetch(`/confirm/${username.value}`)
        .then(response => response.json())
        .then(data => {
            // Display error if exists
            if (data.error != undefined){
                throw new Error(data.error)
            }

            // Switch views
            document.querySelector('#register_first').style.display = 'none';
            document.querySelector('#register_second').style.display = 'block';
            document.querySelector('#register_second').append(document.querySelector('#register_div'));
            document.querySelector('#register_button').innerHTML = "Create Account";
        })
        .catch(error => {
            display_message("error", error);
        })
    }
}


function clearfields(){

    // Clears all input fields in a page
    document.querySelectorAll('input[type="text"], input[type="number"], input[type="password"]').forEach(input =>{
        input.value = '';
    })
}


function display_message(error, message){
    /* 
    Displays modal messages 
    */

    // Remove icon
    let if_image = document.querySelector('#modallabel>img');
    if (if_image != null){
        if_image.remove()
    }

    // Throw error
    if (error != null){
        // Update message
        document.querySelector(".modal-header").style.backgroundColor = "rgb(235, 129, 129)";
        document.querySelector(".modal-body").style.color = "red";

        let img = document.createElement("img");
        img.src = "/static/bankofjosh/erroricon.png";
        img.alt = "Error icon";
        img.className = "ic d-inline-block";

        document.querySelector("#modallabel").insertBefore(img, 
            document.querySelector("#modallabel").firstChild);
        document.querySelector("#modallabel>span").innerHTML = "ERROR";
    } else {
        document.querySelector(".modal-header").style.backgroundColor = "rgb(129, 235, 156)";
        document.querySelector(".modal-body").style.color = "black";

        let img = document.createElement("img");
        img.src = "/static/bankofjosh/successicon.png";
        img.alt = "Success icon";
        img.className = "ic d-inline-block";

        document.querySelector("#modallabel").insertBefore(img, 
            document.querySelector("#modallabel").firstChild);
        document.querySelector("#modallabel>span").innerHTML = "SUCCESS";
    }
    document.querySelector('.modal-body').innerHTML = message;
    document.querySelector('#modal_btn').click();
}


function change_view(){
    let p = document.querySelector('#change_pword_view');
    p.querySelector("#view_two").style.display = "none";
    p.style.display = "block";
    document.querySelector("#login_view").style.display = "none";
}


function check_details_next(){
    /*
    Changes the change password view
    */

    let username = document.querySelector('#vusername').value;
    let email = document.querySelector('#vemail').value;

    if (username == "" || email == ""){
        display_message("error", "Field cannot be blank!")
        clearfields();
        return false;
    }

    // Check details in the backend
    fetch('/get_user', {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrf
        },
        body: JSON.stringify({
            "username": username,
            "email": email
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error != undefined){
            throw new Error(data.error)
        }
        // Update the security question
        let sec = document.querySelector('#security');

        if (data == "maiden"){
            sec.innerHTML = "What is your mother's maiden name?";
        } else if (data == "city"){
            sec.innerHTML = "What city were you born?";
        } else if (data == "place"){
            sec.innerHTML = "What was your favourite place to visit as a child?";
        } else {
            sec.innerHTML = "What is your favourite movie?";
        }

        // Change the view
        document.querySelector('#view_one').style.display = "none";
        document.querySelector('#view_two').style.display = "block";
    })
    .catch(error => {
        display_message("error", error);
        clearfields();
    })

}


function change_password(event){
    /*
    Change the user's password
    */
   event.preventDefault();
   let username = document.querySelector('#vusername').value;
   let answer = document.querySelector('#vanswer').value;
   let password = document.querySelector('#vpassword').value;
   let confirmation = document.querySelector('#vconfirmation').value;

   if (password != confirmation){
       display_message("error", "Passwords do not match!");
       clearfields();
       return false
   }

   for (let i=0; i < answer.length; i++){
        if (Number.isInteger(parseInt(answer[i])) == true){
            display_message("error", "Security answer must contain only text!");
            return false;
        }
    }

   fetch("/change_password", {
       method: 'POST',
       headers: {
           "X-CSRFToken": csrf,
       },
       body: JSON.stringify({
           "username": username,
           "answer": answer,
           "password": password
       })
   })
   .then(response => response.json())
   .then(data => {
       if (data.error != undefined){
           throw new Error(data.error)
       }
       display_message(null, data.message);

       // Update the url 
       let form = document.querySelector('#change_pword_form');
       form.action = "/login";

       // Remove the event listener
       form.removeEventListener("submit", change_password);

       // click the submit button
       document.querySelector('#change_btn').click();
   })
   .catch(error =>{
       display_message("error", error);
   })
}


function change_menu_style(){
    /*
    Change the styling of the menu text
    */
    //document.querySelector('#menu').style.color = "white";
    document.querySelector('#menu').style.backgroundColor = "#888888";
    document.querySelectorAll('#menu>li').forEach(e => {
        e.style.textAlign = "center";
    })
    
}

function check_position(){
    /*
    Adds the fade in element for elements
    */
   document.querySelectorAll('.hide').forEach(el => {
       let positionFromTop = el.getBoundingClientRect().top;
       let height = window.innerHeight;

       if (positionFromTop - height <= 0){
           el.classList.add('f-in');
           el.classList.remove('hide');
       }
   })
}