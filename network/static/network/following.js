let pagenum = 1;
let csrf = window.CSRF_TOKEN ;
document.addEventListener("DOMContentLoaded", () => {

    load_posts(pagenum);

    document.addEventListener("click", event => { 
        console.log(event.target);
        if (event.target.id == 'like'){
            like(event.target);
        }
    })

    document.querySelector('#page_previous').addEventListener("click", () => { preload("previous"); });
    document.querySelector('#page_next').addEventListener("click", () => { preload("next"); });

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

    load_posts(parseInt(indexEl.innerHTML) + 1);
    indexEl.innerHTML = parseInt(indexEl.innerHTML) + 1;
    return false;
}

function previous(indexEl){
    
    load_posts(parseInt(indexEl.innerHTML) - 1);
    indexEl.innerHTML = parseInt(indexEl.innerHTML) - 1;
    return false;
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

            // Update the likes count
            parent.parentElement.children[6].innerHTML = `${data.likes_count} likes`;
            image_element.src = '/static/network/unlike.png'
            image_element.alt = "unlike button";
        })
    }

}

function load_posts(loadnum){

    // Load all posts

    fetch(`/following/${loadnum}`)
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
            const p_content = document.createElement("p");
            p_content.innerHTML = data.posts[0][i].post;
            div_content.append(p_content);

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