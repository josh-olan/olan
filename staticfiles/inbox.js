document.addEventListener('DOMContentLoaded', function() {
  
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#search-form').addEventListener('submit', search);

  // Toggle between views
  document.querySelector('#inbox2').addEventListener('click', () => {
    load_mailbox('inbox');
    close_menu();
  });
  document.querySelector('#sent2').addEventListener('click', () => {
    load_mailbox('sent');
    close_menu();
  });
  document.querySelector('#archived2').addEventListener('click', () => {
    load_mailbox('archive');
    close_menu();
  });
  document.querySelector('#compose2').addEventListener('click', () => {
    compose_email();
    close_menu();
  });
  
  document.addEventListener('click', event => {

    let element = event.target;
    // If Archive/Unarchive button was clicked
    if (element.id === 'archive'){
      if (element.innerHTML === 'Archive'){
        archive(element.dataset.emailid);
      }else{
        unarchive(element.dataset.emailid);
      }
    }

    // If Reply button was clicked
    if (element.id == 'reply'){
      
      compose_email();
      fill(element.dataset.emailid);
    }

    // If Menu view is displayed, hide it
    let menu = document.querySelector('#menu_view');
    if (menu.style.display == "block" && !menu.contains(element) && 
      !document.querySelector("#menu_icon").contains(element)){
      menu.style.display = "none";
    }
  })

  // By default, load the inbox
  load_mailbox('inbox');
  
  //Refresh count of unread inboxes
  setInterval(() => {
    update_unread_inbox_count();
  }, 10000);

  window.addEventListener("resize", adjustHeight);
  window.addEventListener("resize", loading);
  window.addEventListener("resize", media);

  document.querySelector('#compose-form').addEventListener('submit', send_email);
  media();
});


function adjustHeight(){
  /*
  Adjusts height of Email view
  */
 if (document.querySelector('#emails-view') != undefined){
    if (window.innerHeight <= 900){
      document.querySelector('#emails-view').style.height = 
      `${window.innerHeight - 100}px`;

      if (document.querySelector('#emails-view>div')){
      document.querySelector('#emails-view>div').style.height =
      `${window.innerHeight - 150}px`;
      }

      document.querySelector('#compose-view').style.height = 
      `${window.innerHeight - 100}px`;
      document.querySelector('#open-view').style.height = 
      `${window.innerHeight - 100}px`;
    } else {
      document.querySelector('#emails-view').style.height = 
      `${window.innerHeight - 200}px`;

      if (document.querySelector('#emails-view>div')){
        document.querySelector('#emails-view>div').style.height =
      `${window.innerHeight - 250}px`;
      }

      document.querySelector('#compose-view').style.height = 
      `${window.innerHeight - 200}px`;
      document.querySelector('#open-view').style.height = 
      `${window.innerHeight - 200}px`;
    }
 }
}


function fill(id){
  
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    
    // Pre fill input fields
    document.querySelector('#compose_recipients').value = email.sender;

    let subject = email.subject;
    if (subject[0] == 'R' && subject[1] == 'e' && subject[2] == ':'){
      document.querySelector('#compose-subject').value = subject;
    } else {
      subject = "Re: " + subject;
      document.querySelector('#compose-subject').value = subject;
    }

    let body = `\n\n-------------------\nOn ${email.timestamp} ${email.sender} wrote: ${email.body}`;
    document.querySelector('#compose-body').value = body;
  })
}


function archive(id){

  // Archive email
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })
  location.reload();
}


function unarchive(id){

  // Unarchive email
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  })
  location.reload();
}


function send_email(event){

  // Stop page from reloading
  event.preventDefault();

  // Send email
  fetch('emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose_recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {

    //Print result
    let errormessage = result.error;
    let feedback = result.message;

    let alert = document.createElement('div');
    alert.role = 'alert';
    alert.id = 'alert';

    if (result.error == undefined) {

      // Alert successfully sent
      alert.className = 'alert alert-success';
      alert.innerHTML = feedback;
      document.querySelector('#message').append(alert);

      setTimeout( () => { load_mailbox('sent'); }, 2000);
      //setTimeout(load_mailbox('sent'), 2000);
    }

    if (feedback == undefined){
      
      // Alert error if not sent
      alert.className = 'alert alert-danger';
      alert.innerHTML = errormessage;
      document.querySelector('#message').append(alert);

      // Reload the compose email view
      setTimeout(compose_email, 2000);

    } 
    document.querySelector('.alert').scrollIntoView();
  })

  .catch(error => {
    console.log(error);
  })

}

var mail;
function search(event){
  /*
  Search for Emails
  */

  event.preventDefault();
  let parameter = document.querySelector('#search_field').value;
  let filter = document.querySelector('#search_filter').value;
  let mailbox = document.querySelector('#emails-view>h5').innerText.toLowerCase();

  loading("display");
  
  if (mailbox == "search results"){
    mailbox = mail;
  } else {
    mail = mailbox;
    console.log(mail);
  }

  fetch('/search', {
    method: 'POST',
    headers: {
      'X-CSRFToken': csrf
    },
    body: JSON.stringify({
      "parameter": parameter,
      "filter": filter,
      "mailbox": mailbox,
    })
  })
  .then(response => response.json())
  .then(emails =>{

    // Show only the emails view
    document.querySelector('#open-view').style.display = "none";
    document.querySelector('#compose-view').style.display = "none";
    document.querySelector('#emails-view').style.display = "block";

    let parent = document.querySelector('#emails-view');

    // Remove the current content
    document.querySelector('#emails-view').innerHTML = "";

    // Create H5 element
    let heading = document.createElement("h5");
    heading.innerText = "Search Results";
    parent.append(heading);

    // If array is empty
    if (emails.length == 0){
      parent.append(`No email matching your search 
                    criteria in your ${mailbox[0].toUpperCase() 
                      + mailbox.slice(1, mailbox.length)} mailbox.`);
    } else {

      var next_to_parent;
      var all_mails_holder = [];
      for (let i = 0; i < emails.length; i++){

        let e = emails[i];
        next_to_parent = document.createElement("DIV");
        const container = document.createElement("DIV");
        const row = document.createElement('DIV');
        const left_side = document.createElement("DIV");
        const right_side = document.createElement("DIV");
        const holder = document.createElement("SPAN");
        const img_holder = document.createElement("DIV");
        const br1 = document.createElement("BR");
        const br2 = document.createElement("BR");
        const span1 = document.createElement("SPAN");
        const span2 = document.createElement("SPAN");
        const span3 = document.createElement("SPAN");
        const span4 = document.createElement("SPAN");
        const img = document.createElement("SPAN");

        container.className = "container-fluid a_mail";
        container.dataset.id = e.id;
        container.dataset.mailbox = mailbox;

        if (e.read == true){
          row.className = "row each_mail a_mail read";
        } else {
          row.className = "row each_mail a_mail unread";
        }
        left_side.className = "col left_side a_mail";
        right_side.className = "col right_side a_mail";

        span1.innerHTML = e.sender_name;
        span1.className = "sender a_mail";
        span2.className = "subject a_mail";
        span4.innerHTML = e.timestamp;
        span3.className = "i_content a_mail";
        span4.className = "timestamp a_mail";
        holder.style.display = "inline-block";
        holder.style.marginLeft = "35px";
        img_holder.id = "left_img_holder";

        img.id = "left_img";
        img.innerText = e.sender_name[0];
        img.style.backgroundColor = e.background_color;

        if (e.body.length >= 40){
          span3.innerHTML = e.body.slice(0, 40) + "...";
        } else {
          span3.innerHTML = e.body;
        }

        if (e.subject.length >= 30){
          span2.innerHTML = e.subject.slice(0, 30) + "...";
        } else {
          span2.innerHTML = e.subject;
        }

        img_holder.append(img);
        holder.append(span1, br1, span2, br2, span3);
        left_side.append(img_holder, holder);
        right_side.append(span4);
        row.append(left_side, right_side);
        container.append(row);

        all_mails_holder.push(container);
      }

      for (let i = 0; i < all_mails_holder.length; i++){
        next_to_parent.appendChild(all_mails_holder[i]);
      }

      if (next_to_parent){
        parent.append(next_to_parent);
      }

      var ls = [];
      document.querySelectorAll('.a_mail').forEach(el => {
        for (let i = 0; i < 3; i++){
          let p = el.parentElement;
          if (el.classList.contains("each_mail") && !(ls.includes(p))){
            p.addEventListener("click", () => {
              open_mail(p.dataset.id, p.dataset.mailbox);
            })
            ls.push(p);
          } else {
            el = p;
          }
        }
      })
    }
    loading("hide");
  })
  .catch(error => {
    console.log(error);
  })
}


function get_mails(mailbox){

  loading("display");

  // Get mails
  var unread_count = 0;
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    
    // If no email
    if (emails.length == 0 && document.querySelector('#placeholder_text') == undefined){
      let text = "You have no email."
      let t = document.createElement('p');
      t.id = "placeholder_text";
      t.innerHTML = text;
      document.querySelector('#emails-view').append(t);
    } else {
      
      if (emails.length != 0 && document.querySelector('#placeholder_text') != undefined){
        document.querySelector('#placeholder_text').remove();
      }
    }

    var next_to_parent;
    var all_mail_holder = [];
    for (let i = 0; i < emails.length; i++){

      let e = emails[i];
      next_to_parent = document.createElement("DIV");
      const container = document.createElement("DIV");
      const row = document.createElement('DIV');
      const left_side = document.createElement("DIV");
      const right_side = document.createElement("DIV");
      const holder = document.createElement("SPAN");
      const img_holder = document.createElement("DIV");
      const br1 = document.createElement("BR");
      const br2 = document.createElement("BR");
      const span1 = document.createElement("SPAN");
      const span2 = document.createElement("SPAN");
      const span3 = document.createElement("SPAN");
      const span4 = document.createElement("SPAN");
      const img = document.createElement("SPAN");

      container.className = "container-fluid a_mail";
      container.dataset.id = e.id;
      container.dataset.mailbox = mailbox;

      if (e.read == true){
        row.className = "row each_mail a_mail read";
      } else {
        row.className = "row each_mail a_mail unread";
        unread_count ++;
      }
      left_side.className = "col left_side a_mail";
      right_side.className = "col right_side a_mail";

      span1.innerHTML = e.sender_name;
      span1.className = "sender a_mail";
      span2.className = "subject a_mail";
      span4.innerHTML = e.timestamp;
      span3.className = "i_content a_mail";
      span4.className = "timestamp a_mail";
      holder.style.display = "inline-block";
      holder.style.marginLeft = "35px";
      img_holder.id = "left_img_holder";

      img.id = "left_img";
      img.innerText = e.sender_name[0];
      img.style.backgroundColor = e.background_color;

      if (e.body.length >= 30){
        span3.innerHTML = e.body.slice(0, 30) + "...";
      } else {
        span3.innerHTML = e.body;
      }

      if (e.subject.length >= 20){
        span2.innerHTML = e.subject.slice(0, 20) + "...";
      } else {
        span2.innerHTML = e.subject;
      }

      img_holder.append(img);
      holder.append(span1, br1, span2, br2, span3);
      left_side.append(img_holder, holder);
      right_side.append(span4);
      row.append(left_side, right_side);
      container.append(row);

      all_mail_holder.push(container);
    }

    // Update the count of unread emails
    if (mailbox == "inbox"){
      let s = document.querySelector('#inbox>li>span');
      let s_two = document.querySelector('#inbox2>li>span');
      s.innerHTML = unread_count;
      s_two.innerHTML = unread_count;
      s.style.fontWeight = "700";
      s_two.style.fontWeight = "700";
    }

    // Append all the elements to the holder element
    for (let i = 0; i < all_mail_holder.length; i++){
      next_to_parent.appendChild(all_mail_holder[i]);
    }

    // Append the holder element to the body if not undefined
    if (next_to_parent){
      document.querySelector('#emails-view').append(next_to_parent);
    }

    var ls = [];
    document.querySelectorAll('.a_mail').forEach(el => {
      for (let i = 0; i < 3; i++){
        let p = el.parentElement;
        if (el.classList.contains("each_mail") && !(ls.includes(p))){
          p.addEventListener("click", () => {
            open_mail(p.dataset.id, p.dataset.mailbox);
          })
          ls.push(p);
        } else {
          el = p;
        }
      }
    })
    adjustHeight();
    loading("hide");
  })
}


function update_unread_inbox_count(){

  var counter = 0;
  fetch("/emails/inbox")
  .then(response => response.json())
  .then(emails => {
    
    for (let i = 0; i < emails.length; i++){
      let e = emails[i];
      if (!e.read){
        counter++;
      }
    }
    localStorage.setItem("count", counter.toString());

    let s = document.querySelector('#inbox>li>span');
    let s_two = document.querySelector('#inbox2>li>span');

    if (parseInt(localStorage.getItem("count")) != parseInt(s.innerHTML)){
      console.log(parseInt(localStorage.getItem("counter")));
      console.log(parseInt(s.innerHTML));
      s.innerHTML = counter;
      s_two.innerHTML = counter;
      s.style.fontWeight = "700";
      s_two.fontWeight = "700";

      let emails_view = document.querySelector('#emails-view');
      //Update inbox if the user is view
      if (emails_view.style.display == "block" && emails_view.querySelector("h5")){
        if (emails_view.querySelector('h5').innerText == "Inbox"){
          load_mailbox("inbox");
        }
      }
    }
  })
  .catch(error => {
    console.log(error);
  })
}


function open_mail(id, mailbox){

  loading("display");

  // Close search view if displayed
  let icon = document.querySelector('#search_icon');
  let s = document.querySelector('#search_div');
  icon.style.visibility = "hidden";
  if (icon.style.visibility == "visible" && s.style.display == "block"){
      s.style.display = "none";
  }

  // Display open email view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#open-view').style.display = 'block';

  // Clear former content
  document.querySelectorAll('.content').forEach(el => {
    el.innerHTML = '';
  })

  // Get mail content
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    console.log(email);

    // Create element sender
    let sender = document.createElement('span');
    sender.className = 'content';
    sender.innerText = `${email.sender_name} (${email.sender})`;

    // Create element(s) for recipients
    for (let i = 0; i < email.recipients.length; i++){
      let recipients = document.createElement('span');
      recipients.className = 'content';
      recipients.innerText = `${email.recipients_names[i]} (${email.recipients[i]})`;
      document.querySelector('#email-recipients').append(recipients);
    }

    // Create element for body
    let body = document.createElement('span');
    body.className = 'content';
    body.innerText = email.body;

    // Create element subject
    let subject = document.createElement('span');
    subject.className = 'content';
    subject.innerText = email.subject;

    // Create element timestamp
    let timestamp = document.createElement('span');
    timestamp.className = 'content';
    timestamp.innerText = email.timestamp;

    // Append elements
    document.querySelector('#email-sender').append(sender);
    document.querySelector('#email-body').append(body);
    document.querySelector('#email-subject').append(subject);
    document.querySelector('#email-timestamp').append(timestamp);

    let button = document.querySelector("#archive");

    // Display archive button if Inbox
    if (mailbox == 'inbox'){

      if (button != undefined && button != null){

        button.innerHTML = "Archive";
        button.dataset.emailid = email.id;

      } else {
        let btn = document.createElement('button');
        btn.className = "btn btn-sm btn-outline-primary";
        btn.id = "archive";
        btn.dataset.emailid = email.id;

        btn.innerHTML = "Archive";
        // Append to the page
        document.querySelector('#email-abutton').append(btn);
      }
    }

    // Display unarchive button if Archive mailbox
    if (mailbox == 'archive') {

      if (button != undefined && button != null){

        button.innerHTML = "Unarchive";
        button.dataset.emailid = email.id;

      } else {
        let btn = document.createElement('button');
        btn.className = "btn btn-sm btn-outline-primary";
        btn.id = "archive";
        btn.dataset.emailid = email.id;
        btn.innerHTML = "Unarchive";

        // Append to the page
        document.querySelector('#email-abutton').append(btn);
      }
    }

    // Add a Reply button to the page if nonexistent
    let reply_btn = document.querySelector('#reply');
    if (reply_btn == undefined || reply_btn == null){

      const reply = document.createElement('button');
      reply.id = "reply";
      reply.innerHTML = "Reply";
      reply.dataset.emailid = email.id;
      reply.className = "btn btn-sm btn-outline-primary";

      document.querySelector('#email-reply').append(reply);
    } else {

      // Update the email id
      reply_btn.id = "reply";
      reply_btn.dataset.emailid = email.id;
    }

    // Reply button alone if Sent mailbox
    if (mailbox == 'Sent'){

      if (button != null && button != undefined){
        
        // Remove the archive button
        button.remove();
      }

      reply_btn.id = "reply";
    }
    loading("hide");
  })

  // Mark email as read
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
  .then(a => {
    update_unread_inbox_count();
  })
}


function compose_email() {

  // Clear alerts
  let removealert = document.querySelector('#alert');
  if (removealert != null){
    removealert.remove();
  }

  // Hide the search field
  document.querySelector('#search_div').style.visibility = "hidden";

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#open-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose_recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  document.querySelector('#search_icon').style.visibility = "hidden";
}


function load_mailbox(mailbox) {

  // Clear alerts
  let removealert = document.querySelector('#alert');
  if (removealert != null){
    removealert.remove();
  }
  
  // Hide the search field
  document.querySelector('#search_div').style.visibility = "visible";

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#open-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = 
  `<h5>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h5>`;

  // Get the mails
  get_mails(mailbox);

  media();
}


function loading(action){
  /*
  Implements the loading sign
  */
  let loading = document.querySelector('#loading'); 
  let body = document.querySelector('#container-fluid');

  if (action == "display"){
    body.style.visibility = "hidden"; 
    let nav = document.querySelector('#nav');
    let top = ((window.innerHeight - loading.getBoundingClientRect().height) / 2) 
      - nav.getBoundingClientRect().height;

    loading.style.top = `${top}px`;
    loading.style.display = "block";
  } else {
    loading.style.display = "none";
    body.style.visibility = "visible";
  }
}


function media(){
  /*
  Runs media queries
  */
  let menu = document.querySelector('#menu_icon');
  if (window.innerWidth <= 1000){
    menu.style.visibility = "visible";
    menu.addEventListener("click", show_options);
  } else {
    menu.style.visibility = "hidden";
    document.querySelector('#menu_view').style.display = "none";
    try {
      menu.removeEventListener("click", show_options);
    } catch (error) {}
  }

  let icon = document.querySelector('#search_icon');
  let search = document.querySelector('#search_div');
  let emails = document.querySelector("#emails-view");
  let compose = document.querySelector("#compose-view");
  let open = document.querySelector('#open-view');

  if (window.innerWidth <= 638){
    search.style.display = "none";
    icon.style.visibility = "visible";
    emails.style.marginTop = "30px";
    compose.style.marginTop = "30px";
    open.style.marginTop = "30px";
    icon.addEventListener("click", show_search);
  } else {
    search.style.display = "block";
    icon.style.visibility = "hidden";
    emails.style.marginTop = "0px";
    compose.style.marginTop = "0px";
    open.style.marginTop = "0px";
    try {
      icon.removeEventListener("click", show_search);
    } catch (error) {}
  }

}

function show_options(){
  /*
  Shows mailboxes
  */
  let menu = document.querySelector('#menu_view').style;
  menu.animationDirection = "normal";
  menu.animationPlayState = "initial";
  menu.animationDuration = "200ms";

  if (menu.display == "none" || menu.display == ""){
    menu.display = "block";
  } else {
    menu.animationDirection = "reverse";
    menu.animationPlayState = "running";
    menu.animationDuration = "300ms";
    setTimeout(()=> {menu.display = "none"; }, 300);
  }
}

function show_search(){
  /*
  Displays seach view
  */
 let search = document.querySelector('#search_div');

  // Remove the animation class if not already there
 if (search.classList.contains("ds")){
   search.classList.remove("ds");
 }

 if (search.style.display == "none" || search.style.display == ""){
    search.classList.add("ds");
    search.style.display = "block"
 } else {
    search.style.display = "none";
    search.querySelector('input').value = "";
    search.querySelector('select').value = "";
 }
}


function close_menu(){
  document.querySelector('#menu_icon').click();
}