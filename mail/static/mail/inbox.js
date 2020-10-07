document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.addEventListener('click', event => {

    let element = event.target;
    
    if (element.className == 'row mails unread' || element.className == 'row mails read'){
      open_mail(element.id, document.querySelector('h3').innerHTML);
    }

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
  })

  // By default, load the inbox
  load_mailbox('inbox');

  document.querySelector('#compose-submit').addEventListener('click', send_email);
});

function fill(id){
  
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    
    // Pre fill input fields
    document.querySelector('#compose-recipients').value = email.sender;

    let subject = email.subject;
    if (subject[0] == 'R' && subject[1] == 'e' && subject[2] == ':'){
      document.querySelector('#compose-subject').value = subject;
    } else {
      subject = "Re: " + subject;
      document.querySelector('#compose-subject').value = subject;
    }

    let body = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
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
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
  .then(response => {
    return response.json()})
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
    console.log("Result:", error);
  })

  .catch(error => {
    console.log(error);
    console.log(message);
  })

}

function get_mails(mailbox){

  // Get mails

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    //Print emails
    console.log(emails);

    for (let i = 0; i < emails.length; i++){

      // Create new element
      const div = document.createElement('DIV');
      div.id = emails[i].id;

      // Assign class if read or unread or mailbox is sent
      if (emails[i].read === false || mailbox == 'sent'){
        div.className = "row mails unread";
      }else{
        div.className = "row mails read";
      }

      const sender = document.createElement('DIV')
      sender.innerHTML = emails[i].sender;
      sender.id = "sender";
      div.append(sender);

      const subject = document.createElement('DIV')
      subject.innerHTML = emails[i].subject
      subject.id = "subject";
      div.append(subject);

      const timestamp = document.createElement('P')
      timestamp.innerHTML = emails[i].timestamp
      timestamp.id = "timestamp";
      div.append(timestamp);

      // Create an a tag element to wrap the div
      const a = document.createElement('a');
      a.className = 'mail';
      a.append(div);

      document.querySelector('#emails-view').append(a);
    }
  })
}

function open_mail(id, mailbox){

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
    // Print email in console
    console.log(email)

    // Create element sender
    let sender = document.createElement('span');
    sender.className = 'content';
    sender.innerHTML = email.sender;

    // Create element(s) for recipients
    for (let i = 0; i < email.recipients.length; i++){
      let recipients = document.createElement('span');
      recipients.className = 'content';
      recipients.innerHTML = email.recipients[i];
      document.querySelector('#email-recipients').append(recipients);
    }

    // Create element for body
    let body = document.createElement('span');
    body.className = 'content';
    body.innerHTML = email.body;

    // Create element subject
    let subject = document.createElement('span');
    subject.className = 'content';
    subject.innerHTML = email.subject;

    // Create element timestamp
    let timestamp = document.createElement('span');
    timestamp.className = 'content';
    timestamp.innerHTML = email.timestamp;

    // Append elements
    document.querySelector('#email-sender').append(sender);
    document.querySelector('#email-body').append(body);
    document.querySelector('#email-subject').append(subject);
    document.querySelector('#email-timestamp').append(timestamp);

    let button = document.querySelector("#archive");

    // Display archive button if Inbox
    if (mailbox == 'Inbox'){

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
    if (mailbox == 'Archive') {

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

  })

  // Mark email as read
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
}

function compose_email() {

  // Clear alerts
  let removealert = document.querySelector('#alert');
  if (removealert != null){
    removealert.remove();
  }

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#open-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  // Clear alerts
  let removealert = document.querySelector('#alert');
  if (removealert != null){
    removealert.remove();
  }
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#open-view').style.display = 'none';
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Get the mails
  get_mails(mailbox)
}