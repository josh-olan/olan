let pagenum = 1;
let csrf = window.CSRF_TOKEN ;
document.addEventListener("DOMContentLoaded", () => {
    load_content(pagenum);

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

    document.querySelector('#profile-followbtn').addEventListener("click", follow);

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
    } else {
        previous(indexEl);
    }
}

function next(indexEl){

    load_content(parseInt(indexEl.innerHTML) + 1);
    indexEl.innerHTML = parseInt(indexEl.innerHTML) + 1;
    return false;
}

function previous(indexEl){
    
    load_content(parseInt(indexEl.innerHTML) - 1);
    indexEl.innerHTML = parseInt(indexEl.innerHTML) - 1;
    return false;
}

function edit(el, action){
    const content_view = el.parentElement.parentElement.children[0];
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
            parent.parentElement.children[4].innerHTML = `${data.likes_count} likes`;
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
            parent.parentElement.children[4].innerHTML = `${data.likes_count} likes`;
            image_element.src = '/static/network/unlike.png'
            image_element.alt = "unlike button";
        })
    }

}

function follow(){

    // Change the inner text of the Follow button
    let followbtn = document.querySelector('#profile-followbtn');
    const username = document.querySelector('#profile-username').innerHTML;

    if (followbtn.innerHTML == 'Follow'){

        fetch(`/follow`, {
            method: 'PUT',
            headers: {
                'X-CSRFToken': csrf,
            },
            body: JSON.stringify({
                username: username,
                action: "follow"
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message)

            update(data.followers, data.following);
        })
        .catch(error => {
            console.log(error)
        })

        followbtn.innerHTML = 'Unfollow';
    } else {

        fetch(`/follow`, {
            method: 'PUT',
            headers: {
                'X-CSRFToken': csrf,
            },
            body: JSON.stringify({
                username: username,
                action: "unfollow"
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);

            update(data.followers, data.following);
        })

        followbtn.innerHTML = 'Follow';
    }
}

function update(followers_count, following_count){

    // Update followers and following count
    let followers = document.querySelector('#profile-followers');
    let following = document.querySelector('#profile-following');

    if (followers_count == 1){
        followers.innerHTML = "1 follower";
    } else {
        followers.innerHTML = `${followers_count} followers`;
    }

    if (following_count == 1){
        following.innerHTML = "1 following";
    } else {
        following.innerHTML = `${following_count} following`;
    }
}

function load_content(pagenum){

    // Loads profile
    const username = document.querySelector('#profile-username').innerHTML;

    fetch(`profile/${username}/${pagenum}`)
    .then(response => response.json())
    .then(data => {
        console.log(data)

        // Change followers/following count
        let followers = document.querySelector('#profile-followers');
        let following = document.querySelector('#profile-following');

        if (data.followers == 1){
            followers.innerHTML = "1 follower";
        } else {
            followers.innerHTML = `${data.followers} followers`;
        }

        if (data.following == 1){
            following.innerHTML = "1 following";
        } else {
            following.innerHTML = `${data.following} following`;
        }

        // Update button to display if current user is following clicked user
        follow_button = document.querySelector('#profile-followbtn');
        if (follow_button != null){
            if (data.follows == false){
                follow_button.innerHTML = "Follow";
            } else {
                follow_button.innerHTML = "Unfollow";
            }
        }

        let page_has_next = false
        let page_has_previous = false

        // Load the user's posts
        for (let i = 0; i < 10 && i < data.posts[0].length; i++){

            // Create div
            const posts = document.createElement('div');
            posts.className = "posts";

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
            if (data.posts[0][i].current_user == document.querySelector('#profile-username').innerHTML){
                const edit_button = document.createElement("button");
                edit_button.className = "btn btn-sm btn-outline-dark edit";
                edit_button.innerHTML = "Edit Post";
                edit_button.dataset.post_id = data.posts[0][i].post_id;
                edit_post.append(edit_button);
            }

            // Append elements to the container div
            posts.append(div_content, p_time, hr_2, image, likes, edit_post);

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
