from django.db import models
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from decouple import config
import json
from django.views.decorators.http import require_POST
from django.core.exceptions import ObjectDoesNotExist
from django.core.paginator import Paginator
from django.contrib.auth.decorators import login_required
from .models import User, Saving, Current, Help_To_Buy, Transaction, Trading, Trades, Watchlist
import random


def index(request):
    return render(request, "bankofjosh/index.html")


def register(request):

    """Register new user """

    if request.method == 'POST':

        firstname = request.POST["firstname"].capitalize()
        lastname = request.POST["lastname"].capitalize()
        username = request.POST["username"]
        password = request.POST["password"]
        email = request.POST["email"]
        question = request.POST["recover_question"]
        answer = request.POST["recover_answer"].lower()

        # Create user
        try:
            # Check if email is valid
            user =  User.objects.create_user(username, email, password)
            user.first_name = firstname
            user.last_name = lastname
            user.question = question
            user.answer = hash(answer)
            user.save()
        except IntegrityError:
            return render(request, "bankofjosh/register.html", {
                "message": "Username already taken."
            })

        login(request, user)
        return HttpResponseRedirect(reverse('myaccounts', args=("main",)))
    else:
        return render(request, "bankofjosh/register.html")


def confirm(request, username):
    """
    Checks if a username and email already exists
    """
    try:
        user = User.objects.get(username=username)
        return JsonResponse({
            "error": "Please select another username."
        }, status=500)
    except ObjectDoesNotExist: 
        return JsonResponse({
            "message": "Success."
        }, status=200)


@require_POST
def get_user(request):
    """
    Gets user details when changing password
    """
    data = json.loads(request.body)
    username = data.get("username")
    email = data.get("email")

    try:
        user = User.objects.get(username=username)
        # Check if emails match
        if email != user.email:
            return JsonResponse({
                "error": "Wrong username or email!"
                }, status=500)
        
        # Get security question
        return JsonResponse(user.question, safe=False)
    
    except ObjectDoesNotExist:
        return JsonResponse({
            "error": "Wrong username or email!"
            }, status=500)


@require_POST
def change_password(request):
    """
    Checks details before changing password
    """
    data = json.loads(request.body)
    username = data.get("username")
    answer = hash(data.get("answer").lower())
    password = data.get("password")

    try:
        user = User.objects.get(username=username)
        
        # Check security answer
        if answer != int(user.answer):
            return JsonResponse({
                "error": "Please check your details and try again."
            }, status=500)
        
        # Change the password
        user.set_password(password)
        user.save()
        return JsonResponse({
            "message": "Password changed!"
            }, status=201)

    except ObjectDoesNotExist:
        return JsonResponse({"error": "Error encountered!"}, status=500)


def login_view(request):
    
    """ Log a user in """

    if request.user.is_authenticated == True:
        return HttpResponseRedirect(reverse("index"))
    else:
        if request.method == "POST":

            username = request.POST["username"]
            password = request.POST["password"]

            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return HttpResponseRedirect(reverse("myaccounts", args=("main",)))
            else:
                return render(request, "bankofjosh/login.html", {
                    "error": "Incorrect Username / Password"
                })
        else:
            return render(request, "bankofjosh/login.html")


def getaccount(request, account_type, account_number):

    """ Returns account """

    if account_type != None:
        if account_type == "savings":
            try:
                account = request.user.has_savings.all()[0]
            except IndexError:
                account = None

        if account_type == "current":
            try:
                account = request.user.has_current.all()[0]
            except IndexError:
                account = None

        if account_type == "help-to-buy":
            try:
                account = request.user.has_htb.all()[0]
            except IndexError:
                account = None
        
        if account_type == "trading":
            try:
                account = Trading.objects.get(
                    user=User.objects.get(username=f"{request.user.username}-trading"
                    ))
            except ObjectDoesNotExist:
                account = None
        
        return account
    else:
        try:
            account = Saving.objects.get(
                account_number=account_number
                )
            return account
        except ObjectDoesNotExist:
            try:
                account = Current.objects.get(
                    account_number=account_number
                    )
                return account
            except ObjectDoesNotExist:
                try:
                    account = Help_To_Buy.objects.get(
                        account_number=account_number
                        )
                    return account
                except ObjectDoesNotExist:
                    return None


@login_required(login_url="login")
def myaccounts(request, validate):

    """ Render My accounts template """

    setup(request)

    firstname = request.user.first_name.capitalize()
    accounts = []
    # If user has Savings account
    savings = getaccount(request, "savings", None)
    accounts.append(savings)

    # If user has Current account
    current = getaccount(request, "current", None)
    accounts.append(current)

    # If user has HTB account
    htb = getaccount(request, "help-to-buy", None)
    accounts.append(htb)

    # Trading account
    trading = getaccount(request, "trading", None)
    accounts.append(trading)

    data = {
        "firstname": firstname,
        "accounts": accounts
    }

    if not validate == 'main':
        return data
    else:
        return render(request, "bankofjosh/myaccounts.html", {
            "data" : data,
            "key": config('IEX_API_KEY')
        })


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse('index'))


def setup(request):
    """ Sets user up """

    # Create a Trading account for the user
    if request.user.is_setup == False:
        username = f"{request.user.username}-trading"
        trading_user = User.objects.create_user(
            username=username, first_name="Trading", last_name="Account"
            )
        trading_user.save()

        # Input an entry in the Trading table
        t_account = Trading(user=User.objects.get(username=username))
        t_account.save()

        # Change is setup to true
        request.user.is_setup = True
        request.user.save()

    request.session["trading-id"] = User.objects.get(
        username=f"{request.user.username}-trading"
        ).id


@require_POST
def add_account(request):
    
    """ Add a new account for user """
    
    if request.method == 'POST':

        new_acct = random.randint(00000000, 100000000)
        new_sort = random.randint(000000, 1000000)

        c_sorts = Current.objects.all()
        s_sorts = Saving.objects.all()
        h_sorts = Help_To_Buy.objects.all()
        
        temp = []
        # All account numbers in list temp
        for account in c_sorts:
            temp.append(account.account_number)
        for account in s_sorts:
            temp.append(account.account_number)
        for account in h_sorts:
            temp.append(account.account_number)

        temp2 = []
        # All sort codes in list temp2
        for sort in c_sorts:
            temp2.append(sort.sort_code)
        for sort in s_sorts:
            temp2.append(sort.sort_code)
        for sort in h_sorts:
            temp2.append(sort.sort_code)

        while new_acct in temp:
            new_acct = random.randint(00000000, 100000000)
        while new_sort in temp2:
            new_sort = random.randint(000000, 1000000)

        account_type = request.POST["accounts"]
        if account_type == 'savings':
            account = Saving(
                    user=request.user, 
                    account_number=new_acct, 
                    sort_code=new_sort
                    )
        elif account_type == 'current':
            account = Current(
                    user=request.user, 
                    account_number=new_acct, 
                    sort_code=new_sort
                    )
        else:
            account = Help_To_Buy(
                    user=request.user, 
                    account_number=new_acct, 
                    sort_code=new_sort
                    )
        
        account.save()
        return HttpResponseRedirect(reverse('myaccounts', args=("main",)))
    else:
        return HttpResponseRedirect(reverse("myaccounts", args=("main",)))


def checkaccounts(request):

    """ Returns JSON response of account types of user """

    data = myaccounts(request, "json")
    temp = []
    for account in data["accounts"]:
        if account == None:
            temp.append(None)
        else:
            temp.append(account.account_type)
    return JsonResponse(temp, safe=False)


def save_transaction(request, user, from_or_to, account_type, 
    action, description, bal_after_trans, amount):
    """ 
    Saves Transactions
    """

    transaction = Transaction(
            user=user, 
            from_or_to=from_or_to,
            account_type=account_type, 
            action=action,
            description=description, 
            bal_after_trans=bal_after_trans, 
            amount=amount
            )
    transaction.save()


@login_required(login_url="login")
def transfer_between_accounts(request):
    
    """ Transfer between accounts """

    data = json.loads(request.body)

    # Get the user's accounts
    from_account = getaccount(request, data.get("from"), None)
    to_account = getaccount(request, data.get("to"), None)
    amount = data.get("amount")

    # If balance is less than amount
    if from_account.balance < amount:
        return JsonResponse({
            "error": "Balance not sufficient!"
            }, status=500)
    else:
        # Debit send from account
        new_balance = from_account.balance - amount
        from_account.balance = new_balance
        from_account.save()

        # Update send to account
        to_account.balance = to_account.balance + amount
        to_account.save()

        # Enter debit in Transactions table
        save_transaction(request, request.user, request.user, 
                        data.get("from"), False, "", new_balance, amount)

        # Enter credit in Transactions table
        save_transaction(request, request.user, request.user, 
                        data.get("to"), True, "", to_account.balance, amount)

        return JsonResponse({"message": "Transaction completed!"}, status=200)


def update_balances(request, account_type):

    """ Returns latest user balances """

    account = getaccount(request, account_type, None)
    return JsonResponse({"data": account.balance})


@require_POST
@login_required(login_url="login")
def transfer_external_account(request):
    
    data = json.loads(request.body)
    firstname = data.get("firstname").capitalize()
    lastname = data.get("lastname").capitalize()
    sortcode = int(data.get("sortcode"))
    accountnumber = int(data.get("accountnumber"))
    debit_account = data.get("debit_account")
    description = data.get("description")
    amount = data.get("amount")

    # Check if account exists
    recipient_account = getaccount(request, None, accountnumber)
    if recipient_account == None:
        return JsonResponse({
            "error": "Error completing transaction!"
        }, status=500)
    else:
        # If sortcode matches account number
        if sortcode != recipient_account.sort_code:
            return JsonResponse({
                "error": "Error completing transaction!"
            }, status=500)

        # If firstname does not match firstname on the account
        if firstname != recipient_account.user.first_name:
            return JsonResponse({
                "error": "Error completing transaction!"
            }, status=500)

        # If last name does not match name on account
        if lastname != recipient_account.user.last_name:
            return JsonResponse({
                "error": "Error completing transaction!"
            }, status=500)

        # If user does not have enough balance
        sender_account = getaccount(request, debit_account, None)
        if sender_account.balance < amount:
            return JsonResponse({
                "error": "Insufficient balance for this transaction!"
            }, status=500)
        
        # Debit the sender
        sender_account.balance = sender_account.balance - amount
        sender_account.save()

        # Credit the recipient
        recipient_account.balance = recipient_account.balance + amount
        recipient_account.save()

        # Insert into the Transaction table
        save_transaction(request, request.user, recipient_account.user, debit_account, 
                        False, description, sender_account.balance, amount)
        
        save_transaction(request, recipient_account.user, sender_account.user, recipient_account.account_type, 
                        True, description, recipient_account.balance, amount)

        return JsonResponse({
            "message": "Transaction completed!"
            }, status=200)


def get_transactions(request, account_type, index):

    """ Gets transaction history of the account """
    
    transactions = request.user.transactions.filter(account_type=account_type).order_by('-when')

    if transactions is not None:
        temp =[]
        for item in transactions:
            if item.action == False:
                amount = f"-£{item.amount}"
            else:
                amount = f"+£{item.amount}"

            el = {
                "from": f"{item.from_or_to.first_name.capitalize()} {item.from_or_to.last_name.capitalize()}",
                "amount": amount,
                "description": item.description,
                "balance":  "£"'{:,.2f}'.format(item.bal_after_trans),
                "date": item.when.strftime("%I:%M%p %d-%b-%y")
            }
            temp.append(el)

        # Paginator
        p = Paginator(temp, 10)
        page = p.page(index)
        has_second = False

        if page.has_next() == True:

            next_page = p.page(index + 1)
            if next_page.has_next() == True:
                has_second = True
            else:
                has_second = False
            next_page = True
        else:
            next_page = False
           
        value = {
            "data": page.object_list,
            "has_previous": page.has_previous(),
            "has_next": next_page,
            "has_second": has_second
        }
        return JsonResponse(value)


@login_required(login_url="login")
@require_POST
def deposit(request):

    """
    Deposit into the Trading account
    """

    data = json.loads(request.body)
    amount = data.get("amount")
    credit_account = getaccount(request, "trading", None)
    debit_account = getaccount(request, data.get("account"), None)

    # If the balance is not sufficient
    if debit_account.balance < amount:
        return JsonResponse({
            "error": "Balance not sufficient for this transaction!"
            }, status=500)
    
    # Carry out transaction
    debit_account.balance = debit_account.balance - amount
    debit_account.save()

    credit_account.balance = credit_account.balance + amount
    credit_account.save()

    # Update Transaction table
    save_transaction(request, debit_account.user, credit_account.user, debit_account.account_type, 
                        False, "Trading Deposit", debit_account.balance, amount)

    save_transaction(request, credit_account.user, debit_account.user, credit_account.account_type, 
                        True, "Trading Deposit", credit_account.balance, amount)

    return JsonResponse({
        "message": "Deposited!"
        }, status=201)


@require_POST
@login_required(login_url="login")
def withdraw(request):

    """
    Withdraw from the Trading account
    """

    data = json.loads(request.body)
    amount = data.get("amount")
    withdraw_from = getaccount(request, "trading", None)
    withdraw_to = getaccount(request, data.get("account"), None)

    # If the balance is not sufficient
    if withdraw_from.balance < amount:
        return JsonResponse({
            "error":"Balance not sufficient for this transaction!"
            }, status=500)

    # Carry out transaction
    withdraw_from.balance = withdraw_from.balance - amount
    withdraw_from.save()

    withdraw_to.balance = withdraw_to.balance + amount
    withdraw_to.save()

    # Update Transaction table
    save_transaction(request, withdraw_from.user, withdraw_to.user, withdraw_from.account_type, 
                        False, "Trading Withdrawal", withdraw_from.balance, amount)

    save_transaction(request, withdraw_to.user, withdraw_to.user, withdraw_to.account_type, 
                        True, "Trading Withdrawal", withdraw_to.balance, amount)

    return JsonResponse({
        "message": "Withdrawal successful!"
        }, status=201)


@require_POST
@login_required(login_url="login")
def place_trade(request):

    """ 
    Places trade for the user
    """
    data = json.loads(request.body)

    user = User.objects.get(id=request.session["trading-id"])
    symbol = data.get("symbol")
    company_name = data.get("company_name")
    purchase_price = data.get("purchase_price")
    converted_price = data.get("converted_price")
    shares = data.get("shares")
    active = True
    trading_account = user.trading_account.all()[0]

    # If the user has 5 or more trades
    if len(user.get_trades.filter(active=True)) >= 5:
        return JsonResponse({
            "error": "Not more than 5 trades at a time!"
            }, status=500)

    # If the user cannot afford to place the trade
    if converted_price * shares > trading_account.balance:
        return JsonResponse({
            "error": "Insufficient balance for this transaction!"
            }, status=500)

    # Enter in the Trades table
    trade = Trades(
        user=user, 
        symbol=symbol, 
        company_name=company_name,
        purchase_price=purchase_price,
        shares=shares,
        active=active
        )
    trade.save()

    # Deduct amount from trading account
    trading_account.balance = trading_account.balance - (converted_price * shares)
    trading_account.save()

    return JsonResponse({
        "message": "Trade placed!"
        }, status=201)


@require_POST
@login_required(login_url="login")
def sell(request):

    """
    Sells shares already bought
    """

    data = json.loads(request.body)
    item = Trades.objects.get(id=data.get("item_id"))
    total = data.get("total")
    total_in_dollars = data.get("total_in_dollars")
    sell_price = data.get("sell_price")
    trading_account = getaccount(request, "trading", None)

    # Update sell price
    item.active = False
    item.total_in_dollars = total_in_dollars
    item.sell_price = sell_price
    item.save()

    # Add to the Trading balance
    trading_account.balance = trading_account.balance + total
    trading_account.save()

    return JsonResponse({
        "message":"Sold!"
        }, status=200)


@login_required(login_url="login")
def get_trades(request, state, index):

    """ 
    Returns active trades
    """
    if state == "active":
        trades = Trades.objects.filter(
            user=User.objects.get(id=request.session["trading-id"]),
            active=True
            ).values().order_by("-when")
        return JsonResponse(list(trades), safe=False)
    else:
        trades = Trades.objects.filter(
            user=User.objects.get(id=request.session["trading-id"]),
            active=False
        ).order_by("-when")

        temp = []
        for trade in trades:
            t = {
                "symbol": trade.symbol,
                "company_name": trade.company_name,
                "shares": trade.shares,
                "purchase_price": trade.purchase_price,
                "sell_price": trade.sell_price,
                "total_in_dollars": trade.total_in_dollars,
                "when": trade.when.strftime("%I:%M%p %d-%b-%y")
            }
            temp.append(t)
        
        # Paginator
        p = Paginator(temp, 5)
        page = p.page(index)
        has_second = False

        if page.has_next() == True:

            next_page = p.page(index + 1)
            if next_page.has_next() == True:
                has_second = True
            else:
                has_second = False
            next_page = True
        else:
            next_page = False
           
        value = {
            "data": page.object_list,
            "has_previous": page.has_previous(),
            "has_next": next_page,
            "has_second": has_second
        }
        return JsonResponse(value)


@login_required(login_url="login")
def get_watchlist_stocks(request):
    """
    Returns watchlist stocks
    """
    stocks = User.objects.get(
        id=request.session["trading-id"]
        ).get_watchlist_stocks.all().values().order_by('-when')
    return JsonResponse(list(stocks), safe=False)


@require_POST
@login_required(login_url="login")
def modify_watchlist(request, action):
    """
    Adds and deletes from the watchlist
    """
    data = json.loads(request.body)
    symbol = data.get("symbol")
    company_name = data.get("company_name")

    if action == 'remove':
        stock = User.objects.get(
            id=request.session["trading-id"]
            ).get_watchlist_stocks.filter(symbol=symbol)[0]
        stock.delete()

        return JsonResponse({
            "message": "Stock removed!"
            }, status=201)
    else:
        # Check if item is not already in table
        user = User.objects.get(id=request.session["trading-id"])
        try:
            stock = user.get_watchlist_stocks.filter(symbol=symbol)[0]
            return JsonResponse({
                "error": "Stock already in watchlist!"
                }, status=500)

        except IndexError:

            # If watchlist stocks are 5
            if len(user.get_watchlist_stocks.all()) == 5:
                return JsonResponse({
                    "error": "Maximum of 5 stocks allowed!"
                    }, status=500)

            # Add to watchlist
            stock = Watchlist(
                user=user, 
                symbol=symbol, 
                company_name=company_name
                )
            stock.save()

            return JsonResponse({
                "message": "Added to watchlist!"
                }, status=201)