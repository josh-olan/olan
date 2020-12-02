document.addEventListener("DOMContentLoaded", ()=>{

    let search = document.querySelector('#search_div');
    let s_icon = document.querySelector('#search_icon_div');
    if (document.title != 'Active Listings'){
        search.style.display = "none";
        s_icon.style.display = "none";
    } else {
        search.style.display = "block";
        s_icon.style.display = "inline";
        get_items();
        paginate(1);
    }
    
    document.querySelectorAll('#active_categories>ul>li').forEach(el => {
        el.addEventListener("click", show_items);
    })

    // Search functionality
    document.querySelector('#search_div>form').addEventListener("submit", event => {
        search_item(event, "main");
    });
    
    /* Pagination
    document.querySelectorAll('#pagination li a').forEach(el => {
        el.addEventListener("click", get_pagination);
    })*/


    // Add event listener for the Sort functionality
    if (document.title != 'Active Listings'){
        if (document.querySelector('#media_sort')){
            document.querySelector('#media_sort').style.display = "none";
        }
    }
    if (document.title != 'Login' && document.title != 'Register'){
        document.querySelector('#media_sort').onclick = () => {
            let parent = document.querySelector('#main_container > .row > .col-2');
            let sort = parent.querySelector('#active_sort');
            let categories = parent.querySelector('#active_categories');
            if (sort.style.display == "none"){
                categories.style.display = "none";
                parent.style.display = "block";
                sort.style.display = "block";
            } else {
                categories.style.display = "none";
                parent.style.display = "none";
                sort.style.display = "none";
            }
        }
    }
    media();
    window.addEventListener("resize", media);
})

let storage = [];
function get_items(){
    /*
    Gets all the items in most recent first order
    */
    loading("load");
    document.querySelectorAll('.hidden_items').forEach(el => {
        el.classList.remove('hidden_items');
        storage.push(el);
        el.remove();
    })
    loading("hide");
}


function paginate(index, event){
    /*
    Gets pagination views for other 
    */
    loading("load");
    if (!index){
        index = parseInt(event.target.dataset.page);
    }
    if (index != 0){
        // Remove the contents first then append
        document.querySelectorAll('.each_item').forEach(el => {
            el.remove();
        })
        let stop = parseInt(index) * 5;
        let start = stop - 5;
        let s;
        if (!storage[stop]){
            s = storage.length;
        } else {
            s = stop;
        }
        let pagination = document.querySelector('#pagination');
        for (let i = start; i < s; i++){
            // Append to the main container
            document.querySelector('#active_parent').insertBefore(
                storage[i], pagination
                );
        }
        // Update datasets
        let els = pagination.querySelectorAll('a');
        els[0].dataset.page = index - 1;
        els[1].dataset.page = index;
        els[2].dataset.page = index + 1;
        els[3].dataset.page = index + 2;
        els[4].dataset.page = index + 1;

        // Update inner text
        els[1].innerText = index;
        els[2].innerText = index + 1;
        els[3].innerText = index + 2;

        // Disable if there is none

        if (storage[stop]){
            if (els[4].dataset.listen == "false"){
                els[4].addEventListener("click", get_pagination);
                els[4].dataset.listen = "true";
                els[4].href = "#";
            }   
            if (els[2].dataset.listen == "false"){
                els[2].addEventListener("click", get_pagination);
                els[2].dataset.listen = "true";
                els[2].href = "#";
            }
        } else {
            if (els[4].dataset.listen == "true"){
                els[4].removeEventListener("click", get_pagination);
                els[4].dataset.listen = "false";
            }
            if (els[4].hasAttribute("href")){
                els[4].removeAttribute("href");
            }
            if (els[2].dataset.listen == "true"){
                els[2].removeEventListener("click", get_pagination);
                els[2].dataset.listen = "false";
            }
            if (els[2].hasAttribute("href")){
                els[2].removeAttribute("href");
            }
        }
        if (storage[stop + 4]){
            if (els[3].dataset.listen == "false"){
                els[3].addEventListener("click", get_pagination);
                els[3].dataset.listen = "true";
                els[3].href = "#";
            }
        } else {
            if (els[3].dataset.listen == "true"){
                els[3].removeEventListener("click", get_pagination);
                els[3].dataset.listen = "false";
            }
            if (els[3].hasAttribute("href")){
                els[3].removeAttribute("href");
            }
        }
        if (storage[start - 1]){
            if (els[0].dataset.listen == "false"){
                els[0].addEventListener("click", get_pagination);
                els[0].dataset.listen = "true";
                els[0].href = "#";
            }
        } else {
            if (els[0].dataset.listen == "true"){
                els[0].removeEventListener("click", get_pagination);
                els[0].dataset.listen = "false";
            }
            if (els[0].hasAttribute("href")){
                els[0].removeAttribute("href");
            }
        }
    }
    loading("hide");
}


function get_pagination(event){
    paginate(null, event);
}


function show_items(event){
    /*
    Displays categories items
    */
   let el = event.target;
   if (el.tagName == "SPAN" || el.tagName == "IMG"){
       el = el.parentElement;
   }
   if (el.parentElement.querySelector("ul")){

        el.querySelector("img").src = "/static/auctions/right.png";
        el.parentElement.querySelector("ul").remove();

        el.parentElement.addEventListener("mouseleave", () => {
            el.parentElement.style.backgroundColor = "white";
        })
   } else {

        // Change the arrow
        el.querySelector("img").src = "/static/auctions/down.png";

        el.parentElement.addEventListener("mouseover", () => {
            el.parentElement.style.backgroundColor = "white";
        })

        fetch(`get_category_items/${el.dataset.category}`)
        .then(response => response.json())
        .then(data => {

            let ul = document.createElement('ul');
            ul.style.listStyle = "none";
            // Append the children to the parent Category
            for (let i = 0; i < data.length; i++){
                let li = document.createElement("li");
                let a = document.createElement("a");
                a.style.display = "block";
                a.style.width = "100%";
                a.style.fontSize = "13px";

                if (data[i].title.length >= 25){
                    a.innerText = `* ${data[i].title.slice(0, 22) + "..."}`;
                } else {
                    a.innerText = `* ${data[i].title}`;
                }
                a.href = `/${data[i].id}/`;
                li.style.border = "1px solid rgb(216, 233, 216)";
                li.style.padding = "5px";
                li.style.marginBottom = "3px";
                li.append(a);
                ul.append(li);
            }
            el.parentElement.append(ul);
        })
        .catch(error => {
            console.log(error);
        })
    }
}


function search_item(event, which){
    /*
    Implements the search functionality
    */
    event.preventDefault();
    loading("load");
    let parameter;
    if (which == "main"){
        parameter = document.querySelector('#search_item').value;
    } else {
        parameter = document.querySelectorAll('#search_item')[1].value;
    }
    fetch("/search/", {
        'method': 'POST',
        'headers': {
            'X-CSRFToken': csrf
        },
        'body': JSON.stringify({
            "parameter": parameter
        })
    })
    .then(response => response.json())
    .then(data => {
        // Clear former content
        let main_parent = document.querySelector("#active_parent");
        let paginator = main_parent.querySelector("#pagination");
        main_parent.querySelectorAll(".each_item").forEach(el => {
            el.remove();
        })
        // Change the header
        main_parent.children[0].innerText = "Search Results";

        // If empty, put a placeholder
        if (data.length == 0){
            if (!main_parent.querySelector('#placeholder_text')){
                let p = document.createElement("p");
                p.innerText = "Ooops! No item matches your search parameter."
                p.id = "placeholder_text";
                main_parent.insertBefore(p, paginator);

                // Hide pagination
                paginator.style.visibility = "hidden";
            }
        } else {

            storage = [];

            // Display pagination
            paginator.style.visibility = "visible";
            if (main_parent.querySelector('#placeholder_text')){
                main_parent.querySelector('#placeholder_text').remove();
            }
            
            for (let i = 0; i < data.length; i++){
                let d = data[i];
                let container = document.createElement("div");
                let row = document.createElement("div");
                let img_col = document.createElement("div");
                let content_col = document.createElement("div");
                let button_col = document.createElement("div");

                // Sort out image
                let img = document.createElement("img");
                img.src = d.imageurl;
                img.alt = "image";
                img.className = "each_item_img";
                img_col.className = "col-3";
                img_col.append(img);

                // Sort out content
                let wrapper = document.createElement("div");
                let header = document.createElement("p");
                let price_p = document.createElement("p");
                let extra_p = document.createElement("p");
                let price_span = document.createElement("span");
                let listed_by = document.createElement("span");
                let active_date = document.createElement("span");

                header.className = "active_header";
                price_span.className = "active_price";
                listed_by.className = "active_h";
                active_date.className = "active_date";

                header.innerText = d.title;
                price_span.innerText = `£${d.price}`;
                listed_by.innerText = "Listed on ";
                active_date.innerText = d.when_added;

                price_p.append(price_span);
                extra_p.append(listed_by, active_date);
                wrapper.append(header, price_p, extra_p);
                content_col.className = "col";
                content_col.append(wrapper);

                // Sort out buttton
                button_col.classList.add("col");
                button_col.classList.add("active_button_div");
                let a = document.createElement("a");
                a.classList.add("btn2");
                a.classList.add("active_button");
                a.href = `/${d.id}/`;
                a.innerHTML = "View Listing";
                button_col.append(a);

                row.className = "row";
                container.classList.add("container-fluid");
                container.classList.add("each_item");

                row.append(img_col, content_col, button_col);
                container.append(row);
                storage.push(container);
            }
            paginate(1);
            document.querySelector('#active_sort').style.display = "none";
        }
        loading("hide");
    })
    .catch(error => {
        console.log(error);
        loading("hide");
    })
}


let m_c = 0;
function media(){
    /*
    Run media queries
    */
    loading("load");
    let width = window.innerWidth;
    let search = document.querySelector("#search_div");
    let menu_icon = document.querySelector('#third_holder > div');
    if (width <= 439){
        // Hide the search and other text fields
        search.style.display = "none";
        document.querySelector('.nav').style.display = "none";
        menu_icon.style.display = "block";

        if (m_c == 0){

            if (document.title == 'Active Listings'){
                // Place the search field above the listings view
                let clone = search.cloneNode(true);
                clone.style.paddingTop = "0px";
                clone.style.paddingBottom = "10px";
                clone.querySelector('span:nth-child(1)').style.width = "100%";
                clone.querySelector('span:nth-child(2)').style.width = "100%";
                clone.querySelector('button').style.width = "100%";
                let row = document.querySelector('#main_container>.row');
                row.insertBefore(
                    clone, document.querySelector('#active_parent')
                    );
                row.querySelector('#search_div > form').addEventListener("submit", event => {
                    search_item(event, "clone");
                });

                // Add event listener to the Search icon
                menu_icon.querySelector('#search_icon_a').addEventListener(
                    "click", display_search
                    );
            }
            // Add event listener to the menu icon
            menu_icon.querySelector('#menu_icon_a').addEventListener(
                "click", display_options
                );
            m_c = 1;
        }
    } else {
        // Display them
        if (document.title == 'Active Listings'){
            search.style.display = "block";
        }
        document.querySelector('.nav').style.display = "block";
        document.querySelectorAll('.nav li').forEach(e =>{ 
            e.style.display = "inline-block"
        });
        menu_icon.style.display = "none";

        // Remove the clone if present
        if (document.querySelector('#main_container #search_div')){
            document.querySelector('#main_container #search_div').remove();
            m_c = 0;
        }
        // Remove the slide in menu if present
        if (document.querySelector('#list_div')){
            document.querySelector('#list_div').remove();
        }
    }
    
    if (document.title == 'Active Listings'){
        let parent = document.querySelector('#main_container > .row > .col-2');
        let sort = parent.querySelector('#active_sort');
        let categories = parent.querySelector('#active_categories');
        if (width > 1194 ){
            if (categories.style.display != "block"){
                parent.style.display = "block";
                sort.style.display = "block";
                categories.style.display = "block";
            }
        } else {
            parent.style.display = "none";
            sort.style.display = "none";
            categories.style.display = "none";
        }
    }
    loading("hide");
}


function display_search(){
    /*
    Displays the cloned search field
    */
    if (document.querySelector("#main_container #search_div")){
        let search = document.querySelector("#main_container #search_div");
        if (search.style.display == "none"){
            search.style.display = "block";
        } else {
            search.style.display = "none";
            search.querySelector("#search_item").value = "";
        }
    }
}


function display_options(){
    /*
    Displays the top list items for smaller screens
    */
    let list = document.querySelector('.nav').cloneNode(true);
    let list_div = document.createElement('div');
    let list_container = document.createElement('div');
    let img = document.createElement('img');
    let a = document.createElement('a');
    
    list.querySelectorAll('li').forEach(e => {
        e.style.display = "unset";
    })
    img.src = "/static/auctions/x.png";
    img.id = "list_img";
    a.href = "#";
    a.append(img);
    a.addEventListener("click", ()=>{
        list_div.style.display = "none";
    })

    // Hide the sort button if the page is not Active Listings
    if (document.title != 'Login' && document.title != 'Register'){
        let sort = list.querySelector('#media_sort');
        if (document.title != 'Active Listings'){
            sort.parentElement.style.display = "none";
        } else {
            sort.parentElement.style.display = "unset";
        }
        sort.addEventListener("click", ()=>{
            list_div.style.display = "none";
            document.querySelector('#main_container>.row>.col-2').style.display = "block";
            document.querySelector("#active_sort").style.display = "block";
        })
    }
    list.style.display = "block";
    list_div.id = "list_div";
    list_div.className = "sd";
    list_container.id = "list_container";
    list_container.append(list);
    list_div.append(a, list_container);
    if (document.querySelector('#list_div')){
        document.querySelector('#list_div').remove();
    }
    document.querySelector('body').append(list_div);
}


function loading(action){
    /*
    Implements loading
    */
    let loading = document.querySelector('#loading').style;
    let header = document.querySelector('#header_div').style;
    let body = document.querySelector('#header_div').nextElementSibling.style;
    let footer = document.querySelector('footer').style;

    if (action == "load"){
        loading.display = "block";
        header.display = "none";
        body.display = "none";
        footer.display = "none";
    } else {
        loading.display = "none";
        header.display = "block";
        body.display = "block";
        footer.display = "block";
    }
}
