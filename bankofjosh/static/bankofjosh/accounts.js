var refresh;
document.addEventListener("DOMContentLoaded", () => {

    checkaccounts();
    sendto();
    text_if_no_account();
    get_watchlist_stocks();
    update_trading_balance();
    update_balances();

    refresh = setInterval(refresh_stock_prices, 10000);

    // Switches views
    document.querySelectorAll('a').forEach(a => {
        if (a.parentElement.className == "nav-item"){
            a.addEventListener("click", (event) => { 
                switch_views(event.target.dataset.display); 
            });
        }
    })

    document.querySelectorAll('a').forEach(element => {
        if (element.innerHTML == 'Back'){
            element.addEventListener("click", event => { 
                let target = event.target;
                if (target.dataset.index == null){
                    go_back(target.dataset.display, null); 
                } else {
                    go_back(target.dataset.display, target.dataset.index); 
                }
            });
        }
    })

    // Past Trades
    document.querySelectorAll('#pagination_two>li>a').forEach(el => {
        el.addEventListener("click", (event) => {
            let a = event.target.dataset;
            get_past_trades(parseInt(a.page));
        });
    })

    // Transactions Pagination
    document.querySelectorAll('#pagination_one>li>a').forEach(el => {
        el.addEventListener("click", (event) => {
            let a = event.target.dataset;
            pagination(a.account, a.page);
        });
    })

    // Adds event listeners for transactions view
    document.querySelectorAll('#each_account').forEach(account => {
        account.addEventListener("click", event => { show_transactions(event.target) });
    })

    // Displays the deposit view and withdraw
    document.querySelectorAll('#stock>button').forEach(el => {
        el.addEventListener("click", event => { 
            show_stock_view(event.target); 
        });
    })

    // Closes the stock view displayed
    document.querySelectorAll('#close').forEach(el => {
        el.addEventListener("click", close_stock_view);
    })
    
    // Remove stocks from the watchlist
    document.addEventListener("click", (event) => {
        if (event.target.tagName == "BUTTON" && event.target.innerText == "Remove"){
            let symbol = event.target.dataset.symbol;
            if (symbol != null){
                remove_from_watchlist(symbol);
            }
        }
    })

    document.querySelector('#placetrade_form').addEventListener("submit", place_trade);
    document.querySelector('#watchlist_form').addEventListener("submit", add_to_watchlist);
    document.querySelector('#withdrawal_form').addEventListener("submit", withdraw);
    document.querySelector('#deposit_form').addEventListener("submit", deposit);
    document.querySelector('#yes').addEventListener('click', transfer_external_account);
    document.querySelector('#transfer_external_form').addEventListener('submit', confirm);
    document.querySelector('#between_accounts_form').addEventListener("submit", transfer_between_accounts);
    document.querySelector('select.form-control').addEventListener("change", sendto);
    document.querySelector('.sendfrom_view>div>button').addEventListener("click", change_send_view);

    // Hide all other views
    document.querySelector('#accounts_view').style.display = "block";
    document.querySelector('#sendmoney_view').style.display = "none";
    document.querySelector('.transactions_view').style.display = "none";
    document.querySelector('#addaccounts_view').style.display = "none";
})


function text_if_no_account(){
    /*
    Checks if the user has an account or not and displays a message
    */

    if (document.querySelector('.each_account_holder') == null){
        const starter_div = document.createElement("div");
        const info = document.createElement("p");
        const ol = document.createElement("ol");
        const li_1 = document.createElement("li");
        const li_2 = document.createElement("li");
        const li_3 = document.createElement("li");
        const br =  document.createElement("br");

        info.innerHTML = "To get started, please do the following:";
        li_1.innerHTML = "Click on the 'Add account' tab.";
        li_2.innerHTML = "Select any account type.";
        li_3.innerHTML = "Click the 'Add account' button.";
        
        ol.append(li_1);
        ol.append(li_2);
        ol.append(li_3);

        starter_div.append(info);
        starter_div.append(ol);

        document.querySelector('#accounts_container').append(starter_div);
    }
}


function switch_views(display){

    // Switches content
    let children = document.querySelector('.content_view').children;
    for (let i = 0; i < children.length; i++){
        if (children[i].dataset.display == display){
            children[i].style.display = "block";
        } else {
            children[i].style.display = "none";
        }
    }
    // Switches views
    let views = document.querySelector('ul.nav.nav-tabs').children;
    let child = "";
    for (let i = 0; i < views.length; i++){
        child = views[i].children[0];
        if (child.dataset.display == display){
            child.className = "nav-link active";
        } else {
            child.className = "nav-link";
        }
    }
    if (display == 2){
        document.querySelector('.sendfrom_view').style.display = 'block';
        document.querySelector('.between_accounts_view').style.display = 'none';
        document.querySelector('.external_account_view').style.display = 'none';
        // Clear previous inputs
        document.querySelector('#sendmoney_view').querySelectorAll('input[type="text"], input[type="number"]').forEach(el => {
            el.value = "";
        })
    }
}


function change_send_view(event){
    event.preventDefault();
    // Hide other send views
    if(document.querySelector('#between').checked == true){
        document.querySelector('.sendfrom_view').style.display = 'none';
        document.querySelector('.between_accounts_view').style.display = 'block';
        document.querySelector('.external_account_view').style.display = 'none';
    } else {
        document.querySelector('.sendfrom_view').style.display = 'none';
        document.querySelector('.between_accounts_view').style.display = 'none';
        document.querySelector('.external_account_view').style.display = 'block';
    }
}


function checkaccounts(){

    // Disable accounts the user has already
    const savings_rd = document.querySelector('#savings');
    const current_rd = document.querySelector('#current');
    const htb_rd = document.querySelector('#help-to-buy');

    fetch("/checkaccounts")
    .then(response => response.json())
    .then(data => {

        if (data[0] == null){
            savings_rd.checked = true;
            savings_rd.disabled = false;
        } else {
            savings_rd.disabled = true;
        }
        if (data[1] == null){
            current_rd.checked = true;
            current_rd.disabled = false;
        } else {
            current_rd.disabled = true;
        }
        if (data[2] == null){
            htb_rd.checked = true;
            htb_rd.disabled = false;
        } else {
            htb_rd.disabled = true;
        }
        // Hide the add account view if the user has all accounts
        if (data[0] != null && data[1] != null && data[2] != null){
            document.querySelector('ul.nav.nav-tabs').children[2].style.display = 'none';
        }
    })
}


function sendto(){
    // Populates 'Send to' dropdown

    let sendfrom_value = document.querySelector('select.form-control').value;
    let parent = document.querySelectorAll('select.form-control')[1];

    // Delete all children first
    for (let i = 0; i < parent.children.length; i+1){
        parent.children[i].remove();
    }

    fetch("/checkaccounts")
    .then(response => response.json())
    .then(data => {

        for (let i = 0; i < data.length; i++){
            let value = data[i];
            if (value != null && value != sendfrom_value){

                if (value == "trading"){
                    continue;
                }
                let option = document.createElement('option');
                option.value = value;
                if (value == "current"){
                    option.innerHTML = "OLAN CURRENT";
                }
                if (value == "savings") {
                    option.innerHTML = "OLAN SAVINGS";
                } 
                if (value == "help-to-buy"){
                    option.innerHTML = "OLAN Help-To-Buy";
                }
                parent.append(option);
            }
        }
        // Disable Transfer button if no account
        if (document.querySelector('#to').value == ""){
            document.querySelector('#transfer_btn').disabled = true;
        } else {
            document.querySelector('#transfer_btn').disabled = false;
        }
    })
}


function transfer_between_accounts(event){

    event.preventDefault();
    loading("load");
    let from = document.querySelector('#from').value;
    let to = document.querySelector('#to').value;
    let amount = parseFloat(document.querySelector('#btwn_amount').value);

    fetch('/transfer_between_accounts', {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrf
        },
        body: JSON.stringify({
            from: from,
            to: to,
            amount: amount
        })
    })
    .then(response => response.json())
    .then(message => {
        if (message.error != undefined){
            throw Error(message.error)
        }
        loading("hide");
        switch_views(1);
        update_balances();
        display_message(null, message.message);
    })
    .catch(error => {
        loading("hide");
        display_message("error", error);
    })
}


function update_balances(){
    // Updates balances
    loading("load");
    let all = document.querySelectorAll('#account-type');
    for (let i = 0; i < all.length; i++){
        let element = all[i];
        fetch(`/update_balances/${element.dataset.type}`)
        .then(response => response.json())
        .then(data => {
            element.nextElementSibling.innerHTML =
             `£${ parseFloat(data.data.toFixed(2)).toLocaleString() }`;
        })
    }
    loading("hide");
}


function confirm(event){
    /*
    For user to confirm external transaction
    */

    // Transfers to an external account
    event.preventDefault()
    const firstname = document.querySelector('#rfirstname').value;
    const lastname = document.querySelector('#rlastname').value;
    const amount = parseFloat(document.querySelector('#ramount').value);

    document.querySelector('#modal-body2').innerText = 
        `You are sending £${amount} to ${firstname.charAt(0).toUpperCase() 
            + firstname.slice(1)} ${lastname.charAt(0).toUpperCase() + lastname.slice(1)}`;

    document.querySelector('#confirmation_modalbtn').click();
}


function transfer_external_account(){

    const firstname = document.querySelector('#rfirstname').value;
    const lastname = document.querySelector('#rlastname').value;
    const sortcode = document.querySelector('#rsortcode').value;
    const accountnumber = document.querySelector('#raccountnumber').value;
    const amount = parseFloat(document.querySelector('#ramount').value);
    const description = document.querySelector('#description').value;
    const debit_account = document.querySelector('#from_account').value;

    document.querySelector('#no').click();
    loading("load");
    fetch('/transfer_external_account', {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrf
        },
        body: JSON.stringify({
            "firstname": firstname,
            "lastname": lastname,
            "sortcode": sortcode,
            "accountnumber": accountnumber,
            "amount": amount,
            "description": description,
            "debit_account": debit_account
        })
    })
    .then(response => response.json())
    .then(data => {
        if(data.error != undefined){
            throw Error(data.error)
        }
        loading("hide");
        switch_views(1);
        update_balances();
        display_message(null, data.message);
    })
    .catch(error => {
        loading("hide");
        display_message("error", error)
    })
}


function display_message(error, message){
    // Throws modal messages

    // Remove icon
    let if_image = document.querySelector('#modallabel>img');
    if (if_image != null){
        if_image.remove()
    }

    let header = document.querySelector("#modal-header1");
    let body = document.querySelector("#modal-body1");
    let label = document.querySelector("#modallabel");

    // Throw error
    if (error != null){
        // Update message
        header.style.backgroundImage = "linear-gradient(to bottom, rgb(233, 109, 109), rgb(235, 129, 129))";
        body.style.color = "red";

        let img = document.createElement("img");
        img.src = "/static/bankofjosh/erroricon.png";
        img.alt = "Error icon";
        img.className = "d-inline-block ic";

        label.insertBefore(img, 
            label.firstChild);
        label.querySelector("span").innerHTML = "ERROR";
    } else {
        header.style.backgroundImage = "linear-gradient(to bottom, rgb(109, 215, 116), rgb(129, 235, 156))";
        body.style.color = "black";

        let img = document.createElement("img");
        img.src = "/static/bankofjosh/successicon.png";
        img.alt = "Success icon";
        img.className = "d-inline-block ic";

        label.insertBefore(img, 
            label.firstChild);
        label.querySelector("span").innerHTML = "SUCCESS";
    }
    document.querySelector('#modal-body1').innerHTML = message;
    document.querySelector('#modal_btn').click();
    clearfields();
}


function clearfields(){

    // Clears all input fields in a page
    document.querySelectorAll('input[type="text"], input[type="number"]').forEach(input =>{
        input.value = '';
    })
}


function show_transactions(element){

    // Get the parent
    let parent = element.parentElement;

    // Get the account type when the user clicks on the account
    while (parent.className != "each_account_holder" || parent.className == null){
        element = parent;
        parent = element.parentElement;
    }
    let type = parent.querySelector('a>div>div:nth-child(2)>p').dataset.type;

    // Set the account type
    document.querySelector('.table').parentElement.previousElementSibling.innerHTML = 
        `Account: OLAN ${type.toUpperCase()}`;

    pagination(type, 1);

    // Set the pagination account type
    document.querySelectorAll('.pagination>li>a').forEach(el => {
        el.dataset.account = type;
    })

    // Hide the Accounts view and display the Transactions view
    document.querySelector('#accounts_container').style.display = 'none';
    document.querySelector('.transactions_view').style.display = 'block';
}


function go_back(display, id){
    // To take the user back

    if (display == 1){
        document.querySelector('.transactions_view').style.display = "none";
        document.querySelector('#accounts_container').style.display = "block";
    }
    if (display == 2){
        if (id == 1){
            // Hide the current view and display former
            document.querySelector('.between_accounts_view').style.display = 'none';
            document.querySelector('.sendfrom_view').style.display = 'block';
        } else {
            document.querySelector('.external_account_view').style.display = 'none';
            document.querySelector('.sendfrom_view').style.display = 'block';
        }
    }
}


function pagination(account, page){
    /*
    PAGINATION
    */
    loading("load");

    // Clear contents of table
    clear_table();

    fetch(`/get_transactions/${account}/${page}`)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        let table = document.querySelector('#table1').style;
        let pagination = document.querySelector('#pagination_one');
        if (data.data.length == 0){
            if (!document.querySelector('#no_trans_notice')){

                let p = document.createElement('p');
                p.id = "no_trans_notice";
                p.style.fontSize = "13px";
                p.innerHTML = "You have no transaction with this account.";
                table.display = "none";
                document.querySelector('.ts').append(p);

                // Hide pagination
                pagination.style.visibility= "hidden";
            }
        } else {

            // Display the table
            table.display = "table";

            // Display pagination
            pagination.style.visibility = "visible";

            // Remove the text
            if (data.data.length != 0 && document.querySelector('#no_trans_notice') != null){
                document.querySelector('#no_trans_notice').remove();
            }
        
            for (let i = 0; i < data.data.length; i++){
                
                let tr = document.createElement("tr");
                let from = document.createElement("td");
                let amount = document.createElement("td");
                let desc = document.createElement("td");
                let bal = document.createElement("td");
                let date = document.createElement("td");

                // Format amount
                let ba = data.data[i].amount;
                let am = ba.slice(2, ba.length);
                am = parseFloat(am).toFixed(2);
                am = parseFloat(am).toLocaleString();

                from.innerHTML = data.data[i].from;
                amount.innerHTML = ba[0] + ba[1] + am;
                desc.innerHTML = data.data[i].description;
                bal.innerHTML = data.data[i].balance;
                date.innerHTML = data.data[i].date;

                if (data.data[i].amount[0] == '+'){
                    amount.className = "credit";
                } else {
                    amount.className = "debit";
                }

                tr.append(from);
                tr.append(amount);
                tr.append(desc);
                tr.append(bal);
                tr.append(date);

                document.querySelector('tbody').append(tr);

                // Update pagination 
                let previous = document.querySelector('#previous');
                let next = document.querySelector('#next');
                let first = document.querySelector('#one');
                let second = document.querySelector('#two');
                let third = document.querySelector('#three');
                
                if (data.has_next == false){
                    next.parentElement.className = "page-item disabled";
                    second.parentElement.className = "page-item disabled";
                } else {
                    next.parentElement.className = "page-item";
                    second.parentElement.className = "page-item";
                }

                if (data.has_previous == false){
                    previous.parentElement.className = "page-item disabled";
                } else {
                    previous.parentElement.className = "page-item";
                }

                if (data.has_second == false){
                    third.parentElement.className = "page-item disabled";
                } else {
                    third.parentElement.className = "page-item";
                }

                // Update the page dataset
                previous.dataset.page = parseInt(page) - 1;
                first.dataset.page = page;
                second.dataset.page = parseInt(page) + 1;
                next.dataset.page = parseInt(page) + 1;
                third.dataset.page = parseInt(page) + 2;

                // Update the innertext
                first.innerHTML = first.dataset.page;
                second.innerHTML = second.dataset.page;
                third.innerHTML = third.dataset.page;
            }
        }
        loading("hide");
    })
    .catch(error => {
        loading("hide");
        display_message("error", error);
    })
}


function clear_table(){
    /*
    Clears the Transaction table 
    */

    document.querySelectorAll('#table1>tbody>tr>td').forEach(cell => {
        cell.remove();
    })
}


function show_stock_view(el){
    /*
    Shows either the Deposit view or the Withdraw view
    */
    if (el.innerHTML == "Deposit"){

        let el_style = document.querySelector('#deposit_view').style;
        el_style.animation = "gradual_display 250ms forwards";
        el_style.animationPlayState = "running";
        el_style.display = "block";
        document.querySelector("#withdrawal_view").style.display = "none";
        document.querySelector("#placetrade_view").style.display = "none";
        document.querySelector("#activetrades_view").style.display = "none";
        document.querySelector("#pasttrades_view").style.display = "none";

    } else if (el.innerHTML == "Withdraw"){

        let el_style = document.querySelector("#withdrawal_view").style;
        el_style.animation = "gradual_display 250ms forwards";
        el_style.animationPlayState = "running";
        el_style.display = "block";
        document.querySelector('#deposit_view').style.display = "none";
        document.querySelector("#placetrade_view").style.display = "none";
        document.querySelector("#activetrades_view").style.display = "none";
        document.querySelector("#pasttrades_view").style.display = "none";
        
    } else if(el.innerHTML == "Place Trade"){

        let el_style = document.querySelector("#placetrade_view").style;
        el_style.animation = "gradual_display 250ms forwards";
        el_style.animationPlayState = "running";
        el_style.display = "block";
        document.querySelector('#deposit_view').style.display = "none";
        document.querySelector("#withdrawal_view").style.display = "none";
        document.querySelector("#activetrades_view").style.display = "none";
        document.querySelector("#pasttrades_view").style.display = "none";

    } else if (el.innerHTML == "Active Trades"){

        let el_style = document.querySelector("#activetrades_view").style;
        el_style.animation = "gradual_display 250ms forwards";
        el_style.animationPlayState = "running";
        el_style.display = "block";
        get_active_trades();
        document.querySelector('#deposit_view').style.display = "none";
        document.querySelector("#withdrawal_view").style.display = "none";
        document.querySelector("#placetrade_view").style.display = "none";
        document.querySelector("#pasttrades_view").style.display = "none";

    } else {

        let el_style = document.querySelector("#pasttrades_view").style;
        el_style.animation = "gradual_display 250ms forwards";
        el_style.animationPlayState = "running";
        el_style.display = "block";
        get_past_trades(1);
        document.querySelector('#deposit_view').style.display = "none";
        document.querySelector("#withdrawal_view").style.display = "none";
        document.querySelector("#placetrade_view").style.display = "none";
        document.querySelector("#activetrades_view").style.display = "none";
    }
}


function close_stock_view(event){
    /*
    Closes the stock view currently displayed
    */
    event.preventDefault();
    let el_style = document.querySelector(`#${this.dataset.view}`).style;
    el_style.animation = "reverse_display 250ms forwards";
    el_style.animationPlayState = "running";

    setTimeout(() => { 
        el_style.display = "none"; 
    }, 200);
}


function update_trading_balance(){
    /*
    Update the trading balance of the user
    */
    loading("load");
    fetch('/update_balances/trading')
    .then(response => response.json())
    .then(data => {
        const bal = currency_converter("GBP", data.data, "balance");
        document.querySelector('#stock>p>span').innerText = `$${bal}`;
        loading("hide");
    })
}


function deposit(event){

    /*
    Deposit into the trading account
    */

    event.preventDefault();
    amount = parseFloat(document.querySelector('#deposit_amount').value);
    account = document.querySelector("#stock_dropdown1").value;

    fetch("/deposit", {
        method: "POST",
        headers: {
            "X-CSRFToken": csrf,
        },
        body: JSON.stringify({
            "amount":amount,
            "account":account
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error != undefined){
            throw new Error(data.error)
        }
        update_balances();
        update_trading_balance();
        display_message(null, data.message);
        document.querySelector('#deposit_view a').click();
        document.querySelector('#stock').scrollIntoView();
    })
    .catch(error => {
        display_message("error", error);
    })
}


function withdraw(event){
    
    /*
    Withdraw amount from the Trading account to desired account
    */

    event.preventDefault();
    const amount = parseFloat(document.querySelector('#withdrawal_amount').value);
    const account = document.querySelector('#stock_dropdown2').value;

    fetch(`https://api.exchangeratesapi.io/latest?base=USD&symbols=USD,GBP`)
    .then(response => response.json())
    .then(data => {

        fetch('/withdraw', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrf
            },
            body: JSON.stringify({
                "amount": data.rates.GBP * amount,
                "account": account
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error != undefined){
                throw new Error(data.error)
            }
            update_balances();
            update_trading_balance();
            display_message(null, data.message);
            document.querySelector('#withdrawal_view a').click();
            document.querySelector('#stock').scrollIntoView();
        })
        .catch(error => {
            display_message("error", error)
        })
    })
    .catch(error => {
        display_message("error", error);
    })
}


function add_to_watchlist(event){

    /*
    Adds a stock to the watchlist
    */

    event.preventDefault()
    let stock = document.querySelector('#watchlist_stock').value;
    loading("load");
    fetch(`https://cloud.iexapis.com/stable/stock/${stock}/batch?token=${key}&types=quote`)
    .then(response => response.json())
    .then(data => {
        if (data.error != undefined){
            throw new Error(data.error)
        }
        
        // Add stock to backend
        fetch(`/modify_watchlist/${"add"}`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrf,
            },
            body: JSON.stringify({
                "symbol": data.quote.symbol,
                "company_name": data.quote.companyName
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error != undefined){
                throw new Error(data.error)
            }

            get_watchlist_stocks(); 
            loading("hide");
            document.querySelector("#stock").scrollIntoViewIfNeeded();
            display_message(null, data.message);
        })
        .catch(error => {
            loading("hide");
            document.querySelector("#stock").scrollIntoViewIfNeeded();
            display_message("error", error)
        })
    })
    .catch(error => {
        loading("hide");
        document.querySelector("#stock").scrollIntoViewIfNeeded();
        display_message("error", "Stock not found!");
    })
}


function remove_from_watchlist(symbol){
    /*
    Remove a stock from the watchlist
    */
    loading("load");
    fetch(`/modify_watchlist/remove`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrf
        },
        body: JSON.stringify({
            "symbol": symbol,
            // Company name not needed
            "company_name": null
        })
    })
    .then(response => response.json())
    .then(data => {
        get_watchlist_stocks();
        loading("hide");
        document.querySelector('#stock').scrollIntoViewIfNeeded();
        display_message(null, data.message);
    })
    .catch(error => {
        loading("hide");
        document.querySelector('#stock').scrollIntoViewIfNeeded();
        display_message("error", error);
    })
}


function latest_stock_price(symbol){
    /*
    Returns Stock latest price
    */

   fetch(`https://cloud.iexapis.com/stable/stock/${symbol}/batch?token=${key}&types=quote`)
   .then(response => response.json())
   .then(data => {
        // Update current prices
        document.querySelectorAll(`#${symbol}-price`).forEach(el => {
            el.innerHTML = `$${data.quote.latestPrice.toFixed(2)}`;
        }) 

        // Update the totals
        document.querySelectorAll('#activetrades_tbody>tr').forEach(el =>{
            let price = el.children[3].innerText.slice(1, el.children[3].length);
            let shares = el.children[5].innerText;
            el.children[6].innerText = `$${ parseFloat((price * shares).toFixed(2)).toLocaleString() }`;
        })
   })
   .catch(error =>{
       display_message(
           "error", "Stock API is down at the moment. Please come back later."
           );
       stop_refresh();
   })
}


function refresh_stock_prices(){
    /*  
    Refreshes prices
    */
    document.querySelectorAll('[id*=-price]').forEach(el => {
        latest_stock_price(el.id.slice(0, el.id.length - 6)); 
    })
}


function stop_refresh(){
    /*
    Stops the refresh of prices if API crashes
    */
    clearInterval(refresh);
}


function get_watchlist_stocks(){
    /*
    Returns list of watchlist stocks
    */
    loading("load");
    fetch("/get_watchlist_stocks")
    .then(response => response.json())
    .then(data => {
        
        // Remove children elements
        document.querySelectorAll('#stocks_tbody>tr').forEach(el => {el.remove()});

        let tbody = document.querySelector('#stocks_tbody');
        let stocks_table = document.querySelector('#stocks_table');
        if (data.length == 0){

            // Hide the table
            stocks_table.style.display = "none";

            // Placeholder text
            let text = document.createElement("p");
            text.id = "empty_watchlist";
            text.style.fontSize = "13px";
            text.innerHTML = "No stock in your watchlist.";

            document.querySelectorAll('.ts')[3].insertBefore(text, stocks_table);
        } else {

            // Display the table
            stocks_table.style.display = "table";

            if (document.querySelector("#empty_watchlist") != undefined){
                document.querySelector("#empty_watchlist").remove();
            }
            for (let i = 0; i < data.length; i++){
                let tr = document.createElement("tr");
                let td1 = document.createElement("td");
                let td2 = document.createElement("td");
                let td3 = document.createElement("td");
                let td4 = document.createElement("td");
                let td5 = document.createElement("td");
                let a = document.createElement("a");
                let button = document.createElement("button");

                td1.innerHTML = data[i].symbol;
                td2.innerHTML = data[i].company_name;
                // Price in dollars
                td3.id = `${data[i].symbol}-price`;

                let price = latest_stock_price(data[i].symbol);
                if (price == undefined){
                    td3.innerHTML = "$0";
                } else {
                    td3.innerHTML = `$${price}`;
                }

                a.innerHTML = "IEX Cloud";
                a.href = "https://iexcloud.io";
                button.innerHTML = "Remove";
                button.type = "button";
                button.className = "bs2 remove_stock";
                button.dataset.symbol = data[i].symbol;

                td4.append(a);
                td5.append(button);
                tr.append(td1, td2, td3, td4, td5);

                tbody.append(tr);
            }
        }
        loading("hide");
    })
    .catch(error => {
        loading("hide");
        display_message("error", error);
    })
}


function place_trade(event){
    /*
    Places a trade
    */

    event.preventDefault();
    let symbol = document.querySelector('#placetrade_stock').value;
    let shares = parseInt(document.querySelector('#placetrade_shares').value);

    fetch(`https://cloud.iexapis.com/stable/stock/${symbol}/batch?token=${key}&types=quote`)
    .then(response => response.json())
    .then(data => {
        
        // Convert currency
        fetch(`https://api.exchangeratesapi.io/latest?base=USD&symbols=USD,GBP`)
        .then(response => response.json())
        .then(info => { 

            // Place Trade
            fetch('/place_trade', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrf
                },
                body: JSON.stringify({
                    "symbol": data.quote.symbol,
                    "company_name": data.quote.companyName,
                    "purchase_price": parseFloat(data.quote.latestPrice),
                    "converted_price": info.rates.GBP * parseFloat(data.quote.latestPrice),
                    "shares": shares
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.error != undefined){
                    throw new Error(data.error);
                }
                update_trading_balance();
                display_message(null, data.message);
                document.querySelector('#placetrade_view a').click();
                document.querySelector('#stock').scrollIntoView();
            })
            .catch(error => {
                display_message("error", error);
            })
        })
        .catch(error => {
            display_message("error", error);
        })
    })
    .catch(error => {
        display_message("error","Stock not found!");
    })
}


function get_active_trades(){
    /*
    Returns Active trades
    */

    fetch(`/get_trades/${'active'}/0`)
    .then(response => response.json())
    .then(data => {
        // Remove table contents first
        document.querySelectorAll('#activetrades_tbody>tr').forEach(el => {el.remove()});

        let active_table = document.querySelector("#activetrades_table");
        // If none
        if (data[0] == undefined){
            
            // Hide the table
            active_table.style.display = "none";

            if (document.querySelector('#no_active_trade') == undefined){
                let div = document.createElement("div");
                div.innerText = "You have no active trade!";
                div.id = "no_active_trade";
                div.style.marginBottom = "20px";
                div.style.fontSize = "13px";
                document.querySelector("#activetrades_view").insertBefore(div, 
                    active_table.nextElementSibling
                );
            }

        } else {

            // Display the table
            active_table.style.display = "table";

            // Remove message if existent
            if (document.querySelector('#no_active_trade') != undefined){
                document.querySelector('#no_active_trade').remove();
            }
            // Enter data in table
            for (let i = 0; i < data.length; i++){
                let tr = document.createElement('tr');
                let td1 = document.createElement("td");
                let td2 = document.createElement("td");
                let td3 = document.createElement("td");
                let td4 = document.createElement("td");
                let td5 = document.createElement("td");
                let td6 = document.createElement("td");
                let td7 = document.createElement("td");
                let td8 = document.createElement("td");
                let a = document.createElement("a");
                let button = document.createElement("button");
                
                if (Number.isInteger(i / 2) == true){
                    tr.style.backgroundColor = "rgb(247, 247, 247)";
                }
                tr.id = `${data[i].id}_tr`;
                td1.innerHTML = data[i].symbol;
                td2.innerHTML = data[i].company_name;
                td3.innerHTML = `$${ data[i].purchase_price.toFixed(2) }`;
                td4.innerHTML = latest_stock_price(data[i].symbol);
                td4.id = `${data[i].symbol}-price`;
                td6.innerHTML = data[i].shares;
                td7.innerHTML = "$0";
                td7.id = `${data[i].id}-total`;
                a.href = "https://iexcloud.io";
                a.innerHTML = "IEX Cloud";
                a.style.color = "rgb(42, 42, 218)";
                button.className = "bs2";
                button.type = "button";
                button.innerHTML = "Sell";
                button.addEventListener("click", sell);
                button.dataset.itemid = data[i].id;
                button.dataset.symbol = data[i].symbol;

                td5.append(a);
                td8.append(button);
                tr.append(td1, td2, td3, td4, td5, td6, td7, td8);

                document.querySelector('#activetrades_tbody').append(tr);
            }
        }
    })
    .catch(error => {
        display_message("error", error)
    })
}


function get_past_trades(page){
    /*
    Displays past trades of the user
    */

    loading("load");

    fetch(`/get_trades/${"past"}/${page}`)
    .then(response => response.json())
    .then(data => {
        const main_table = document.querySelector('#pasttrades_view table');
        const view = document.querySelector('#pasttrades_view');
        if (data.data.length == 0){
            if (!view.querySelector('#past_placeholder')){
                let p = document.createElement("p");
                p.innerText = "You have no past trade."
                p.style.fontSize = "13px";
                p.id = "past_placeholder";
                view.insertBefore(p, view.querySelector('.container-fluid'));
                main_table.style.display = "none";
                document.querySelector('#pg2').style.visibility = "hidden";
            }
        } else {
            if (view.querySelector('#past_placeholder')){
                view.querySelector('#past_placeholder').remove();
                main_table.style.display = "table";
                document.querySelector('#pg2').style.visibility = "visible";
            }
            // Clear the table first
            document.querySelector('#pasttrades_tbody').innerHTML = "";
            console.log(data.data[0]);
            for (let i = 0; i < data.data.length; i++){
                
                let d = data.data[i];
                let tr = document.createElement("tr");
                let td1 = document.createElement("td");
                let td2 = document.createElement("td");
                let td3 = document.createElement("td");
                let td4 = document.createElement("td");
                let td5 = document.createElement("td");
                let td6 = document.createElement("td");
                let td7 = document.createElement("td");
                let td8 = document.createElement("td");
                
                if (Number.isInteger(i / 2) == true){
                    tr.style.backgroundColor = "rgb(247, 247, 247)";
                }
                
                td1.innerHTML = d.symbol;
                td2.innerHTML = d.company_name;
                td3.innerHTML = d.shares;
                td4.innerHTML = `$${d.purchase_price.toFixed(2)}`;
                td5.innerHTML = `$${d.sell_price.toFixed(2)}`;
                td6.innerHTML = `$${d.total_in_dollars.toFixed(2)}`;
                td7.innerHTML = `$${parseFloat((
                                d.sell_price - d.purchase_price
                                ) * d.shares).toFixed(2)}`;
                td8.innerHTML = d.when;

                tr.append(td1, td2, td3, td4, td5, td6, td7, td8);
                document.querySelector("#pasttrades_tbody").append(tr);

                // Update pagination 
                let previous = document.querySelector('#previous_two');
                let next = document.querySelector('#next_two');
                let first = document.querySelector('#one_two');
                let second = document.querySelector('#two_two');
                let third = document.querySelector('#three_two');
                
                if (data.has_next == false){
                    next.parentElement.className = "page-item disabled";
                    second.parentElement.className = "page-item disabled";
                } else {
                    next.parentElement.className = "page-item";
                    second.parentElement.className = "page-item";
                }

                if (data.has_previous == false){
                    previous.parentElement.className = "page-item disabled";
                } else {
                    previous.parentElement.className = "page-item";
                }

                if (data.has_second == false){
                    third.parentElement.className = "page-item disabled";
                } else {
                    third.parentElement.className = "page-item";
                }

                // Update the page dataset
                previous.dataset.page = parseInt(page) - 1;
                first.dataset.page = page;
                second.dataset.page = parseInt(page) + 1;
                next.dataset.page = parseInt(page) + 1;
                third.dataset.page = parseInt(page) + 2;

                // Update the innertext
                first.innerHTML = first.dataset.page;
                second.innerHTML = second.dataset.page;
                third.innerHTML = third.dataset.page;
            }
        }
        loading("hide");
        document.querySelector('#stock').scrollIntoViewIfNeeded();
    })
    .catch(error => {
        loading("hide");
        document.querySelector('#stock').scrollIntoViewIfNeeded();
        display_message("error", error);
    })

}


function currency_converter(currency, number, area){
    /*
    Converts prices from GBP to USD and vice versa
    */

    /* https://exchangeratesapi.io*/
    fetch(`https://api.exchangeratesapi.io/latest?base=${currency}&symbols=USD,GBP`)
    .then(response => response.json())
    .then(data => {
        if (currency == "GBP"){
            let val = parseFloat((data.rates.USD * number).toFixed(2)).toLocaleString();

            // Update trading balance
            if (area == "balance"){
                document.querySelector('#td-bal').innerText = `$${val}`;
            }
        } else {
            let val = parseFloat((data.rates.GBP * number).toFixed(2)).toLocaleString();

            // Update trading balance
            if (area == "balance"){
                document.querySelector('#td-bal').innerText = `$${val}`;
            }
        }
    })
    .catch(error => {
        display_message("error", error);
    })
}


function sell(){
    /*
    Sell stocks
    */
    loading("load");
    let total = document.getElementById(`${this.dataset.itemid}-total`).innerText;
    let sell_price = document.querySelector(`#${this.dataset.symbol}-price`).innerText;

    // Convert the total
    fetch('https://api.exchangeratesapi.io/latest?base=USD&symbols=USD,GBP')
    .then(response => response.json())
    .then(info => {

        fetch('/sell', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrf
            },
            body: JSON.stringify({
                "item_id": parseInt(this.dataset.itemid),
                "total": undo_format(total.slice(1, total.length)) * info.rates.GBP,
                "total_in_dollars": undo_format(total.slice(1, total.length)),
                "sell_price": parseFloat(sell_price.slice(1, sell_price.length)),
            })
        })
        .then(response => response.json())
        .then(data => {
            // Remove from the active trades table
            document.getElementById(`${this.dataset.itemid}_tr`).remove();

            // Display message
            display_message(null, data.message);

            // Update the user's trading balance
            update_trading_balance();

            // Close view
            loading("hide");
            document.querySelector('#activetrades_view>div>a').click();
            document.querySelector('#stock').scrollIntoView();
        })
        .catch(error => {
            loading("hide");
            display_message("error", error);
        })
    })
}


function undo_format(x){
    /*
    Removes formatting
    */
   let b = ""; 
   x = x.toString();
   for (let i = 0; i < x.length; i++){
        if (x[i] != ","){
            b += x[i]; 
        }  
    };
    return parseFloat(b);
}


function loading(action){
    /*
    Implements loading
    */
    let loading = document.querySelector('#loading').style;
    let welcome = document.querySelector('#welcome').style;
    let body = document.querySelector('#row').style;
    let footer = document.querySelector('footer').style;
    let warning = document.querySelector('#warning').style;

    if (action == "load"){
        loading.display = "block";
        welcome.display = "none";
        body.display = "none";
        footer.display = "none";
        warning.display = "none";
    } else {
        loading.display = "none";
        welcome.display = "block";
        body.display = "block";
        footer.display = "block";
        warning.display = "block";
    }
}