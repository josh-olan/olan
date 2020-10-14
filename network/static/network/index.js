let pagenum = 1;
let csrf = window.CSRF_TOKEN ;
document.addEventListener("DOMContentLoaded", () => {

    load_posts(pagenum);

    document.addEventListener("click", event => { 
        let el = event.target;
        
        if (el.innerHTML == "Save"){
            console.log(el);
            edit(el, "save");
        }

        if (el.id == 'like'){
            like(el);
        }
        if (el.innerHTML == "Edit Post"){
            edit(el, "edit");
        }
    })

    document.querySelector('#page_previous').addEventListener("click", () => { preload("previous"); });
    document.querySelector('#page_next').addEventListener("click", () => { preload("next"); });

    document.querySelector('#addnew').onclick = () => {
        show_new();
        document.querySelector('#post-button').addEventListener("click", submit_post);
    }
})

function preload(action){
    // Remove current posts and display new ones
    let indexEl = document.querySelector('#page_index');
    let els = document.querySelector("#posts-view").children;
    
    for (let i=0; i < els.length; i+1){
        els[i].remove();
        console.log(i);
    }
    if (action == 'next'){
        next(indexEl);
    } else if (action == 'mainpage') {
        load_posts(pagenum);
    } else {
        previous(indexEl);
    }
}

function next(indexEl){

    load_posts(parseInt(indexEl.innerHTML) + 1);
    indexEl.innerHTML = parseInt(indexEl.innerHTML) + 1;
    return false;
}

function previous(indexEl){
    
    load_posts(parseInt(indexEl.innerHTML) - 1);
    indexEl.innerHTML = parseInt(indexEl.innerHTML) - 1;
    return false;
}

function edit(el, action){
    const content_view = el.parentElement.parentElement.children[2];
    let content_element = content_view.children[0];
    let content_textarea = content_view.children[1];
    let text = content_element.innerHTML;

    // Hide text and display textarea
    if (action == "edit"){
        content_element.style.display = 'none';
        content_textarea.style.display = 'block';
        el.innerHTML = 'Save';

        content_textarea.innerHTML = text;
    } else {

        // save
        fetch('/edit', {
            method : 'PUT',
            headers: {
                'X-CSRFToken': csrf,
            },
            body : JSON.stringify({
                "post_id": el.dataset.post_id,
                "post_content": content_textarea.value
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // Update text
            content_element.innerHTML = data.content;

            content_element.style.display = 'block';
            content_textarea.style.display = 'none';
            el.innerHTML = 'Edit Post';
        })
    }
}

function like(image_element){
    console.log(image_element)
    // Like or unlike a page
    const parent = image_element.parentElement;
    if (image_element.alt == "unlike button"){

        // Like
        fetch("/like", {
            method: 'PUT',
            headers: {
                'X-CSRFToken': csrf,
            },
            body: JSON.stringify({
                "action": "like",
                "post_id": image_element.dataset.post_id
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data)

            // Update the likes count
            parent.parentElement.children[6].innerHTML = `${data.likes_count} likes`;
            image_element.src = '/static/network/like.png';
            image_element.alt = "like button";
        })
    } else {

        // Unlike
        fetch("/like", {
            method: 'PUT',
            headers: {
                'X-CSRFToken': csrf,
            },
            body: JSON.stringify({
                "action": "unlike",
                "post_id": image_element.dataset.post_id
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data)

            // Update the likes count
            parent.parentElement.children[6].innerHTML = `${data.likes_count} likes`;
            image_element.src = '/static/network/unlike.png'
            image_element.alt = "unlike button";
        })
    }

}

function submit_post(event){

    let el = document.querySelector('#alerter');
    if (el != null){
        el.remove();
    }

    // Submits a New Post
    event.preventDefault();

    let post = document.querySelector('#post-textarea').value;
    fetch('/post', {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrf,
        },
        body: JSON.stringify({
            "post": post
        })
    })
    .then(response => response.json())
    .then(data => {
        show_new();
    })

    let alert = document.createElement('div');
    alert.className = "alert alert-success";
    alert.role = "alert";
    alert.id = "alerter";
    alert.innerHTML = "Posted!";

    setTimeout(() => { 
        document.querySelector('#body').insertBefore(alert, document.querySelector('#posts-view')); 
    }, 1000);

    preload("mainpage");

    setTimeout(() => { document.querySelector('#alerter').style.display = 'none'; }, 3000);
}

function load_posts(pagenum){

    // Load all posts

    // Hide add new post field if not first page
    if (pagenum != 1){
        document.querySelector('#addnew').style.display = 'none';
    } else {
        document.querySelector('#addnew').style.display = '';
    }

    fetch(`/loadposts/${pagenum}`)
    .then(response => response.json())
    .then(data => {
        
        let page_has_next = false
        let page_has_previous = false

        for (let i=0; i < 10 && i < data.posts[0].length; i++){

            // Create div
            const posts = document.createElement('div');
            posts.className = "posts";

            // Create username elements
            const username = document.createElement("a");
            username.href = `/user/${data.posts[0][i].poster}`;
            const usernameText = document.createElement("span");
            usernameText.className = "username";
            usernameText.innerHTML = data.posts[0][i].poster;
            username.append(usernameText);

            // Create hr element
            const hr_1 = document.createElement("hr");

            // Create div for content
            const div_content = document.createElement("div");
            div_content.className = "content";

            const edit_textarea = document.createElement("textarea");
            edit_textarea.id = "edit_textarea";
            edit_textarea.style.display = 'none';

            const p_content = document.createElement("p");
            p_content.innerHTML = data.posts[0][i].post;
            div_content.append(p_content);
            div_content.append(edit_textarea);

            // Create element for timestamp
            const p_time = document.createElement("p");
            p_time.className = "timestamp";
            p_time.innerHTML = data.posts[0][i].time;

            // Create second hr element
            const hr_2 = document.createElement("hr");

            // Create element for image as button
            const image = document.createElement("a");
            image.id = "like_a";

            // Create element for image
            const img = document.createElement("img");
            img.className = "like-icon"

            // if current user has liked the current post
            if (data.posts[0][i].liked == false){
                img.src = "/static/network/unlike.png";
                img.alt = "unlike button";
            } else {
                img.src = "/static/network/like.png";
                img.alt = "like button";
            }

            img.id = "like";
            img.dataset.post_id = data.posts[0][i].post_id;
            image.append(img);

            // Create element for likes 
            const likes = document.createElement("span");
            likes.className = "likes-count";
            likes.innerHTML = `${data.posts[0][i].likes_count} likes`;

            // Create element for 'Edit post' button
            const edit_post = document.createElement('div');
            
            // If the current user is the poster, display Edit button
            if (data.posts[0][i].current_user == data.posts[0][i].poster){

                const edit_button = document.createElement("button");
                edit_button.className = "btn btn-sm btn-outline-dark edit";
                edit_button.innerHTML = "Edit Post";
                edit_button.dataset.post_id = data.posts[0][i].post_id;
                edit_post.append(edit_button);
            }

            // Append elements to the container div
            posts.append(username, hr_1, div_content, p_time, hr_2, image, likes, edit_post);

            // Append contaianer div to body
            document.querySelector("#posts-view").append(posts);

            page_has_next = data.posts[1].has_next;
            page_has_previous = data.posts[2].has_previous;
        }

        // If no next page or previous, disable buttons

        if (page_has_next == false){
            document.querySelector('#page_next').style.display = 'none';
        } else {
            document.querySelector('#page_next').style.display = 'block';
        }
        if (page_has_previous == false){
            document.querySelector('#page_previous').style.display = 'none';
        } else {
            document.querySelector('#page_previous').style.display = 'block';
        }

    })
}
function show_new(){

    document.querySelector("#post-textarea").value = "";
    
    // Shows and hides the New Post page
    let new_post = document.querySelector('#new-post');
    let new_post_button = document.querySelector('#addnew');

    let replace_new_post = new_post.cloneNode(true);
    new_post.parentNode.replaceChild(replace_new_post, new_post);

    new_post = replace_new_post
    new_post.style.animationPlayState = 'paused';

    if (new_post_button.innerHTML == "Add New Post"){
        new_post.style.animationDirection = 'normal';
        new_post.style.animationDuration = '150ms';
        new_post.style.animationPlayState = 'initial';
        new_post.style.display = 'block';
        new_post_button.innerHTML = "Close";
        new_post.addEventListener("animationend", () => {
            new_post.style.animationPlayState = 'paused';
        });
    } else {
        new_post.style.animationDirection = "reverse";
        new_post.style.animationDuration = "0.3s";
        new_post.style.animationPlayState = "initial";
        new_post.addEventListener("animationend", () => {
            new_post.style.display = 'none';
            new_post.style.animationPlayState = 'paused';
        });
        new_post_button.innerHTML = "Add New Post";
    }
}
